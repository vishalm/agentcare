import { Pool, PoolClient } from 'pg';
import { OrganizationService } from '../../../backend/src/services/OrganizationService';
import { Logger } from '../../../backend/src/utils/Logger';
import { Organization, OrganizationUser, PatientCaregiver, OrganizationType } from '../../../backend/src/types/MultiTenant';

// Mock dependencies
jest.mock('pg');
jest.mock('../../../backend/src/utils/Logger');

describe.skip('OrganizationService', () => {
  let organizationService: OrganizationService;
  let mockPool: jest.Mocked<Pool>;
  let mockClient: any;
  let mockLogger: jest.Mocked<Logger>;

  const mockOrganizationData = {
    name: 'Test Hospital',
    slug: 'test-hospital',
    type: 'hospital' as OrganizationType,
    address: {
      street: '123 Test St',
      city: 'Test City',
      state: 'NY',
      zip: '10001',
      country: 'USA'
    },
    contactInfo: {
      phone: '+1-555-0100',
      email: 'admin@testhospital.com'
    }
  };

  const mockOrganizationId = '11111111-1111-1111-1111-111111111111';
  const mockUserId = '22222222-2222-2222-2222-222222222222';
  const mockRoleId = '33333333-3333-3333-3333-333333333333';

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock pool and client
    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };

    mockPool = {
      connect: jest.fn().mockResolvedValue(mockClient),
    } as any;

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as any;

    organizationService = new OrganizationService(mockPool, mockLogger);
  });

  describe('createOrganization', () => {
    it('should successfully create a new healthcare organization', async () => {
      // Arrange
      const expectedOrganization = {
        id: mockOrganizationId,
        ...mockOrganizationData,
        onboarding_status: 'pending',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      };

      mockClient.query
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockResolvedValueOnce(undefined) // Set tenant context
        .mockResolvedValueOnce({ rows: [] }) // Check slug uniqueness
        .mockResolvedValueOnce({ rows: [expectedOrganization] }) // Insert organization
        .mockResolvedValueOnce(undefined) // Create default departments
        .mockResolvedValueOnce(undefined) // Create organization domain
        .mockResolvedValueOnce(undefined); // COMMIT

      // Act
      const result = await organizationService.createOrganization(mockOrganizationData);

      // Assert
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.query).toHaveBeenCalledWith(
        'SELECT id FROM organizations WHERE slug = $1',
        ['test-hospital']
      );
      expect(result.name).toBe(mockOrganizationData.name);
      expect(result.slug).toBe(mockOrganizationData.slug);
      expect(mockLogger.info).toHaveBeenCalledWith('Creating healthcare organization', {
        name: mockOrganizationData.name,
        type: mockOrganizationData.type
      });
    });

    it('should throw error for duplicate slug', async () => {
      // Arrange
      mockClient.query
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockResolvedValueOnce(undefined) // Set tenant context
        .mockResolvedValueOnce({ rows: [{ id: 'existing-id' }] }) // Slug exists
        .mockResolvedValueOnce(undefined); // ROLLBACK

      // Act & Assert
      await expect(organizationService.createOrganization(mockOrganizationData))
        .rejects.toThrow("Organization slug 'test-hospital' already exists");

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });

    it('should throw error for missing required fields', async () => {
      // Arrange
      const invalidData = { name: 'Test' }; // Missing required fields

      // Act & Assert
      await expect(organizationService.createOrganization(invalidData as any))
        .rejects.toThrow('Missing required organization fields');
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      const dbError = new Error('Database connection failed');
      mockClient.query.mockRejectedValueOnce(dbError);

      // Act & Assert
      await expect(organizationService.createOrganization(mockOrganizationData))
        .rejects.toThrow(dbError);

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to create organization', {
        data: mockOrganizationData,
        error: dbError
      });
    });
  });

  describe('registerProvider', () => {
    const mockProviderData = {
      email: 'doctor@testhospital.com',
      name: 'Dr. Test Provider',
      role: 'attending_physician',
      specialties: ['Cardiology'],
      licenseNumber: 'MD-12345',
      licenseState: 'NY',
      department: 'Cardiology'
    };

    it('should successfully register a healthcare provider', async () => {
      // Arrange
      const mockRole = { id: mockRoleId, category: 'provider', level: 20 };
      const mockUser = { id: mockUserId, email: mockProviderData.email, name: mockProviderData.name };
      const mockOrgUser = { id: 'org-user-id', organization_id: mockOrganizationId, user_id: mockUserId };

      mockClient.query
        .mockResolvedValueOnce({ rows: [] }) // Check existing user
        .mockResolvedValueOnce({ rows: [mockRole] }) // Get role
        .mockResolvedValueOnce({ rows: [mockUser] }) // Create user
        .mockResolvedValueOnce({ rows: [mockOrgUser] }); // Create org user

      // Act
      const result = await organizationService.registerProvider(mockOrganizationId, mockProviderData);

      // Assert
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.query).toHaveBeenCalledWith('SELECT set_tenant_context($1)', [mockOrganizationId]);
      expect(result.user.email).toBe(mockProviderData.email);
      expect(mockLogger.info).toHaveBeenCalledWith('Provider registered successfully', {
        userId: mockUserId,
        organizationId: mockOrganizationId,
        role: mockProviderData.role
      });
    });

    it('should throw error for duplicate provider email in same organization', async () => {
      // Arrange
      mockClient.query
        .mockResolvedValueOnce({ rows: [{ id: 'existing-user' }] }); // User exists

      // Act & Assert
      await expect(organizationService.registerProvider(mockOrganizationId, mockProviderData))
        .rejects.toThrow('Provider with this email already exists in organization');

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });

    it('should throw error for invalid role', async () => {
      // Arrange
      mockClient.query
        .mockResolvedValueOnce({ rows: [] }) // No existing user
        .mockResolvedValueOnce({ rows: [] }); // Invalid role

      // Act & Assert
      await expect(organizationService.registerProvider(mockOrganizationId, {
        ...mockProviderData,
        role: 'invalid_role'
      })).rejects.toThrow('Invalid role: invalid_role');
    });
  });

  describe('registerPatient', () => {
    const mockPatientData = {
      email: 'patient@test.com',
      name: 'Test Patient',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'female',
      phone: '+1-555-0123',
      address: { street: '789 Patient St', city: 'Test City', state: 'NY', zip: '10001' },
      emergencyContact: { name: 'Emergency Contact', phone: '+1-555-0124' },
      insuranceInfo: { provider: 'Test Insurance', policyNumber: 'INS-123456' }
    };

    it('should successfully register a patient', async () => {
      // Arrange
      const mockOrgSlug = { slug: 'test-hospital' };
      const mockPatientRole = { id: mockRoleId };
      const mockPatient = {
        id: mockUserId,
        email: mockPatientData.email,
        medical_record_number: 'TEST-HOSPITAL-123456'
      };

      mockClient.query
        .mockResolvedValueOnce({ rows: [] }) // Check existing patient
        .mockResolvedValueOnce({ rows: [mockOrgSlug] }) // Get org slug
        .mockResolvedValueOnce({ rows: [mockPatient] }) // Create patient
        .mockResolvedValueOnce({ rows: [mockPatientRole] }) // Get patient role
        .mockResolvedValueOnce({ rows: [] }); // Create org user

      // Act
      const result = await organizationService.registerPatient(mockOrganizationId, mockPatientData);

      // Assert
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(result.email).toBe(mockPatientData.email);
      expect(result.medical_record_number).toContain('TEST-HOSPITAL');
      expect(mockLogger.info).toHaveBeenCalledWith('Patient registered successfully', {
        userId: mockUserId,
        organizationId: mockOrganizationId,
        medicalRecordNumber: mockPatient.medical_record_number
      });
    });

    it('should throw error for duplicate patient email in same organization', async () => {
      // Arrange
      mockClient.query
        .mockResolvedValueOnce({ rows: [{ id: 'existing-patient' }] }); // Patient exists

      // Act & Assert
      await expect(organizationService.registerPatient(mockOrganizationId, mockPatientData))
        .rejects.toThrow('Patient with this email already exists');
    });

    it('should generate medical record number if not provided', async () => {
      // Arrange
      const mockOrgSlug = { slug: 'test-hospital' };
      const mockPatientRole = { id: mockRoleId };
      const mockPatient = {
        id: mockUserId,
        email: mockPatientData.email,
        medical_record_number: 'TEST-HOSPITAL-123456'
      };

      mockClient.query
        .mockResolvedValueOnce({ rows: [] }) // Check existing patient
        .mockResolvedValueOnce({ rows: [mockOrgSlug] }) // Get org slug
        .mockResolvedValueOnce({ rows: [mockPatient] }) // Create patient
        .mockResolvedValueOnce({ rows: [mockPatientRole] }) // Get patient role
        .mockResolvedValueOnce({ rows: [] }); // Create org user

      // Act
      const result = await organizationService.registerPatient(mockOrganizationId, {
        ...mockPatientData,
        medicalRecordNumber: undefined
      });

      // Assert
      expect(result.medical_record_number).toMatch(/TEST-HOSPITAL-\d{6}/);
    });
  });

  describe('addCaregiver', () => {
    const mockPatientId = '44444444-4444-4444-4444-444444444444';
    const mockCaregiverData = {
      patientId: mockPatientId,
      caregiverEmail: 'caregiver@test.com',
      caregiverName: 'Test Caregiver',
      relationshipType: 'spouse',
      authorizationLevel: 'full',
      canScheduleAppointments: true,
      canReceiveMedicalInfo: true,
      canMakeMedicalDecisions: false,
      authorizedBy: mockPatientId
    };

    it('should successfully add a caregiver relationship', async () => {
      // Arrange
      const mockCaregiverRole = { id: mockRoleId };
      const mockCaregiver = { id: mockUserId };
      const mockRelationship = {
        id: 'relationship-id',
        organization_id: mockOrganizationId,
        patient_id: mockPatientId,
        caregiver_id: mockUserId,
        relationship_type: 'spouse'
      };

      mockClient.query
        .mockResolvedValueOnce({ rows: [] }) // Check existing caregiver
        .mockResolvedValueOnce({ rows: [mockCaregiver] }) // Create caregiver user
        .mockResolvedValueOnce({ rows: [mockCaregiverRole] }) // Get caregiver role
        .mockResolvedValueOnce({ rows: [] }) // Create org user
        .mockResolvedValueOnce({ rows: [mockRelationship] }); // Create relationship

      // Act
      const result = await organizationService.addCaregiver(mockOrganizationId, mockCaregiverData);

      // Assert
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(result.relationshipType).toBe('spouse');
      expect(result.canScheduleAppointments).toBe(true);
      expect(mockLogger.info).toHaveBeenCalledWith('Caregiver relationship added successfully', {
        patientId: mockPatientId,
        caregiverId: mockUserId,
        relationshipType: 'spouse'
      });
    });

    it('should use existing caregiver if already exists', async () => {
      // Arrange
      const mockExistingCaregiver = { id: mockUserId };
      const mockRelationship = {
        id: 'relationship-id',
        organization_id: mockOrganizationId,
        patient_id: mockPatientId,
        caregiver_id: mockUserId
      };

      mockClient.query
        .mockResolvedValueOnce({ rows: [mockExistingCaregiver] }) // Existing caregiver
        .mockResolvedValueOnce({ rows: [mockRelationship] }); // Create relationship

      // Act
      const result = await organizationService.addCaregiver(mockOrganizationId, mockCaregiverData);

      // Assert
      expect(mockClient.query).not.toHaveBeenCalledWith(
        expect.stringMatching(/INSERT INTO users/)
      );
      expect(result).toBeDefined();
    });
  });

  describe('getOnboardingStatus', () => {
    it('should return correct onboarding status', async () => {
      // Arrange
      const mockStats = {
        onboarding_status: 'in_progress',
        user_count: '5',
        provider_count: '3',
        patient_count: '10'
      };

      mockClient.query.mockResolvedValueOnce({ rows: [mockStats] });

      // Act
      const result = await organizationService.getOnboardingStatus(mockOrganizationId);

      // Assert
      expect(result.currentStep).toBeDefined();
      expect(result.completedSteps).toContain('organization');
      expect(result.isComplete).toBe(false);
      expect(result.organizationId).toBe(mockOrganizationId);
    });

    it('should mark as complete when all steps are done', async () => {
      // Arrange
      const mockStats = {
        onboarding_status: 'completed',
        user_count: '10',
        provider_count: '5',
        patient_count: '20'
      };

      mockClient.query.mockResolvedValueOnce({ rows: [mockStats] });

      // Act
      const result = await organizationService.getOnboardingStatus(mockOrganizationId);

      // Assert
      expect(result.completedSteps).toContain('organization');
      expect(result.completedSteps).toContain('admin_user');
      expect(result.completedSteps).toContain('providers');
    });
  });

  describe('getOrganizationStats', () => {
    it('should return organization statistics', async () => {
      // Arrange
      const mockStats = {
        total_users: '25',
        total_providers: '8',
        total_patients: '15',
        appointments_this_month: '45',
        appointments_last_month: '38'
      };

      mockClient.query.mockResolvedValueOnce({ rows: [mockStats] });

      // Act
      const result = await organizationService.getOrganizationStats(mockOrganizationId);

      // Assert
      expect(result.totalUsers).toBe(25);
      expect(result.totalProviders).toBe(8);
      expect(result.totalPatients).toBe(15);
      expect(result.appointmentsThisMonth).toBe(45);
      expect(result.appointmentsLastMonth).toBe(38);
      expect(result.subscriptionStatus).toBe('active');
    });
  });

  describe('Data Isolation', () => {
    it('should set tenant context for all operations', async () => {
      // Arrange
      const mockRole = { id: mockRoleId, category: 'provider', level: 20 };
      const mockUser = { id: mockUserId, email: 'test@test.com', name: 'Test' };
      const mockOrgUser = { id: 'org-user-id' };

      mockClient.query
        .mockResolvedValueOnce({ rows: [] }) // Check existing user
        .mockResolvedValueOnce({ rows: [mockRole] }) // Get role
        .mockResolvedValueOnce({ rows: [mockUser] }) // Create user
        .mockResolvedValueOnce({ rows: [mockOrgUser] }); // Create org user

      // Act
      await organizationService.registerProvider(mockOrganizationId, {
        email: 'test@test.com',
        name: 'Test Provider',
        role: 'attending_physician'
      });

      // Assert
      expect(mockClient.query).toHaveBeenCalledWith('SELECT set_tenant_context($1)', [mockOrganizationId]);
    });
  });

  describe('Error Handling', () => {
    it('should rollback transaction on any error', async () => {
      // Arrange
      const dbError = new Error('Database error');
      mockClient.query
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockResolvedValueOnce(undefined) // Set tenant context
        .mockRejectedValueOnce(dbError); // Fail on next operation

      // Act & Assert
      await expect(organizationService.registerProvider(mockOrganizationId, {
        email: 'test@test.com',
        name: 'Test',
        role: 'attending_physician'
      })).rejects.toThrow(dbError);

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });

    it('should release client connection in finally block', async () => {
      // Arrange
      mockClient.query.mockRejectedValueOnce(new Error('Test error'));

      // Act
      try {
        await organizationService.createOrganization(mockOrganizationData);
      } catch (error) {
        // Expected to throw
      }

      // Assert
      expect(mockClient.release).toHaveBeenCalled();
    });
  });
}); 