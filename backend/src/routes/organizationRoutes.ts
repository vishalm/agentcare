import { Router } from 'express';
import { OrganizationService } from '../services/OrganizationService';
import { MultiTenantService } from '../services/MultiTenantService';
import { Logger } from '../utils/Logger';

/**
 * Healthcare SaaS Organization Routes
 * Handles organization management, user registration, and multi-tenant operations
 */
export function createOrganizationRoutes(
  organizationService: OrganizationService,
  multiTenantService: MultiTenantService,
  logger: Logger
): Router {
  const router = Router();

  // Organization Management Routes
  
  /**
   * @swagger
   * /organizations:
   *   post:
   *     tags: [Organizations]
   *     summary: Create a new healthcare organization
   *     description: |
   *       Creates a new healthcare organization with complete multi-tenant setup.
   *       Automatically generates organization slug, sets up initial configuration,
   *       and creates the admin user account.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [name, type, address, contactInfo, adminUser]
   *             properties:
   *               name:
   *                 type: string
   *                 description: Organization name
   *                 example: "General Hospital"
   *               slug:
   *                 type: string
   *                 description: URL-friendly identifier (auto-generated if not provided)
   *                 example: "general-hospital"
   *               type:
   *                 type: string
   *                 enum: [hospital, clinic, specialty_center, urgent_care, telehealth, diagnostic_center]
   *                 description: Type of healthcare organization
   *                 example: "hospital"
   *               size:
   *                 type: string
   *                 enum: [small, medium, large, enterprise]
   *                 description: Organization size
   *                 example: "large"
   *               address:
   *                 $ref: '#/components/schemas/Address'
   *               contactInfo:
   *                 $ref: '#/components/schemas/ContactInfo'
   *               businessHours:
   *                 $ref: '#/components/schemas/BusinessHours'
   *               timezone:
   *                 type: string
   *                 description: Organization timezone
   *                 example: "America/Los_Angeles"
   *               subscriptionTier:
   *                 type: string
   *                 enum: [basic, professional, enterprise]
   *                 description: Subscription tier
   *                 example: "professional"
   *               adminUser:
   *                 type: object
   *                 required: [email, name]
   *                 properties:
   *                   email:
   *                     type: string
   *                     format: email
   *                     description: Admin user email
   *                     example: "admin@generalhospital.com"
   *                   name:
   *                     type: string
   *                     description: Admin user full name
   *                     example: "Hospital Administrator"
   *                   phone:
   *                     type: string
   *                     description: Admin user phone number
   *                     example: "+1-555-0101"
   *           examples:
   *             hospital:
   *               summary: Large Hospital Example
   *               value:
   *                 name: "General Hospital"
   *                 type: "hospital"
   *                 size: "large"
   *                 address:
   *                   street: "123 Medical Center Dr"
   *                   city: "Healthcare City"
   *                   state: "CA"
   *                   zip: "90210"
   *                   country: "USA"
   *                 contactInfo:
   *                   phone: "+1-555-0100"
   *                   email: "admin@generalhospital.com"
   *                   website: "https://generalhospital.com"
   *                 businessHours:
   *                   monday: { open: "07:00", close: "19:00" }
   *                   tuesday: { open: "07:00", close: "19:00" }
   *                   wednesday: { open: "07:00", close: "19:00" }
   *                   thursday: { open: "07:00", close: "19:00" }
   *                   friday: { open: "07:00", close: "19:00" }
   *                   saturday: { open: "08:00", close: "17:00" }
   *                   sunday: { closed: true }
   *                 timezone: "America/Los_Angeles"
   *                 subscriptionTier: "professional"
   *                 adminUser:
   *                   email: "admin@generalhospital.com"
   *                   name: "Hospital Administrator"
   *                   phone: "+1-555-0101"
   *             clinic:
   *               summary: Medical Clinic Example
   *               value:
   *                 name: "Family Care Clinic"
   *                 type: "clinic"
   *                 size: "medium"
   *                 address:
   *                   street: "456 Healthcare Ave"
   *                   city: "Medical City"
   *                   state: "TX"
   *                   zip: "75001"
   *                   country: "USA"
   *                 contactInfo:
   *                   phone: "+1-555-0200"
   *                   email: "admin@familycare.com"
   *                 subscriptionTier: "basic"
   *                 adminUser:
   *                   email: "admin@familycare.com"
   *                   name: "Clinic Manager"
   *     responses:
   *       201:
   *         description: Organization created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     organization:
   *                       $ref: '#/components/schemas/Organization'
   *                     adminUser:
   *                       type: object
   *                       properties:
   *                         id:
   *                           type: string
   *                           format: uuid
   *                         email:
   *                           type: string
   *                           format: email
   *                         temporaryPassword:
   *                           type: string
   *                           description: Temporary password for first login
   *             examples:
   *               created:
   *                 summary: Successful Creation
   *                 value:
   *                   success: true
   *                   data:
   *                     organization:
   *                       id: "550e8400-e29b-41d4-a716-446655440000"
   *                       name: "General Hospital"
   *                       slug: "general-hospital"
   *                       type: "hospital"
   *                       onboardingStatus: "pending"
   *                       createdAt: "2024-01-15T10:00:00Z"
   *                     adminUser:
   *                       id: "user-550e8400-e29b-41d4-a716-446655440001"
   *                       email: "admin@generalhospital.com"
   *                       temporaryPassword: "temp_secure_123"
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       409:
   *         description: Organization slug already exists
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *             example:
   *               success: false
   *               error:
   *                 code: "DUPLICATE_ENTRY"
   *                 message: "Organization slug 'general-hospital' already exists"
   *       500:
   *         description: Internal server error
   */
  router.post('/', async (req, res) => {
    try {
      const {
        name,
        slug,
        type,
        subtype,
        size,
        address,
        contactInfo,
        licenseNumber,
        website,
        adminUser
      } = req.body;

      // Validate required fields
      if (!name || !slug || !type || !address || !contactInfo) {
        return res.status(400).json({
          error: 'Missing required fields',
          required: ['name', 'slug', 'type', 'address', 'contactInfo']
        });
      }

      // Create organization
      const organization = await organizationService.createOrganization({
        name,
        slug,
        type,
        subtype,
        size,
        address,
        contactInfo,
        licenseNumber,
        website
      });

      // Create admin user if provided
      if (adminUser) {
        await organizationService.registerProvider(organization.id, {
          email: adminUser.email,
          name: adminUser.name,
          role: 'organization_owner',
          department: 'Administration'
        });
      }

      logger.info('Organization created via API', { 
        organizationId: organization.id,
        name: organization.name,
        type: organization.type
      });

      res.status(201).json({
        success: true,
        data: {
          organization,
          onboardingUrl: `/onboarding/${organization.id}`,
          domain: `${organization.slug}.agentcare.com`
        }
      });
    } catch (error) {
      logger.error('Failed to create organization via API', { error });
      res.status(400).json({
        error: error.message || 'Failed to create organization'
      });
    }
  });

  /**
   * @swagger
   * /organizations/{organizationId}:
   *   get:
   *     tags: [Organizations]
   *     summary: Get organization details
   *     description: |
   *       Retrieves detailed information about a specific healthcare organization.
   *       Includes configuration, settings, and current status.
   *     parameters:
   *       - $ref: '#/components/parameters/OrganizationId'
   *     responses:
   *       200:
   *         description: Organization details retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Organization'
   *             example:
   *               success: true
   *               data:
   *                 id: "550e8400-e29b-41d4-a716-446655440000"
   *                 name: "General Hospital"
   *                 slug: "general-hospital"
   *                 type: "hospital"
   *                 size: "large"
   *                 onboardingStatus: "completed"
   *                 subscriptionTier: "professional"
   *                 isActive: true
   *                 createdAt: "2024-01-15T10:00:00Z"
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *     security:
   *       - BearerAuth: []
   */
  router.get('/:id', multiTenantService.resolveTenantMiddleware(), async (req, res) => {
    try {
      const { id } = req.params;
      const organization = await organizationService.findById(id);

      if (!organization) {
        return res.status(404).json({
          error: 'Organization not found'
        });
      }

      res.json({
        success: true,
        data: organization
      });
    } catch (error) {
      logger.error('Failed to get organization', { error });
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  });

  /**
   * @swagger
   * /organizations/{organizationId}/stats:
   *   get:
   *     tags: [Analytics]
   *     summary: Get organization statistics
   *     description: |
   *       Retrieves comprehensive statistics for a healthcare organization including
   *       user counts, appointment metrics, and performance indicators.
   *     parameters:
   *       - $ref: '#/components/parameters/OrganizationId'
   *     responses:
   *       200:
   *         description: Organization statistics retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     totalUsers:
   *                       type: integer
   *                       description: Total number of users
   *                       example: 145
   *                     totalProviders:
   *                       type: integer
   *                       description: Total number of healthcare providers
   *                       example: 25
   *                     totalPatients:
   *                       type: integer
   *                       description: Total number of patients
   *                       example: 1250
   *                     totalStaff:
   *                       type: integer
   *                       description: Total number of staff members
   *                       example: 20
   *                     appointmentsThisMonth:
   *                       type: integer
   *                       description: Number of appointments this month
   *                       example: 450
   *                     appointmentsLastMonth:
   *                       type: integer
   *                       description: Number of appointments last month
   *                       example: 380
   *                     appointmentCompletionRate:
   *                       type: number
   *                       format: float
   *                       description: Appointment completion rate percentage
   *                       example: 92.5
   *                     averageBookingTime:
   *                       type: number
   *                       format: float
   *                       description: Average booking time in minutes
   *                       example: 3.2
   *                     subscriptionStatus:
   *                       type: string
   *                       description: Current subscription status
   *                       example: "active"
   *                     lastActivity:
   *                       type: string
   *                       format: date-time
   *                       description: Last activity timestamp
   *                       example: "2024-01-15T14:30:00Z"
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *     security:
   *       - BearerAuth: []
   */
  router.get('/:id/stats', multiTenantService.resolveTenantMiddleware(), async (req, res) => {
    try {
      const { id } = req.params;
      const stats = await organizationService.getOrganizationStats(id);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Failed to get organization stats', { error });
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  });

  /**
   * GET /api/v1/organizations/:id/onboarding
   * Get onboarding status
   */
  router.get('/:id/onboarding', async (req, res) => {
    try {
      const { id } = req.params;
      const status = await organizationService.getOnboardingStatus(id);

      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      logger.error('Failed to get onboarding status', { error });
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  });

  // User Registration Routes

  /**
   * @swagger
   * /organizations/{organizationId}/providers:
   *   post:
   *     tags: [Healthcare Providers]
   *     summary: Register a healthcare provider
   *     description: |
   *       Registers a new healthcare provider (doctor, nurse, etc.) within an organization.
   *       Validates medical licenses, specialties, and creates user account with proper roles.
   *     parameters:
   *       - $ref: '#/components/parameters/OrganizationId'
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [email, name, role]
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 description: Provider email address
   *                 example: "dr.smith@generalhospital.com"
   *               name:
   *                 type: string
   *                 description: Provider full name
   *                 example: "Dr. John Smith"
   *               role:
   *                 type: string
   *                 enum: [attending_physician, specialist, nurse_practitioner, physician_assistant, registered_nurse, licensed_practical_nurse, medical_assistant, physical_therapist, pharmacist]
   *                 description: Provider role
   *                 example: "attending_physician"
   *               specialties:
   *                 type: array
   *                 items:
   *                   type: string
   *                 description: Medical specialties
   *                 example: ["Cardiology", "Internal Medicine"]
   *               licenseNumber:
   *                 type: string
   *                 description: Medical license number
   *                 example: "CA-MD-12345"
   *               licenseState:
   *                 type: string
   *                 description: State where license was issued
   *                 example: "CA"
   *               licenseExpiry:
   *                 type: string
   *                 format: date
   *                 description: License expiration date
   *                 example: "2025-12-31"
   *               department:
   *                 type: string
   *                 description: Department
   *                 example: "Cardiology"
   *               employmentType:
   *                 type: string
   *                 enum: [full_time, part_time, contract, locum_tenens]
   *                 description: Employment type
   *                 example: "full_time"
   *               phone:
   *                 type: string
   *                 description: Phone number
   *                 example: "+1-555-0102"
   *           examples:
   *             physician:
   *               summary: Attending Physician
   *               value:
   *                 email: "dr.smith@generalhospital.com"
   *                 name: "Dr. John Smith"
   *                 role: "attending_physician"
   *                 specialties: ["Cardiology", "Internal Medicine"]
   *                 licenseNumber: "CA-MD-12345"
   *                 licenseState: "CA"
   *                 licenseExpiry: "2025-12-31"
   *                 department: "Cardiology"
   *                 employmentType: "full_time"
   *                 phone: "+1-555-0102"
   *             nurse:
   *               summary: Registered Nurse
   *               value:
   *                 email: "nurse.wilson@generalhospital.com"
   *                 name: "Mary Wilson"
   *                 role: "registered_nurse"
   *                 department: "Emergency Department"
   *                 employmentType: "full_time"
   *                 phone: "+1-555-0103"
   *     responses:
   *       201:
   *         description: Provider registered successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     user:
   *                       $ref: '#/components/schemas/User'
   *                     organizationUser:
   *                       type: object
   *                       properties:
   *                         id:
   *                           type: string
   *                           format: uuid
   *                         primaryRole:
   *                           type: string
   *                         department:
   *                           type: string
   *                         licenseNumber:
   *                           type: string
   *                         specialties:
   * POST /api/v1/organizations/:id/providers
   * Register a healthcare provider
   */
  router.post('/:id/providers', 
    multiTenantService.resolveTenantMiddleware(),
    async (req, res) => {
      try {
        const { id: organizationId } = req.params;
        const {
          email,
          name,
          role,
          specialties,
          licenseNumber,
          licenseState,
          deaNumber,
          npiNumber,
          department,
          employmentType
        } = req.body;

        // Validate required fields
        if (!email || !name || !role) {
          return res.status(400).json({
            error: 'Missing required fields',
            required: ['email', 'name', 'role']
          });
        }

        // Validate role
        const validProviderRoles = [
          'attending_physician',
          'specialist',
          'surgeon',
          'resident_physician',
          'nurse_practitioner',
          'physician_assistant',
          'nurse_manager',
          'registered_nurse',
          'charge_nurse',
          'licensed_practical_nurse',
          'physical_therapist',
          'occupational_therapist',
          'social_worker',
          'pharmacist'
        ];

        if (!validProviderRoles.includes(role)) {
          return res.status(400).json({
            error: 'Invalid provider role',
            validRoles: validProviderRoles
          });
        }

        const result = await organizationService.registerProvider(organizationId, {
          email,
          name,
          role,
          specialties,
          licenseNumber,
          licenseState,
          deaNumber,
          npiNumber,
          department,
          employmentType
        });

        logger.info('Provider registered via API', { 
          organizationId,
          userId: result.user.id,
          role,
          email
        });

        res.status(201).json({
          success: true,
          data: {
            user: result.user,
            organizationUser: result.organizationUser,
            message: 'Provider registered successfully. Verification email sent.'
          }
        });
      } catch (error) {
        logger.error('Failed to register provider via API', { error });
        res.status(400).json({
          error: error.message || 'Failed to register provider'
        });
      }
    }
  );

  /**
   * POST /api/v1/organizations/:id/patients
   * Register a patient
   */
  router.post('/:id/patients',
    multiTenantService.resolveTenantMiddleware(),
    async (req, res) => {
      try {
        const { id: organizationId } = req.params;
        const {
          email,
          name,
          dateOfBirth,
          gender,
          phone,
          address,
          emergencyContact,
          insuranceInfo,
          preferredLanguage,
          medicalRecordNumber
        } = req.body;

        // Validate required fields
        if (!email || !name || !dateOfBirth) {
          return res.status(400).json({
            error: 'Missing required fields',
            required: ['email', 'name', 'dateOfBirth']
          });
        }

        // Validate date of birth
        const dob = new Date(dateOfBirth);
        if (isNaN(dob.getTime())) {
          return res.status(400).json({
            error: 'Invalid date of birth format'
          });
        }

        const patient = await organizationService.registerPatient(organizationId, {
          email,
          name,
          dateOfBirth: dob,
          gender,
          phone,
          address,
          emergencyContact,
          insuranceInfo,
          preferredLanguage,
          medicalRecordNumber
        });

        logger.info('Patient registered via API', { 
          organizationId,
          userId: patient.id,
          email,
          medicalRecordNumber: patient.medical_record_number
        });

        res.status(201).json({
          success: true,
          data: {
            patient,
            message: 'Patient registered successfully'
          }
        });
      } catch (error) {
        logger.error('Failed to register patient via API', { error });
        res.status(400).json({
          error: error.message || 'Failed to register patient'
        });
      }
    }
  );

  /**
   * POST /api/v1/organizations/:id/patients/:patientId/caregivers
   * Add caregiver for patient
   */
  router.post('/:id/patients/:patientId/caregivers',
    multiTenantService.resolveTenantMiddleware(),
    async (req, res) => {
      try {
        const { id: organizationId, patientId } = req.params;
        const {
          caregiverEmail,
          caregiverName,
          relationshipType,
          authorizationLevel,
          canScheduleAppointments,
          canReceiveMedicalInfo,
          canMakeMedicalDecisions,
          authorizedBy
        } = req.body;

        // Validate required fields
        if (!caregiverEmail || !caregiverName || !relationshipType || !authorizationLevel || !authorizedBy) {
          return res.status(400).json({
            error: 'Missing required fields',
            required: ['caregiverEmail', 'caregiverName', 'relationshipType', 'authorizationLevel', 'authorizedBy']
          });
        }

        // Validate relationship type
        const validRelationships = [
          'spouse',
          'parent',
          'child',
          'guardian',
          'power_of_attorney',
          'professional_caregiver'
        ];

        if (!validRelationships.includes(relationshipType)) {
          return res.status(400).json({
            error: 'Invalid relationship type',
            validTypes: validRelationships
          });
        }

        const caregiver = await organizationService.addCaregiver(organizationId, {
          patientId,
          caregiverEmail,
          caregiverName,
          relationshipType,
          authorizationLevel,
          canScheduleAppointments,
          canReceiveMedicalInfo,
          canMakeMedicalDecisions,
          authorizedBy
        });

        logger.info('Caregiver added via API', { 
          organizationId,
          patientId,
          caregiverEmail,
          relationshipType
        });

        res.status(201).json({
          success: true,
          data: {
            caregiver,
            message: 'Caregiver added successfully'
          }
        });
      } catch (error) {
        logger.error('Failed to add caregiver via API', { error });
        res.status(400).json({
          error: error.message || 'Failed to add caregiver'
        });
      }
    }
  );

  /**
   * POST /api/v1/organizations/:id/staff
   * Register support staff
   */
  router.post('/:id/staff',
    multiTenantService.resolveTenantMiddleware(),
    async (req, res) => {
      try {
        const { id: organizationId } = req.params;
        const {
          email,
          name,
          role,
          department,
          employmentType,
          employeeId
        } = req.body;

        // Validate required fields
        if (!email || !name || !role) {
          return res.status(400).json({
            error: 'Missing required fields',
            required: ['email', 'name', 'role']
          });
        }

        // Validate role
        const validStaffRoles = [
          'medical_assistant',
          'front_desk',
          'scheduler',
          'insurance_verifier',
          'medical_records',
          'practice_manager',
          'billing_manager',
          'system_administrator'
        ];

        if (!validStaffRoles.includes(role)) {
          return res.status(400).json({
            error: 'Invalid staff role',
            validRoles: validStaffRoles
          });
        }

        const result = await organizationService.registerProvider(organizationId, {
          email,
          name,
          role,
          department,
          employmentType
        });

        // Update with employee ID if provided
        if (employeeId) {
          // Would update organization_users table with employee_id
        }

        logger.info('Staff member registered via API', { 
          organizationId,
          userId: result.user.id,
          role,
          email
        });

        res.status(201).json({
          success: true,
          data: {
            user: result.user,
            organizationUser: result.organizationUser,
            message: 'Staff member registered successfully'
          }
        });
      } catch (error) {
        logger.error('Failed to register staff via API', { error });
        res.status(400).json({
          error: error.message || 'Failed to register staff'
        });
      }
    }
  );

  // Bulk Operations

  /**
   * POST /api/v1/organizations/:id/bulk/providers
   * Bulk register providers from CSV/Excel
   */
  router.post('/:id/bulk/providers',
    multiTenantService.resolveTenantMiddleware(),
    async (req, res) => {
      try {
        const { id: organizationId } = req.params;
        const { providers } = req.body;

        if (!Array.isArray(providers) || providers.length === 0) {
          return res.status(400).json({
            error: 'Providers array is required'
          });
        }

        const results = {
          successful: [],
          failed: []
        };

        for (const provider of providers) {
          try {
            const result = await organizationService.registerProvider(organizationId, provider);
            results.successful.push({
              email: provider.email,
              userId: result.user.id,
              role: provider.role
            });
          } catch (error) {
            results.failed.push({
              email: provider.email,
              error: error.message
            });
          }
        }

        logger.info('Bulk provider registration completed', { 
          organizationId,
          successful: results.successful.length,
          failed: results.failed.length
        });

        res.json({
          success: true,
          data: results,
          summary: {
            total: providers.length,
            successful: results.successful.length,
            failed: results.failed.length
          }
        });
      } catch (error) {
        logger.error('Bulk provider registration failed', { error });
        res.status(500).json({
          error: 'Bulk registration failed'
        });
      }
    }
  );

  // Organization Configuration

  /**
   * GET /api/v1/organizations/:id/roles
   * Get available user roles for organization
   */
  router.get('/:id/roles', async (req, res) => {
    try {
      // This would fetch roles based on organization type and subscription
      const roles = [
        { name: 'attending_physician', category: 'provider', description: 'Attending Physician' },
        { name: 'nurse_practitioner', category: 'provider', description: 'Nurse Practitioner' },
        { name: 'registered_nurse', category: 'nursing', description: 'Registered Nurse' },
        { name: 'medical_assistant', category: 'support', description: 'Medical Assistant' },
        { name: 'front_desk', category: 'support', description: 'Front Desk Staff' },
        { name: 'patient', category: 'patient', description: 'Patient' },
        { name: 'caregiver', category: 'caregiver', description: 'Caregiver' }
      ];

      res.json({
        success: true,
        data: roles
      });
    } catch (error) {
      logger.error('Failed to get roles', { error });
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  });

  /**
   * GET /api/v1/organizations/:id/departments
   * Get organization departments
   */
  router.get('/:id/departments',
    multiTenantService.resolveTenantMiddleware(),
    async (req, res) => {
      try {
        const { id: organizationId } = req.params;
        
        // Would fetch from organization_departments table
        const departments = [
          { name: 'Emergency Department', type: 'clinical' },
          { name: 'Internal Medicine', type: 'clinical' },
          { name: 'Administration', type: 'administrative' }
        ];

        res.json({
          success: true,
          data: departments
        });
      } catch (error) {
        logger.error('Failed to get departments', { error });
        res.status(500).json({
          error: 'Internal server error'
        });
      }
    }
  );

  return router;
} 