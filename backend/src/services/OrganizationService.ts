import { Pool } from 'pg';
import { Logger } from '../utils/Logger';
import { 
  Organization, 
  OrganizationUser, 
  OrganizationStats,
  TenantContext,
  UserRole,
  PatientCaregiver,
  OnboardingStatus
} from '../types/MultiTenant';

/**
 * Enhanced Organization Service for Healthcare SaaS
 * Handles all user types, registration flows, and multi-tenant operations
 */
export class OrganizationService {
  private db: Pool;
  private logger: Logger;

  constructor(db: Pool, logger: Logger) {
    this.db = db;
    this.logger = logger;
  }

  /**
   * Create a new healthcare organization
   */
  async createOrganization(data: Partial<Organization>): Promise<Organization> {
    this.logger.info('Creating healthcare organization', { 
      name: data.name, 
      type: data.type 
    });

    const client = await this.db.connect();
    
    try {
      await client.query('BEGIN');

      // Validate required fields
      if (!data.name || !data.slug || !data.type || !data.address || !data.contactInfo) {
        throw new Error('Missing required organization fields');
      }

      // Check slug uniqueness
      const existingOrg = await client.query(
        'SELECT id FROM organizations WHERE slug = $1',
        [data.slug]
      );

      if (existingOrg.rows.length > 0) {
        throw new Error(`Organization slug '${data.slug}' already exists`);
      }

      // Insert organization
      const orgResult = await client.query(`
        INSERT INTO organizations (
          name, slug, type, subtype, size, address, contact_info,
          license_number, tax_id, npi_number, accreditation,
          logo_url, website, brand_colors, settings, features_enabled,
          subscription_plan, subscription_status, onboarding_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        RETURNING *
      `, [
        data.name,
        data.slug,
        data.type,
        data.subtype || null,
        data.size || 'small',
        JSON.stringify(data.address),
        JSON.stringify(data.contactInfo),
        data.licenseNumber || null,
        data.taxId || null,
        data.npiNumber || null,
        JSON.stringify(data.accreditation || []),
        data.logoUrl || null,
        data.website || null,
        JSON.stringify(data.brandColors || {}),
        JSON.stringify(data.settings || {}),
        JSON.stringify(data.featuresEnabled || []),
        data.subscriptionPlan || 'trial',
        data.subscriptionStatus || 'trial',
        'pending'
      ]);

      const organization = orgResult.rows[0];

      // Create default departments based on organization type
      await this.createDefaultDepartments(client, organization.id, data.type);

      // Create organization domain
      if (data.slug) {
        await client.query(`
          INSERT INTO organization_domains (organization_id, domain, is_primary, is_verified)
          VALUES ($1, $2, true, false)
        `, [organization.id, `${data.slug}.agentcare.com`]);
      }

      await client.query('COMMIT');

      this.logger.info('Organization created successfully', { 
        id: organization.id,
        name: organization.name,
        type: organization.type
      });

      return this.formatOrganization(organization);
    } catch (error) {
      await client.query('ROLLBACK');
      this.logger.error('Failed to create organization', { data, error });
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Register a healthcare provider
   */
  async registerProvider(organizationId: string, data: {
    email: string;
    name: string;
    role: string;
    specialties?: string[];
    licenseNumber?: string;
    licenseState?: string;
    deaNumber?: string;
    npiNumber?: string;
    department?: string;
    employmentType?: string;
  }): Promise<{ user: any, organizationUser: OrganizationUser }> {
    this.logger.info('Registering healthcare provider', { 
      organizationId, 
      email: data.email,
      role: data.role 
    });

    const client = await this.db.connect();
    
    try {
      await client.query('BEGIN');
      await client.query('SELECT set_tenant_context($1)', [organizationId]);

      // Check if user already exists in this organization
      const existingUser = await client.query(`
        SELECT u.id FROM users u 
        WHERE u.email = $1 AND u.organization_id = $2
      `, [data.email, organizationId]);

      if (existingUser.rows.length > 0) {
        throw new Error('Provider with this email already exists in organization');
      }

      // Get role information
      const roleResult = await client.query(
        'SELECT id, category, level FROM user_roles WHERE name = $1',
        [data.role]
      );

      if (roleResult.rows.length === 0) {
        throw new Error(`Invalid role: ${data.role}`);
      }

      const role = roleResult.rows[0];

      // Create user account
      const userResult = await client.query(`
        INSERT INTO users (
          email, name, organization_id, user_type, is_verified
        ) VALUES ($1, $2, $3, $4, false)
        RETURNING *
      `, [data.email, data.name, organizationId, 'provider']);

      const user = userResult.rows[0];

      // Create organization user record
      const orgUserResult = await client.query(`
        INSERT INTO organization_users (
          organization_id, user_id, primary_role_id, department, 
          specialties, license_number, license_state, dea_number, 
          npi_number, employment_type, is_active, is_verified
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, false)
        RETURNING *
      `, [
        organizationId,
        user.id,
        role.id,
        data.department || null,
        JSON.stringify(data.specialties || []),
        data.licenseNumber || null,
        data.licenseState || null,
        data.deaNumber || null,
        data.npiNumber || null,
        data.employmentType || 'full_time'
      ]);

      const organizationUser = orgUserResult.rows[0];

      await client.query('COMMIT');

      this.logger.info('Provider registered successfully', { 
        userId: user.id,
        organizationId,
        role: data.role
      });

      return {
        user,
        organizationUser: this.formatOrganizationUser(organizationUser)
      };
    } catch (error) {
      await client.query('ROLLBACK');
      this.logger.error('Failed to register provider', { organizationId, data, error });
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Register a patient
   */
  async registerPatient(organizationId: string, data: {
    email: string;
    name: string;
    dateOfBirth: Date;
    gender?: string;
    phone?: string;
    address?: any;
    emergencyContact?: any;
    insuranceInfo?: any;
    preferredLanguage?: string;
    medicalRecordNumber?: string;
  }): Promise<any> {
    this.logger.info('Registering patient', { 
      organizationId, 
      email: data.email 
    });

    const client = await this.db.connect();
    
    try {
      await client.query('BEGIN');
      await client.query('SELECT set_tenant_context($1)', [organizationId]);

      // Check if patient already exists
      const existingUser = await client.query(`
        SELECT id FROM users 
        WHERE email = $1 AND organization_id = $2
      `, [data.email, organizationId]);

      if (existingUser.rows.length > 0) {
        throw new Error('Patient with this email already exists');
      }

      // Generate medical record number if not provided
      let medicalRecordNumber = data.medicalRecordNumber;
      if (!medicalRecordNumber) {
        const orgResult = await client.query(
          'SELECT slug FROM organizations WHERE id = $1',
          [organizationId]
        );
        const orgSlug = orgResult.rows[0]?.slug?.toUpperCase() || 'ORG';
        const timestamp = Date.now().toString().slice(-6);
        medicalRecordNumber = `${orgSlug}-${timestamp}`;
      }

      // Create patient user
      const userResult = await client.query(`
        INSERT INTO users (
          email, name, organization_id, user_type, date_of_birth,
          gender, phone, address, emergency_contact, insurance_info,
          preferred_language, medical_record_number, is_verified
        ) VALUES ($1, $2, $3, 'patient', $4, $5, $6, $7, $8, $9, $10, $11, false)
        RETURNING *
      `, [
        data.email,
        data.name,
        organizationId,
        data.dateOfBirth,
        data.gender || null,
        data.phone || null,
        JSON.stringify(data.address || {}),
        JSON.stringify(data.emergencyContact || {}),
        JSON.stringify(data.insuranceInfo || {}),
        data.preferredLanguage || 'en',
        medicalRecordNumber
      ]);

      const user = userResult.rows[0];

      // Get patient role
      const roleResult = await client.query(
        'SELECT id FROM user_roles WHERE name = $1',
        ['patient']
      );

      // Create organization user record
      await client.query(`
        INSERT INTO organization_users (
          organization_id, user_id, primary_role_id, is_active
        ) VALUES ($1, $2, $3, true)
      `, [organizationId, user.id, roleResult.rows[0].id]);

      await client.query('COMMIT');

      this.logger.info('Patient registered successfully', { 
        userId: user.id,
        organizationId,
        medicalRecordNumber
      });

      return user;
    } catch (error) {
      await client.query('ROLLBACK');
      this.logger.error('Failed to register patient', { organizationId, data, error });
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Add caregiver relationship for patient
   */
  async addCaregiver(organizationId: string, data: {
    patientId: string;
    caregiverEmail: string;
    caregiverName: string;
    relationshipType: string;
    authorizationLevel: string;
    canScheduleAppointments?: boolean;
    canReceiveMedicalInfo?: boolean;
    canMakeMedicalDecisions?: boolean;
    authorizedBy: string;
  }): Promise<PatientCaregiver> {
    this.logger.info('Adding caregiver relationship', { 
      organizationId, 
      patientId: data.patientId,
      caregiverEmail: data.caregiverEmail,
      relationshipType: data.relationshipType
    });

    const client = await this.db.connect();
    
    try {
      await client.query('BEGIN');
      await client.query('SELECT set_tenant_context($1)', [organizationId]);

      // Check if caregiver user exists, create if not
      let caregiverResult = await client.query(`
        SELECT id FROM users 
        WHERE email = $1 AND organization_id = $2
      `, [data.caregiverEmail, organizationId]);

      let caregiverId: string;

      if (caregiverResult.rows.length === 0) {
        // Create caregiver user
        const newCaregiverResult = await client.query(`
          INSERT INTO users (
            email, name, organization_id, user_type, is_verified
          ) VALUES ($1, $2, $3, 'caregiver', false)
          RETURNING id
        `, [data.caregiverEmail, data.caregiverName, organizationId]);

        caregiverId = newCaregiverResult.rows[0].id;

        // Get caregiver role and create organization user
        const roleResult = await client.query(
          'SELECT id FROM user_roles WHERE name = $1',
          ['caregiver']
        );

        await client.query(`
          INSERT INTO organization_users (
            organization_id, user_id, primary_role_id, is_active
          ) VALUES ($1, $2, $3, true)
        `, [organizationId, caregiverId, roleResult.rows[0].id]);
      } else {
        caregiverId = caregiverResult.rows[0].id;
      }

      // Create caregiver relationship
      const relationshipResult = await client.query(`
        INSERT INTO patient_caregivers (
          organization_id, patient_id, caregiver_id, relationship_type,
          authorization_level, can_schedule_appointments, can_receive_medical_info,
          can_make_medical_decisions, authorized_by, authorized_at, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, true)
        RETURNING *
      `, [
        organizationId,
        data.patientId,
        caregiverId,
        data.relationshipType,
        data.authorizationLevel,
        data.canScheduleAppointments || false,
        data.canReceiveMedicalInfo || false,
        data.canMakeMedicalDecisions || false,
        data.authorizedBy
      ]);

      await client.query('COMMIT');

      this.logger.info('Caregiver relationship added successfully', { 
        patientId: data.patientId,
        caregiverId,
        relationshipType: data.relationshipType
      });

      return this.formatPatientCaregiver(relationshipResult.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      this.logger.error('Failed to add caregiver', { organizationId, data, error });
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get organization onboarding status
   */
  async getOnboardingStatus(organizationId: string): Promise<OnboardingStatus> {
    const client = await this.db.connect();
    
    try {
      const result = await client.query(`
        SELECT 
          onboarding_status,
          (SELECT COUNT(*) FROM organization_users WHERE organization_id = $1 AND is_active = true) as user_count,
          (SELECT COUNT(*) FROM users WHERE organization_id = $1 AND user_type = 'provider') as provider_count,
          (SELECT COUNT(*) FROM users WHERE organization_id = $1 AND user_type = 'patient') as patient_count
        FROM organizations WHERE id = $1
      `, [organizationId]);

      const org = result.rows[0];
      const userCount = parseInt(org.user_count);
      const providerCount = parseInt(org.provider_count);
      const patientCount = parseInt(org.patient_count);

      const steps = ['organization', 'admin_user', 'settings', 'providers', 'billing'];
      const completedSteps: string[] = ['organization']; // Organization created

      if (userCount > 0) completedSteps.push('admin_user');
      if (providerCount > 0) completedSteps.push('providers');
      
      const currentStep = completedSteps.length < steps.length 
        ? steps[completedSteps.length] 
        : 'complete';

      return {
        step: currentStep as any,
        completedSteps,
        currentStep,
        totalSteps: steps.length,
        isComplete: completedSteps.length === steps.length,
        organizationId
      };
    } finally {
      client.release();
    }
  }

  /**
   * Get organization statistics
   */
  async getOrganizationStats(organizationId: string): Promise<OrganizationStats> {
    const client = await this.db.connect();
    
    try {
      await client.query('SELECT set_tenant_context($1)', [organizationId]);

      const result = await client.query(`
        SELECT 
          (SELECT COUNT(*) FROM users WHERE organization_id = $1) as total_users,
          (SELECT COUNT(*) FROM users WHERE organization_id = $1 AND user_type = 'provider') as total_providers,
          (SELECT COUNT(*) FROM users WHERE organization_id = $1 AND user_type = 'patient') as total_patients,
          (SELECT COUNT(*) FROM appointments WHERE organization_id = $1 AND DATE_TRUNC('month', scheduled_at) = DATE_TRUNC('month', CURRENT_DATE)) as appointments_this_month,
          (SELECT COUNT(*) FROM appointments WHERE organization_id = $1 AND DATE_TRUNC('month', scheduled_at) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')) as appointments_last_month
      `, [organizationId]);

      const stats = result.rows[0];

      return {
        totalUsers: parseInt(stats.total_users),
        totalProviders: parseInt(stats.total_providers),
        totalPatients: parseInt(stats.total_patients),
        appointmentsThisMonth: parseInt(stats.appointments_this_month),
        appointmentsLastMonth: parseInt(stats.appointments_last_month),
        averageRating: 4.5, // Would calculate from actual ratings
        subscriptionStatus: 'active',
        storageUsed: 0, // Would calculate from file storage
        storageLimit: 1000
      };
    } finally {
      client.release();
    }
  }

  /**
   * Create default departments for organization type
   */
  private async createDefaultDepartments(client: any, organizationId: string, type: string): Promise<void> {
    const departmentsByType: Record<string, string[]> = {
      hospital: [
        'Emergency Department',
        'Internal Medicine',
        'Surgery',
        'Cardiology',
        'Orthopedics',
        'Radiology',
        'Laboratory',
        'Pharmacy',
        'Administration'
      ],
      clinic: [
        'Family Medicine',
        'Administration',
        'Laboratory'
      ],
      specialty_center: [
        'Clinical Services',
        'Administration'
      ],
      urgent_care: [
        'Urgent Care',
        'Administration'
      ]
    };

    const departments = departmentsByType[type] || ['General', 'Administration'];

    for (const dept of departments) {
      await client.query(`
        INSERT INTO organization_departments (
          organization_id, name, department_type, is_active
        ) VALUES ($1, $2, $3, true)
      `, [organizationId, dept, dept === 'Administration' ? 'administrative' : 'clinical']);
    }
  }

  // Formatting helper methods
  private formatOrganization(row: any): Organization {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      type: row.type,
      address: row.address,
      contactInfo: row.contact_info,
      logoUrl: row.logo_url,
      website: row.website,
      licenseNumber: row.license_number,
      accreditation: row.accreditation,
      settings: row.settings,
      featuresEnabled: row.features_enabled || [],
      subscriptionPlan: row.subscription_plan,
      subscriptionStatus: row.subscription_status,
      subscriptionExpiresAt: row.subscription_expires_at,
      isActive: row.is_active,
      isVerified: row.is_verified || false,
      onboardingStatus: row.onboarding_status || 'pending',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      onboardedAt: row.onboarded_at,
      onboardedBy: row.onboarded_by
    };
  }

  private formatOrganizationUser(row: any): OrganizationUser {
    return {
      id: row.id,
      organizationId: row.organization_id,
      userId: row.user_id,
      role: row.primary_role_id, // This would be resolved to role name
      permissions: row.custom_permissions || [],
      department: row.department,
      employeeId: row.employee_id,
      hireDate: row.hire_date,
      isActive: row.is_active,
      isVerified: row.is_verified || false,
      accessLevel: row.access_level || 1,
      requires2FA: row.requires_2fa || false,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private formatPatientCaregiver(row: any): PatientCaregiver {
    return {
      id: row.id,
      organizationId: row.organization_id,
      patientId: row.patient_id,
      caregiverId: row.caregiver_id,
      relationshipType: row.relationship_type,
      isPrimary: row.is_primary,
      isEmergencyContact: row.is_emergency_contact,
      authorizationLevel: row.authorization_level,
      authorizedActions: row.authorized_actions,
      authorizedBy: row.authorized_by,
      canScheduleAppointments: row.can_schedule_appointments,
      canReceiveMedicalInfo: row.can_receive_medical_info,
      canMakeMedicalDecisions: row.can_make_medical_decisions,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  /**
   * Find organization by ID
   */
  async findById(id: string): Promise<Organization | null> {
    const client = await this.db.connect();
    
    try {
      const result = await client.query(`
        SELECT * FROM organizations WHERE id = $1
      `, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      return this.formatOrganization(result.rows[0]);
    } finally {
      client.release();
    }
  }
} 