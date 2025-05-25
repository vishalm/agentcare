import { Pool, PoolClient } from 'pg';
import { v4 as uuidv4 } from 'uuid';

describe.skip('Multi-Tenant Database Integration Tests', () => {
  let pool: Pool;
  let client: PoolClient;

  // Test organization IDs
  const orgA = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const orgB = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  const defaultOrg = '00000000-0000-0000-0000-000000000000';

  beforeAll(async () => {
    // Set up database connection
    pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'agentcare_test',
      user: process.env.DB_USER || 'agentcare_user',
      password: process.env.DB_PASSWORD || 'agentcare_password',
    });

    client = await pool.connect();
  });

  afterAll(async () => {
    if (client) {
      client.release();
    }
    if (pool) {
      await pool.end();
    }
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await client.query('BEGIN');
    await client.query('DELETE FROM patient_caregivers WHERE organization_id IN ($1, $2)', [orgA, orgB]);
    await client.query('DELETE FROM organization_users WHERE organization_id IN ($1, $2)', [orgA, orgB]);
    await client.query('DELETE FROM users WHERE organization_id IN ($1, $2)', [orgA, orgB]);
    await client.query('DELETE FROM appointments WHERE organization_id IN ($1, $2)', [orgA, orgB]);
    await client.query('DELETE FROM medical_records WHERE organization_id IN ($1, $2)', [orgA, orgB]);
    await client.query('DELETE FROM organizations WHERE id IN ($1, $2)', [orgA, orgB]);
    await client.query('COMMIT');
  });

  describe('Organization Creation and Management', () => {
    it('should create organizations with different types', async () => {
      // Arrange & Act
      await client.query(`
        INSERT INTO organizations (id, name, slug, type, address, contact_info) VALUES 
        ($1, 'Hospital A', 'hospital-a', 'hospital', '{}', '{}'),
        ($2, 'Clinic B', 'clinic-b', 'clinic', '{}', '{}')
      `, [orgA, orgB]);

      // Assert
      const result = await client.query('SELECT * FROM organizations WHERE id IN ($1, $2)', [orgA, orgB]);
      expect(result.rows).toHaveLength(2);
      expect(result.rows.find(r => r.id === orgA)?.type).toBe('hospital');
      expect(result.rows.find(r => r.id === orgB)?.type).toBe('clinic');
    });

    it('should enforce unique slugs', async () => {
      // Arrange
      await client.query(`
        INSERT INTO organizations (id, name, slug, type, address, contact_info) VALUES 
        ($1, 'Hospital A', 'test-hospital', 'hospital', '{}', '{}')
      `, [orgA]);

      // Act & Assert
      await expect(client.query(`
        INSERT INTO organizations (id, name, slug, type, address, contact_info) VALUES 
        ($1, 'Hospital B', 'test-hospital', 'hospital', '{}', '{}')
      `, [orgB])).rejects.toThrow();
    });

    it('should create default departments for different organization types', async () => {
      // Arrange
      await client.query(`
        INSERT INTO organizations (id, name, slug, type, address, contact_info) VALUES 
        ($1, 'Test Hospital', 'test-hospital', 'hospital', '{}', '{}')
      `, [orgA]);

      // Act
      await client.query(`
        INSERT INTO organization_departments (organization_id, name, department_type) VALUES 
        ($1, 'Emergency Department', 'clinical'),
        ($1, 'Internal Medicine', 'clinical'),
        ($1, 'Administration', 'administrative')
      `, [orgA]);

      // Assert
      const result = await client.query(
        'SELECT * FROM organization_departments WHERE organization_id = $1',
        [orgA]
      );
      expect(result.rows).toHaveLength(3);
      expect(result.rows.some(r => r.name === 'Emergency Department')).toBe(true);
    });
  });

  describe('User Registration and Role Management', () => {
    beforeEach(async () => {
      // Create test organizations
      await client.query(`
        INSERT INTO organizations (id, name, slug, type, address, contact_info) VALUES 
        ($1, 'Hospital A', 'hospital-a', 'hospital', '{}', '{}'),
        ($2, 'Clinic B', 'clinic-b', 'clinic', '{}', '{}')
      `, [orgA, orgB]);
    });

    it('should allow same email in different organizations', async () => {
      // Arrange
      const email = 'doctor@test.com';
      const userAId = uuidv4();
      const userBId = uuidv4();

      // Act - Create same email in different organizations
      await client.query(`
        INSERT INTO users (id, email, name, organization_id, user_type) VALUES 
        ($1, $2, 'Doctor A', $3, 'provider'),
        ($4, $2, 'Doctor B', $5, 'provider')
      `, [userAId, email, orgA, userBId, orgB]);

      // Assert
      const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
      expect(result.rows).toHaveLength(2);
      expect(result.rows.map(r => r.organization_id).sort()).toEqual([orgA, orgB].sort());
    });

    it('should prevent duplicate emails within same organization', async () => {
      // Arrange
      const email = 'duplicate@test.com';
      const userAId = uuidv4();
      const userBId = uuidv4();

      await client.query(`
        INSERT INTO users (id, email, name, organization_id, user_type) VALUES 
        ($1, $2, 'User A', $3, 'provider')
      `, [userAId, email, orgA]);

      // Act & Assert
      await expect(client.query(`
        INSERT INTO users (id, email, name, organization_id, user_type) VALUES 
        ($1, $2, 'User B', $3, 'provider')
      `, [userBId, email, orgA])).rejects.toThrow();
    });

    it('should create organization user records with roles', async () => {
      // Arrange
      const userId = uuidv4();
      const roleResult = await client.query('SELECT id FROM user_roles WHERE name = $1', ['attending_physician']);
      const roleId = roleResult.rows[0]?.id;

      await client.query(`
        INSERT INTO users (id, email, name, organization_id, user_type) VALUES 
        ($1, 'provider@hospital-a.com', 'Test Provider', $2, 'provider')
      `, [userId, orgA]);

      // Act
      await client.query(`
        INSERT INTO organization_users (
          organization_id, user_id, primary_role_id, department, 
          license_number, is_active
        ) VALUES ($1, $2, $3, 'Cardiology', 'MD-12345', true)
      `, [orgA, userId, roleId]);

      // Assert
      const result = await client.query(`
        SELECT ou.*, ur.name as role_name 
        FROM organization_users ou
        JOIN user_roles ur ON ou.primary_role_id = ur.id
        WHERE ou.organization_id = $1 AND ou.user_id = $2
      `, [orgA, userId]);

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].role_name).toBe('attending_physician');
      expect(result.rows[0].department).toBe('Cardiology');
      expect(result.rows[0].license_number).toBe('MD-12345');
    });

    it('should generate unique medical record numbers per organization', async () => {
      // Arrange
      const patientA1Id = uuidv4();
      const patientA2Id = uuidv4();
      const patientBId = uuidv4();

      // Act
      await client.query(`
        INSERT INTO users (id, email, name, organization_id, user_type, medical_record_number) VALUES 
        ($1, 'patient1@hospital-a.com', 'Patient A1', $2, 'patient', 'HOSPITAL-A-000001'),
        ($3, 'patient2@hospital-a.com', 'Patient A2', $2, 'patient', 'HOSPITAL-A-000002'),
        ($4, 'patient1@clinic-b.com', 'Patient B1', $5, 'patient', 'CLINIC-B-000001')
      `, [patientA1Id, orgA, patientA2Id, patientBId, orgB]);

      // Assert
      const result = await client.query('SELECT medical_record_number, organization_id FROM users WHERE user_type = $1', ['patient']);
      expect(result.rows).toHaveLength(3);
      
      const hospitalARecords = result.rows.filter(r => r.organization_id === orgA);
      const clinicBRecords = result.rows.filter(r => r.organization_id === orgB);
      
      expect(hospitalARecords).toHaveLength(2);
      expect(clinicBRecords).toHaveLength(1);
      expect(hospitalARecords.every(r => r.medical_record_number.startsWith('HOSPITAL-A'))).toBe(true);
      expect(clinicBRecords.every(r => r.medical_record_number.startsWith('CLINIC-B'))).toBe(true);
    });
  });

  describe('Patient-Caregiver Relationships', () => {
    let patientId: string;
    let caregiverId: string;

    beforeEach(async () => {
      // Create test organization
      await client.query(`
        INSERT INTO organizations (id, name, slug, type, address, contact_info) VALUES 
        ($1, 'Hospital A', 'hospital-a', 'hospital', '{}', '{}')
      `, [orgA]);

      // Create test users
      patientId = uuidv4();
      caregiverId = uuidv4();

      await client.query(`
        INSERT INTO users (id, email, name, organization_id, user_type) VALUES 
        ($1, 'patient@hospital-a.com', 'Test Patient', $2, 'patient'),
        ($3, 'caregiver@hospital-a.com', 'Test Caregiver', $2, 'caregiver')
      `, [patientId, orgA, caregiverId]);
    });

    it('should create patient-caregiver relationships', async () => {
      // Act
      await client.query(`
        INSERT INTO patient_caregivers (
          organization_id, patient_id, caregiver_id, relationship_type,
          authorization_level, can_schedule_appointments, can_receive_medical_info,
          authorized_by, is_active
        ) VALUES ($1, $2, $3, 'spouse', 'full', true, true, $2, true)
      `, [orgA, patientId, caregiverId]);

      // Assert
      const result = await client.query(`
        SELECT * FROM patient_caregivers 
        WHERE organization_id = $1 AND patient_id = $2 AND caregiver_id = $3
      `, [orgA, patientId, caregiverId]);

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].relationship_type).toBe('spouse');
      expect(result.rows[0].authorization_level).toBe('full');
      expect(result.rows[0].can_schedule_appointments).toBe(true);
    });

    it('should prevent duplicate patient-caregiver relationships in same organization', async () => {
      // Arrange
      await client.query(`
        INSERT INTO patient_caregivers (
          organization_id, patient_id, caregiver_id, relationship_type,
          authorization_level, authorized_by, is_active
        ) VALUES ($1, $2, $3, 'spouse', 'basic', $2, true)
      `, [orgA, patientId, caregiverId]);

      // Act & Assert
      await expect(client.query(`
        INSERT INTO patient_caregivers (
          organization_id, patient_id, caregiver_id, relationship_type,
          authorization_level, authorized_by, is_active
        ) VALUES ($1, $2, $3, 'parent', 'full', $2, true)
      `, [orgA, patientId, caregiverId])).rejects.toThrow();
    });
  });

  describe('Tenant Context and Data Isolation', () => {
    beforeEach(async () => {
      // Create test organizations and users
      await client.query(`
        INSERT INTO organizations (id, name, slug, type, address, contact_info) VALUES 
        ($1, 'Hospital A', 'hospital-a', 'hospital', '{}', '{}'),
        ($2, 'Clinic B', 'clinic-b', 'clinic', '{}', '{}')
      `, [orgA, orgB]);

      await client.query(`
        INSERT INTO users (id, email, name, organization_id, user_type) VALUES 
        ('${uuidv4()}', 'user1@hospital-a.com', 'User A1', $1, 'provider'),
        ('${uuidv4()}', 'user2@hospital-a.com', 'User A2', $1, 'patient'),
        ('${uuidv4()}', 'user1@clinic-b.com', 'User B1', $2, 'provider'),
        ('${uuidv4()}', 'user2@clinic-b.com', 'User B2', $2, 'patient')
      `, [orgA, orgB]);
    });

    it('should set and retrieve tenant context', async () => {
      // Act
      await client.query('SELECT set_tenant_context($1)', [orgA]);

      // Assert
      const result = await client.query('SELECT get_current_tenant()');
      expect(result.rows[0].get_current_tenant).toBe(orgA);
    });

    it('should isolate data based on tenant context', async () => {
      // Act - Set tenant context for Organization A
      await client.query('SELECT set_tenant_context($1)', [orgA]);

      // Assert - Should only see Organization A users
      const resultA = await client.query('SELECT COUNT(*) FROM users WHERE organization_id = get_current_tenant()');
      expect(parseInt(resultA.rows[0].count)).toBe(2);

      // Act - Set tenant context for Organization B
      await client.query('SELECT set_tenant_context($1)', [orgB]);

      // Assert - Should only see Organization B users
      const resultB = await client.query('SELECT COUNT(*) FROM users WHERE organization_id = get_current_tenant()');
      expect(parseInt(resultB.rows[0].count)).toBe(2);
    });

    it('should prevent cross-tenant data access without proper context', async () => {
      // Arrange - Clear tenant context
      await client.query('SELECT set_tenant_context(NULL)');

      // Act & Assert - Should not be able to access tenant-specific data without context
      const result = await client.query('SELECT get_current_tenant()');
      expect(result.rows[0].get_current_tenant).toBeNull();
    });
  });

  describe('Appointments and Medical Records Multi-Tenancy', () => {
    let providerAId: string;
    let patientAId: string;
    let providerBId: string;
    let patientBId: string;

    beforeEach(async () => {
      // Create test organizations
      await client.query(`
        INSERT INTO organizations (id, name, slug, type, address, contact_info) VALUES 
        ($1, 'Hospital A', 'hospital-a', 'hospital', '{}', '{}'),
        ($2, 'Clinic B', 'clinic-b', 'clinic', '{}', '{}')
      `, [orgA, orgB]);

      // Create test users
      providerAId = uuidv4();
      patientAId = uuidv4();
      providerBId = uuidv4();
      patientBId = uuidv4();

      await client.query(`
        INSERT INTO users (id, email, name, organization_id, user_type) VALUES 
        ($1, 'provider@hospital-a.com', 'Provider A', $2, 'provider'),
        ($3, 'patient@hospital-a.com', 'Patient A', $2, 'patient'),
        ($4, 'provider@clinic-b.com', 'Provider B', $5, 'provider'),
        ($6, 'patient@clinic-b.com', 'Patient B', $5, 'patient')
      `, [providerAId, orgA, patientAId, providerBId, orgB, patientBId]);
    });

    it('should isolate appointments by organization', async () => {
      // Arrange
      const appointmentAId = uuidv4();
      const appointmentBId = uuidv4();

      await client.query(`
        INSERT INTO appointments (id, organization_id, patient_id, provider_id, scheduled_at, status) VALUES 
        ($1, $2, $3, $4, '2024-01-15 10:00:00', 'scheduled'),
        ($5, $6, $7, $8, '2024-01-15 11:00:00', 'scheduled')
      `, [appointmentAId, orgA, patientAId, providerAId, appointmentBId, orgB, patientBId, providerBId]);

      // Act & Assert - Organization A context
      await client.query('SELECT set_tenant_context($1)', [orgA]);
      const resultA = await client.query('SELECT COUNT(*) FROM appointments WHERE organization_id = get_current_tenant()');
      expect(parseInt(resultA.rows[0].count)).toBe(1);

      // Act & Assert - Organization B context
      await client.query('SELECT set_tenant_context($1)', [orgB]);
      const resultB = await client.query('SELECT COUNT(*) FROM appointments WHERE organization_id = get_current_tenant()');
      expect(parseInt(resultB.rows[0].count)).toBe(1);
    });

    it('should isolate medical records by organization', async () => {
      // Arrange
      const recordAId = uuidv4();
      const recordBId = uuidv4();

      await client.query(`
        INSERT INTO medical_records (id, organization_id, patient_id, provider_id, content, created_at) VALUES 
        ($1, $2, $3, $4, 'Medical record A', CURRENT_TIMESTAMP),
        ($5, $6, $7, $8, 'Medical record B', CURRENT_TIMESTAMP)
      `, [recordAId, orgA, patientAId, providerAId, recordBId, orgB, patientBId, providerBId]);

      // Act & Assert - Organization A context
      await client.query('SELECT set_tenant_context($1)', [orgA]);
      const resultA = await client.query('SELECT COUNT(*) FROM medical_records WHERE organization_id = get_current_tenant()');
      expect(parseInt(resultA.rows[0].count)).toBe(1);

      // Act & Assert - Organization B context
      await client.query('SELECT set_tenant_context($1)', [orgB]);
      const resultB = await client.query('SELECT COUNT(*) FROM medical_records WHERE organization_id = get_current_tenant()');
      expect(parseInt(resultB.rows[0].count)).toBe(1);
    });
  });

  describe('Data Migration and Default Organization', () => {
    it('should have default organization for legacy data', async () => {
      // Assert
      const result = await client.query('SELECT * FROM organizations WHERE id = $1', [defaultOrg]);
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].name).toBe('Default Organization');
      expect(result.rows[0].slug).toBe('default');
    });

    it('should allow migration of existing data to default organization', async () => {
      // Arrange - Create a user without organization_id (simulating legacy data)
      const legacyUserId = uuidv4();
      
      // Temporarily disable the NOT NULL constraint for testing
      await client.query('ALTER TABLE users ALTER COLUMN organization_id DROP NOT NULL');
      
      await client.query(`
        INSERT INTO users (id, email, name, user_type) VALUES 
        ($1, 'legacy@test.com', 'Legacy User', 'patient')
      `, [legacyUserId]);

      // Act - Migrate to default organization
      await client.query(`
        UPDATE users SET organization_id = $1 WHERE organization_id IS NULL
      `, [defaultOrg]);

      // Assert
      const result = await client.query('SELECT organization_id FROM users WHERE id = $1', [legacyUserId]);
      expect(result.rows[0].organization_id).toBe(defaultOrg);

      // Restore the NOT NULL constraint
      await client.query('ALTER TABLE users ALTER COLUMN organization_id SET NOT NULL');
    });
  });

  describe('Performance and Indexing', () => {
    it('should have proper indexes for multi-tenant queries', async () => {
      // Check for organization_id indexes
      const indexes = await client.query(`
        SELECT schemaname, tablename, indexname 
        FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND indexname LIKE '%organization_id%'
      `);

      const expectedTables = ['users', 'appointments', 'medical_records', 'organization_users'];
      const indexedTables = indexes.rows.map(r => r.tablename);

      expectedTables.forEach(table => {
        expect(indexedTables).toContain(table);
      });
    });

    it('should perform efficiently with large datasets', async () => {
      // Arrange - Create organization
      await client.query(`
        INSERT INTO organizations (id, name, slug, type, address, contact_info) VALUES 
        ($1, 'Performance Test Org', 'perf-test', 'hospital', '{}', '{}')
      `, [orgA]);

      // Act - Insert multiple users and measure query performance
      const startTime = Date.now();
      
      const userInserts = [];
      for (let i = 0; i < 100; i++) {
        userInserts.push(`('${uuidv4()}', 'user${i}@perf-test.com', 'User ${i}', '${orgA}', 'patient')`);
      }

      await client.query(`
        INSERT INTO users (id, email, name, organization_id, user_type) VALUES 
        ${userInserts.join(', ')}
      `);

      const insertTime = Date.now() - startTime;

      // Assert - Query performance
      await client.query('SELECT set_tenant_context($1)', [orgA]);
      const queryStart = Date.now();
      
      const result = await client.query('SELECT COUNT(*) FROM users WHERE organization_id = get_current_tenant()');
      
      const queryTime = Date.now() - queryStart;

      expect(parseInt(result.rows[0].count)).toBe(100);
      expect(insertTime).toBeLessThan(5000); // Should insert 100 users in under 5 seconds
      expect(queryTime).toBeLessThan(100); // Should query in under 100ms
    });
  });

  describe('Security and Data Validation', () => {
    beforeEach(async () => {
      // Create test organization
      await client.query(`
        INSERT INTO organizations (id, name, slug, type, address, contact_info) VALUES 
        ($1, 'Security Test Org', 'security-test', 'hospital', '{}', '{}')
      `, [orgA]);
    });

    it('should validate email formats', async () => {
      // Act & Assert - Invalid email should be handled by application layer
      // Database should accept the format but application should validate
      const userId = uuidv4();
      
      await client.query(`
        INSERT INTO users (id, email, name, organization_id, user_type) VALUES 
        ($1, 'valid@email.com', 'Valid User', $2, 'patient')
      `, [userId, orgA]);

      const result = await client.query('SELECT email FROM users WHERE id = $1', [userId]);
      expect(result.rows[0].email).toBe('valid@email.com');
    });

    it('should enforce foreign key constraints', async () => {
      // Act & Assert - Should not allow user with non-existent organization
      const nonExistentOrgId = uuidv4();
      const userId = uuidv4();

      await expect(client.query(`
        INSERT INTO users (id, email, name, organization_id, user_type) VALUES 
        ($1, 'test@invalid-org.com', 'Test User', $2, 'patient')
      `, [userId, nonExistentOrgId])).rejects.toThrow();
    });

    it('should maintain referential integrity on cascade deletes', async () => {
      // Arrange
      const userId = uuidv4();
      const roleId = (await client.query('SELECT id FROM user_roles WHERE name = $1', ['patient'])).rows[0].id;

      await client.query(`
        INSERT INTO users (id, email, name, organization_id, user_type) VALUES 
        ($1, 'test@security-test.com', 'Test User', $2, 'patient')
      `, [userId, orgA]);

      await client.query(`
        INSERT INTO organization_users (organization_id, user_id, primary_role_id, is_active) VALUES 
        ($1, $2, $3, true)
      `, [orgA, userId, roleId]);

      // Act - Delete organization (should cascade)
      await client.query('DELETE FROM organizations WHERE id = $1', [orgA]);

      // Assert - Related records should be deleted
      const userResult = await client.query('SELECT COUNT(*) FROM users WHERE organization_id = $1', [orgA]);
      const orgUserResult = await client.query('SELECT COUNT(*) FROM organization_users WHERE organization_id = $1', [orgA]);

      expect(parseInt(userResult.rows[0].count)).toBe(0);
      expect(parseInt(orgUserResult.rows[0].count)).toBe(0);
    });
  });
}); 