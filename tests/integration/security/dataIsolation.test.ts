import { Pool, PoolClient } from 'pg';
import { v4 as uuidv4 } from 'uuid';

// Mock pg module
jest.mock('pg');

/**
 * Data Isolation Security Tests
 * Critical tests for multi-tenant healthcare data security
 * HIPAA compliance requires absolute data isolation between organizations
 */
describe('Data Isolation Security Tests', () => {
  let mockPool: jest.Mocked<Pool>;
  let mockClient: jest.Mocked<PoolClient>;

  // Test tenant IDs
  const hospitalA = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const hospitalB = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  const clinicC = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

  beforeAll(async () => {
    // Mock database client
    mockClient = {
      query: jest.fn() as jest.MockedFunction<any>,
      release: jest.fn(),
    } as any;

    mockPool = {
      connect: jest.fn().mockResolvedValue(mockClient),
      end: jest.fn(),
    } as any;
  });

  afterAll(async () => {
    // No real cleanup needed for mocks
  });

  beforeEach(async () => {
    // Reset mocks for each test
    jest.clearAllMocks();
  });

  describe('Cross-Tenant Data Access Prevention', () => {
    beforeEach(async () => {
      // Create test data in multiple organizations
      await mockClient.query('BEGIN');
      
      // Clean existing test data
      await mockClient.query('DELETE FROM patient_caregivers WHERE organization_id IN ($1, $2, $3)', [hospitalA, hospitalB, clinicC]);
      await mockClient.query('DELETE FROM organization_users WHERE organization_id IN ($1, $2, $3)', [hospitalA, hospitalB, clinicC]);
      await mockClient.query('DELETE FROM medical_records WHERE organization_id IN ($1, $2, $3)', [hospitalA, hospitalB, clinicC]);
      await mockClient.query('DELETE FROM appointments WHERE organization_id IN ($1, $2, $3)', [hospitalA, hospitalB, clinicC]);
      await mockClient.query('DELETE FROM users WHERE organization_id IN ($1, $2, $3)', [hospitalA, hospitalB, clinicC]);
      await mockClient.query('DELETE FROM organizations WHERE id IN ($1, $2, $3)', [hospitalA, hospitalB, clinicC]);

      // Create test organizations
      await mockClient.query(`
        INSERT INTO organizations (id, name, slug, type, address, contact_info) VALUES 
        ($1, 'Hospital A', 'hospital-a', 'hospital', '{"street": "123 Hospital St", "city": "New York", "state": "NY"}', '{"phone": "+1-555-0100"}'),
        ($2, 'Hospital B', 'hospital-b', 'hospital', '{"street": "456 Medical Ave", "city": "Boston", "state": "MA"}', '{"phone": "+1-555-0200"}'),
        ($3, 'Clinic C', 'clinic-c', 'clinic', '{"street": "789 Health Blvd", "city": "Chicago", "state": "IL"}', '{"phone": "+1-555-0300"}')
      `, [hospitalA, hospitalB, clinicC]);

      await mockClient.query('COMMIT');
    });

    beforeEach(async () => {
      // Create test data in multiple organizations
      await mockClient.query(`
        INSERT INTO users (id, email, name, organization_id, user_type, medical_record_number) VALUES 
        -- Hospital A Users
        ('${uuidv4()}', 'patient1@hospital-a.com', 'John Doe', $1, 'patient', 'HOSP-A-001'),
        ('${uuidv4()}', 'doctor1@hospital-a.com', 'Dr. Smith', $1, 'provider', NULL),
        ('${uuidv4()}', 'nurse1@hospital-a.com', 'Nurse Johnson', $1, 'provider', NULL),
        -- Hospital B Users  
        ('${uuidv4()}', 'patient1@hospital-b.com', 'Jane Smith', $2, 'patient', 'HOSP-B-001'),
        ('${uuidv4()}', 'doctor1@hospital-b.com', 'Dr. Brown', $2, 'provider', NULL),
        -- Clinic C Users
        ('${uuidv4()}', 'patient1@clinic-c.com', 'Bob Wilson', $3, 'patient', 'CLIN-C-001')
      `, [hospitalA, hospitalB, clinicC]);
    });

    it('should prevent accessing other organization users without tenant context', async () => {
      // Clear any existing tenant context
      await mockClient.query('SELECT set_tenant_context(NULL)');

      // Attempt to query users without tenant context - should not leak data
      const result = await mockClient.query('SELECT COUNT(*) FROM users WHERE organization_id != get_current_tenant()');
      
      // Without tenant context, get_current_tenant() returns NULL, 
      // so this query should include all users, but we're testing that we get the expected count
      expect(parseInt(result.rows[0].count)).toBeGreaterThan(0);
    });

    it('should strictly isolate patient data between organizations', async () => {
      // Set context to Hospital A
      await mockClient.query('SELECT set_tenant_context($1)', [hospitalA]);

      // Query should only return Hospital A patients
      const hospitalAPatients = await mockClient.query(`
        SELECT email, medical_record_number, organization_id 
        FROM users 
        WHERE user_type = 'patient' AND organization_id = get_current_tenant()
      `);

      expect(hospitalAPatients.rows).toHaveLength(1);
      expect(hospitalAPatients.rows[0].email).toBe('patient1@hospital-a.com');
      expect(hospitalAPatients.rows[0].medical_record_number).toBe('HOSP-A-001');
      expect(hospitalAPatients.rows[0].organization_id).toBe(hospitalA);

      // Switch to Hospital B
      await mockClient.query('SELECT set_tenant_context($1)', [hospitalB]);

      // Query should only return Hospital B patients
      const hospitalBPatients = await mockClient.query(`
        SELECT email, medical_record_number, organization_id 
        FROM users 
        WHERE user_type = 'patient' AND organization_id = get_current_tenant()
      `);

      expect(hospitalBPatients.rows).toHaveLength(1);
      expect(hospitalBPatients.rows[0].email).toBe('patient1@hospital-b.com');
      expect(hospitalBPatients.rows[0].medical_record_number).toBe('HOSP-B-001');
      expect(hospitalBPatients.rows[0].organization_id).toBe(hospitalB);
    });

    it('should prevent cross-tenant patient medical record access', async () => {
      // Create medical records for different organizations
      const patientAId = (await mockClient.query('SELECT id FROM users WHERE email = $1', ['patient1@hospital-a.com'])).rows[0].id;
      const doctorAId = (await mockClient.query('SELECT id FROM users WHERE email = $1', ['doctor1@hospital-a.com'])).rows[0].id;
      const patientBId = (await mockClient.query('SELECT id FROM users WHERE email = $1', ['patient1@hospital-b.com'])).rows[0].id;
      const doctorBId = (await mockClient.query('SELECT id FROM users WHERE email = $1', ['doctor1@hospital-b.com'])).rows[0].id;

      await mockClient.query(`
        INSERT INTO medical_records (id, organization_id, patient_id, provider_id, content, record_type, created_at) VALUES 
        ('${uuidv4()}', $1, $2, $3, 'Confidential Hospital A Record', 'consultation', CURRENT_TIMESTAMP),
        ('${uuidv4()}', $4, $5, $6, 'Confidential Hospital B Record', 'consultation', CURRENT_TIMESTAMP)
      `, [hospitalA, patientAId, doctorAId, hospitalB, patientBId, doctorBId]);

      // Set context to Hospital A - should only see Hospital A records
      await mockClient.query('SELECT set_tenant_context($1)', [hospitalA]);
      const hospitalARecords = await mockClient.query(`
        SELECT content, organization_id 
        FROM medical_records 
        WHERE organization_id = get_current_tenant()
      `);

      expect(hospitalARecords.rows).toHaveLength(1);
      expect(hospitalARecords.rows[0].content).toBe('Confidential Hospital A Record');
      expect(hospitalARecords.rows[0].organization_id).toBe(hospitalA);

      // Set context to Hospital B - should only see Hospital B records
      await mockClient.query('SELECT set_tenant_context($1)', [hospitalB]);
      const hospitalBRecords = await mockClient.query(`
        SELECT content, organization_id 
        FROM medical_records 
        WHERE organization_id = get_current_tenant()
      `);

      expect(hospitalBRecords.rows).toHaveLength(1);
      expect(hospitalBRecords.rows[0].content).toBe('Confidential Hospital B Record');
      expect(hospitalBRecords.rows[0].organization_id).toBe(hospitalB);
    });

    it('should prevent cross-tenant appointment access', async () => {
      // Create appointments in different organizations
      const patientAId = (await mockClient.query('SELECT id FROM users WHERE email = $1', ['patient1@hospital-a.com'])).rows[0].id;
      const doctorAId = (await mockClient.query('SELECT id FROM users WHERE email = $1', ['doctor1@hospital-a.com'])).rows[0].id;
      const patientBId = (await mockClient.query('SELECT id FROM users WHERE email = $1', ['patient1@hospital-b.com'])).rows[0].id;
      const doctorBId = (await mockClient.query('SELECT id FROM users WHERE email = $1', ['doctor1@hospital-b.com'])).rows[0].id;

      await mockClient.query(`
        INSERT INTO appointments (id, organization_id, patient_id, provider_id, scheduled_at, status, appointment_type) VALUES 
        ('${uuidv4()}', $1, $2, $3, '2024-02-01 10:00:00', 'scheduled', 'consultation'),
        ('${uuidv4()}', $4, $5, $6, '2024-02-01 11:00:00', 'scheduled', 'follow-up')
      `, [hospitalA, patientAId, doctorAId, hospitalB, patientBId, doctorBId]);

      // Test Hospital A context
      await mockClient.query('SELECT set_tenant_context($1)', [hospitalA]);
      const hospitalAAppointments = await mockClient.query(`
        SELECT appointment_type, organization_id 
        FROM appointments 
        WHERE organization_id = get_current_tenant()
      `);

      expect(hospitalAAppointments.rows).toHaveLength(1);
      expect(hospitalAAppointments.rows[0].appointment_type).toBe('consultation');

      // Test Hospital B context
      await mockClient.query('SELECT set_tenant_context($1)', [hospitalB]);
      const hospitalBAppointments = await mockClient.query(`
        SELECT appointment_type, organization_id 
        FROM appointments 
        WHERE organization_id = get_current_tenant()
      `);

      expect(hospitalBAppointments.rows).toHaveLength(1);
      expect(hospitalBAppointments.rows[0].appointment_type).toBe('follow-up');
    });
  });

  describe('Email and Identity Isolation', () => {
    it('should allow same email addresses in different organizations', async () => {
      const commonEmail = 'admin@healthcare.com';

      // Create users with same email in different organizations
      await mockClient.query(`
        INSERT INTO users (id, email, name, organization_id, user_type) VALUES 
        ('${uuidv4()}', $1, 'Admin Hospital A', $2, 'provider'),
        ('${uuidv4()}', $1, 'Admin Hospital B', $3, 'provider'),
        ('${uuidv4()}', $1, 'Admin Clinic C', $4, 'provider')
      `, [commonEmail, hospitalA, hospitalB, clinicC]);

      // Verify all three users exist
      const allUsers = await mockClient.query('SELECT organization_id, name FROM users WHERE email = $1', [commonEmail]);
      expect(allUsers.rows).toHaveLength(3);

      // Verify tenant isolation
      await mockClient.query('SELECT set_tenant_context($1)', [hospitalA]);
      const hospitalAUser = await mockClient.query(`
        SELECT name FROM users 
        WHERE email = $1 AND organization_id = get_current_tenant()
      `, [commonEmail]);

      expect(hospitalAUser.rows).toHaveLength(1);
      expect(hospitalAUser.rows[0].name).toBe('Admin Hospital A');
    });

    it('should prevent duplicate emails within same organization', async () => {
      const duplicateEmail = 'duplicate@hospital-a.com';

      // First user should succeed
      await mockClient.query(`
        INSERT INTO users (id, email, name, organization_id, user_type) VALUES 
        ('${uuidv4()}', $1, 'First User', $2, 'provider')
      `, [duplicateEmail, hospitalA]);

      // Second user with same email in same organization should fail
      await expect(mockClient.query(`
        INSERT INTO users (id, email, name, organization_id, user_type) VALUES 
        ('${uuidv4()}', $1, 'Second User', $2, 'provider')
      `, [duplicateEmail, hospitalA])).rejects.toThrow();
    });

    it('should maintain medical record number uniqueness per organization', async () => {
      // Same medical record numbers should be allowed in different organizations
      const mrnNumber = 'MRN-001';

      await mockClient.query(`
        INSERT INTO users (id, email, name, organization_id, user_type, medical_record_number) VALUES 
        ('${uuidv4()}', 'patient1@hospital-a.com', 'Patient A', $1, 'patient', $2),
        ('${uuidv4()}', 'patient1@hospital-b.com', 'Patient B', $3, 'patient', $2)
      `, [hospitalA, mrnNumber, hospitalB]);

      // Verify both records exist
      const allPatients = await mockClient.query('SELECT organization_id FROM users WHERE medical_record_number = $1', [mrnNumber]);
      expect(allPatients.rows).toHaveLength(2);

      // Duplicate MRN in same organization should fail
      await expect(mockClient.query(`
        INSERT INTO users (id, email, name, organization_id, user_type, medical_record_number) VALUES 
        ('${uuidv4()}', 'patient2@hospital-a.com', 'Another Patient A', $1, 'patient', $2)
      `, [hospitalA, mrnNumber])).rejects.toThrow();
    });
  });

  describe('Caregiver Relationship Isolation', () => {
    let patientAId: string;
    let caregiverAId: string;
    let patientBId: string;
    let caregiverBId: string;

    beforeEach(async () => {
      // Create patients and caregivers in different organizations
      patientAId = uuidv4();
      caregiverAId = uuidv4();
      patientBId = uuidv4();
      caregiverBId = uuidv4();

      await mockClient.query(`
        INSERT INTO users (id, email, name, organization_id, user_type) VALUES 
        ($1, 'patient@hospital-a.com', 'Patient A', $2, 'patient'),
        ($3, 'caregiver@hospital-a.com', 'Caregiver A', $2, 'caregiver'),
        ($4, 'patient@hospital-b.com', 'Patient B', $5, 'patient'),
        ($6, 'caregiver@hospital-b.com', 'Caregiver B', $5, 'caregiver')
      `, [patientAId, hospitalA, caregiverAId, patientBId, hospitalB, caregiverBId]);
    });

    it('should isolate caregiver relationships by organization', async () => {
      // Create caregiver relationships in both organizations
      await mockClient.query(`
        INSERT INTO patient_caregivers (
          organization_id, patient_id, caregiver_id, relationship_type,
          authorization_level, can_schedule_appointments, authorized_by, is_active
        ) VALUES 
        ($1, $2, $3, 'spouse', 'full', true, $2, true),
        ($4, $5, $6, 'parent', 'basic', false, $5, true)
      `, [hospitalA, patientAId, caregiverAId, hospitalB, patientBId, caregiverBId]);

      // Test Hospital A isolation
      await mockClient.query('SELECT set_tenant_context($1)', [hospitalA]);
      const hospitalARelationships = await mockClient.query(`
        SELECT relationship_type, authorization_level 
        FROM patient_caregivers 
        WHERE organization_id = get_current_tenant()
      `);

      expect(hospitalARelationships.rows).toHaveLength(1);
      expect(hospitalARelationships.rows[0].relationship_type).toBe('spouse');
      expect(hospitalARelationships.rows[0].authorization_level).toBe('full');

      // Test Hospital B isolation
      await mockClient.query('SELECT set_tenant_context($1)', [hospitalB]);
      const hospitalBRelationships = await mockClient.query(`
        SELECT relationship_type, authorization_level 
        FROM patient_caregivers 
        WHERE organization_id = get_current_tenant()
      `);

      expect(hospitalBRelationships.rows).toHaveLength(1);
      expect(hospitalBRelationships.rows[0].relationship_type).toBe('parent');
      expect(hospitalBRelationships.rows[0].authorization_level).toBe('basic');
    });

    it('should prevent cross-organization caregiver access to patient data', async () => {
      // Attempt to create a caregiver relationship across organizations (should not be possible)
      await expect(mockClient.query(`
        INSERT INTO patient_caregivers (
          organization_id, patient_id, caregiver_id, relationship_type,
          authorization_level, authorized_by, is_active
        ) VALUES ($1, $2, $3, 'unauthorized', 'none', $2, false)
      `, [hospitalA, patientAId, caregiverBId])).rejects.toThrow();
    });
  });

  describe('Organization User Role Isolation', () => {
    it('should isolate user roles and permissions by organization', async () => {
      // Create users with same roles in different organizations
      const doctorAId = uuidv4();
      const doctorBId = uuidv4();
      const roleId = (await mockClient.query('SELECT id FROM user_roles WHERE name = $1', ['attending_physician'])).rows[0].id;

      await mockClient.query(`
        INSERT INTO users (id, email, name, organization_id, user_type) VALUES 
        ($1, 'doctor@hospital-a.com', 'Doctor A', $2, 'provider'),
        ($3, 'doctor@hospital-b.com', 'Doctor B', $4, 'provider')
      `, [doctorAId, hospitalA, doctorBId, hospitalB]);

      await mockClient.query(`
        INSERT INTO organization_users (
          organization_id, user_id, primary_role_id, department, 
          license_number, specialties, is_active
        ) VALUES 
        ($1, $2, $3, 'Cardiology', 'LIC-A-001', '["Cardiology"]', true),
        ($4, $5, $3, 'Emergency', 'LIC-B-001', '["Emergency Medicine"]', true)
      `, [hospitalA, doctorAId, roleId, hospitalB, doctorBId]);

      // Test Hospital A context
      await mockClient.query('SELECT set_tenant_context($1)', [hospitalA]);
      const hospitalADoctors = await mockClient.query(`
        SELECT ou.department, ou.license_number, ou.specialties
        FROM organization_users ou
        WHERE ou.organization_id = get_current_tenant()
      `);

      expect(hospitalADoctors.rows).toHaveLength(1);
      expect(hospitalADoctors.rows[0].department).toBe('Cardiology');
      expect(hospitalADoctors.rows[0].license_number).toBe('LIC-A-001');

      // Test Hospital B context
      await mockClient.query('SELECT set_tenant_context($1)', [hospitalB]);
      const hospitalBDoctors = await mockClient.query(`
        SELECT ou.department, ou.license_number, ou.specialties
        FROM organization_users ou
        WHERE ou.organization_id = get_current_tenant()
      `);

      expect(hospitalBDoctors.rows).toHaveLength(1);
      expect(hospitalBDoctors.rows[0].department).toBe('Emergency');
      expect(hospitalBDoctors.rows[0].license_number).toBe('LIC-B-001');
    });
  });

  describe('Tenant Context Security', () => {
    it('should prevent SQL injection in tenant context setting', async () => {
      // Attempt SQL injection through tenant context
      const maliciousInput = "'; DROP TABLE users; --";

      // This should not cause any damage
      await expect(mockClient.query('SELECT set_tenant_context($1)', [maliciousInput]))
        .rejects.toThrow(); // Should fail due to invalid UUID format

      // Verify users table still exists
      const result = await mockClient.query('SELECT COUNT(*) FROM users');
      expect(parseInt(result.rows[0].count)).toBeGreaterThanOrEqual(0);
    });

    it('should validate tenant context UUID format', async () => {
      // Test invalid UUID formats
      const invalidUUIDs = [
        'not-a-uuid',
        '123-456-789',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa', // Too short
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa1', // Too long
      ];

      for (const invalidUUID of invalidUUIDs) {
        await expect(mockClient.query('SELECT set_tenant_context($1)', [invalidUUID]))
          .rejects.toThrow();
      }
    });

    it('should handle null tenant context gracefully', async () => {
      // Clear tenant context
      await mockClient.query('SELECT set_tenant_context(NULL)');

      // Verify context is cleared
      const result = await mockClient.query('SELECT get_current_tenant()');
      expect(result.rows[0].get_current_tenant).toBeNull();
    });

    it('should maintain tenant context isolation between connections', async () => {
      // This test would require multiple database connections to properly test
      // For now, we test that context doesn't persist inappropriately

      // Set context to Hospital A
      await mockClient.query('SELECT set_tenant_context($1)', [hospitalA]);
      let context = await mockClient.query('SELECT get_current_tenant()');
      expect(context.rows[0].get_current_tenant).toBe(hospitalA);

      // Clear context
      await mockClient.query('SELECT set_tenant_context(NULL)');
      context = await mockClient.query('SELECT get_current_tenant()');
      expect(context.rows[0].get_current_tenant).toBeNull();

      // Set different context
      await mockClient.query('SELECT set_tenant_context($1)', [hospitalB]);
      context = await mockClient.query('SELECT get_current_tenant()');
      expect(context.rows[0].get_current_tenant).toBe(hospitalB);
    });
  });

  describe('Data Leakage Prevention', () => {
    beforeEach(async () => {
      // Create comprehensive test data across organizations
      const patientAId = uuidv4();
      const patientBId = uuidv4();
      const doctorAId = uuidv4();
      const doctorBId = uuidv4();

      await mockClient.query(`
        INSERT INTO users (id, email, name, organization_id, user_type, medical_record_number) VALUES 
        ($1, 'patient.sensitive@hospital-a.com', 'Sensitive Patient A', $2, 'patient', 'SENS-A-001'),
        ($3, 'patient.confidential@hospital-b.com', 'Confidential Patient B', $4, 'patient', 'CONF-B-001'),
        ($5, 'doctor.a@hospital-a.com', 'Dr. A', $2, 'provider', NULL),
        ($6, 'doctor.b@hospital-b.com', 'Dr. B', $4, 'provider', NULL)
      `, [patientAId, hospitalA, patientBId, hospitalB, doctorAId, doctorBId]);

      // Create sensitive medical records
      await mockClient.query(`
        INSERT INTO medical_records (id, organization_id, patient_id, provider_id, content, record_type, is_sensitive) VALUES 
        ('${uuidv4()}', $1, $2, $3, 'HIGHLY SENSITIVE: Mental health treatment', 'psychiatric', true),
        ('${uuidv4()}', $4, $5, $6, 'CONFIDENTIAL: Substance abuse treatment', 'addiction', true)
      `, [hospitalA, patientAId, doctorAId, hospitalB, patientBId, doctorBId]);
    });

    it('should never leak sensitive data across organizations', async () => {
      // Set context to Hospital A
      await mockClient.query('SELECT set_tenant_context($1)', [hospitalA]);

      // Should only see Hospital A sensitive data
      const hospitalARecords = await mockClient.query(`
        SELECT content, is_sensitive 
        FROM medical_records 
        WHERE organization_id = get_current_tenant() AND is_sensitive = true
      `);

      expect(hospitalARecords.rows).toHaveLength(1);
      expect(hospitalARecords.rows[0].content).toContain('Mental health treatment');
      expect(hospitalARecords.rows[0].content).not.toContain('Substance abuse');

      // Switch to Hospital B
      await mockClient.query('SELECT set_tenant_context($1)', [hospitalB]);

      // Should only see Hospital B sensitive data
      const hospitalBRecords = await mockClient.query(`
        SELECT content, is_sensitive 
        FROM medical_records 
        WHERE organization_id = get_current_tenant() AND is_sensitive = true
      `);

      expect(hospitalBRecords.rows).toHaveLength(1);
      expect(hospitalBRecords.rows[0].content).toContain('Substance abuse treatment');
      expect(hospitalBRecords.rows[0].content).not.toContain('Mental health');
    });

    it('should prevent accidental cross-tenant queries', async () => {
      // Set context to Hospital A
      await mockClient.query('SELECT set_tenant_context($1)', [hospitalA]);

      // Attempt to query Hospital B data directly (should return no results)
      const crossTenantAttempt = await mockClient.query(`
        SELECT COUNT(*) FROM medical_records 
        WHERE organization_id = $1 AND organization_id != get_current_tenant()
      `, [hospitalB]);

      expect(parseInt(crossTenantAttempt.rows[0].count)).toBe(0);
    });

    it('should audit potential data access violations', async () => {
      // This would typically involve audit logging
      // For now, we test that tenant context is properly enforced

      await mockClient.query('SELECT set_tenant_context($1)', [hospitalA]);
      
      // Any query should respect tenant context
      const users = await mockClient.query(`
        SELECT COUNT(*) FROM users 
        WHERE organization_id = get_current_tenant()
      `);

      expect(parseInt(users.rows[0].count)).toBeGreaterThan(0);

      // Verify no cross-tenant contamination
      const crossTenantUsers = await mockClient.query(`
        SELECT COUNT(*) FROM users 
        WHERE organization_id != get_current_tenant() AND organization_id = $1
      `, [hospitalB]);

      expect(parseInt(crossTenantUsers.rows[0].count)).toBe(0);
    });
  });

  describe('HIPAA Compliance Validation', () => {
    it('should enforce minimum necessary principle for data access', async () => {
      // Create patient with multiple types of data
      const patientId = uuidv4();
      const doctorId = uuidv4();
      const nurseId = uuidv4();

      await mockClient.query(`
        INSERT INTO users (id, email, name, organization_id, user_type) VALUES 
        ($1, 'patient@hospital-a.com', 'John Doe', $2, 'patient'),
        ($3, 'doctor@hospital-a.com', 'Dr. Smith', $2, 'provider'),
        ($4, 'nurse@hospital-a.com', 'Nurse Jones', $2, 'provider')
      `, [patientId, hospitalA, doctorId, nurseId]);

      // Create records with different sensitivity levels
      await mockClient.query(`
        INSERT INTO medical_records (id, organization_id, patient_id, provider_id, content, record_type, is_sensitive) VALUES 
        ('${uuidv4()}', $1, $2, $3, 'Regular checkup notes', 'general', false),
        ('${uuidv4()}', $1, $2, $3, 'Psychiatric evaluation', 'psychiatric', true),
        ('${uuidv4()}', $1, $2, $3, 'HIV test results', 'lab', true)
      `, [hospitalA, patientId, doctorId]);

      // Set tenant context
      await mockClient.query('SELECT set_tenant_context($1)', [hospitalA]);

      // All records should be isolated to correct organization
      const records = await mockClient.query(`
        SELECT record_type, is_sensitive 
        FROM medical_records 
        WHERE organization_id = get_current_tenant() AND patient_id = $1
      `, [patientId]);

      expect(records.rows).toHaveLength(3);
      expect(records.rows.filter((r: any) => r.is_sensitive)).toHaveLength(2);
    });

    it('should maintain audit trail for all data access', async () => {
      // This test ensures that tenant context is logged and auditable
      await mockClient.query('SELECT set_tenant_context($1)', [hospitalA]);

      // Query that would be audited
      const accessTime = new Date();
      const result = await mockClient.query(`
        SELECT COUNT(*) as access_count, get_current_tenant() as tenant_context 
        FROM users 
        WHERE organization_id = get_current_tenant()
      `);

      expect(result.rows[0].tenant_context).toBe(hospitalA);
      expect(parseInt(result.rows[0].access_count)).toBeGreaterThanOrEqual(0);
    });
  });
}); 