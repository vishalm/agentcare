import request from 'supertest';
import { Pool } from 'pg';
import express from 'express';
import { createOrganizationRoutes } from '../../../backend/src/routes/organizationRoutes';
import { OrganizationService } from '../../../backend/src/services/OrganizationService';
import { MultiTenantService } from '../../../backend/src/services/MultiTenantService';
import { Logger } from '../../../backend/src/utils/Logger';

// Mock dependencies
jest.mock('../../../backend/src/services/OrganizationService');
jest.mock('../../../backend/src/services/MultiTenantService');
jest.mock('../../../backend/src/utils/Logger');

describe('Organization Routes Integration Tests', () => {
  let app: express.Application;
  let mockOrganizationService: jest.Mocked<OrganizationService>;
  let mockMultiTenantService: jest.Mocked<MultiTenantService>;
  let mockLogger: jest.Mocked<Logger>;

  const mockOrganizationId = '11111111-1111-1111-1111-111111111111';
  const mockUserId = '22222222-2222-2222-2222-222222222222';

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock services
    mockOrganizationService = {
      createOrganization: jest.fn(),
      registerProvider: jest.fn(),
      registerPatient: jest.fn(),
      addCaregiver: jest.fn(),
      getOnboardingStatus: jest.fn(),
      getOrganizationStats: jest.fn(),
      findById: jest.fn(),
    } as any;

    mockMultiTenantService = {
      resolveTenantMiddleware: jest.fn(() => (req: any, res: any, next: any) => next()),
    } as any;

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as any;

    // Set up Express app
    app = express();
    app.use(express.json());
    app.use('/api/v1/organizations', createOrganizationRoutes(
      mockOrganizationService,
      mockMultiTenantService,
      mockLogger
    ));
  });

  describe('POST /api/v1/organizations', () => {
    const validOrganizationData = {
      name: 'Test Hospital',
      slug: 'test-hospital',
      type: 'hospital',
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

    it('should successfully create a new organization', async () => {
      // Arrange
      const mockOrganization = {
        id: mockOrganizationId,
        ...validOrganizationData,
        created_at: new Date(),
        updated_at: new Date()
      };

      mockOrganizationService.createOrganization.mockResolvedValueOnce(mockOrganization as any);

      // Act
      const response = await request(app)
        .post('/api/v1/organizations')
        .send(validOrganizationData)
        .expect(201);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data.organization.name).toBe(validOrganizationData.name);
      expect(response.body.data.domain).toBe('test-hospital.agentcare.com');
      expect(mockOrganizationService.createOrganization).toHaveBeenCalledWith(validOrganizationData);
      expect(mockLogger.info).toHaveBeenCalledWith('Organization created via API', {
        organizationId: mockOrganizationId,
        name: validOrganizationData.name,
        type: validOrganizationData.type
      });
    });

    it('should create organization with admin user when provided', async () => {
      // Arrange
      const dataWithAdmin = {
        ...validOrganizationData,
        adminUser: {
          email: 'admin@testhospital.com',
          name: 'Hospital Administrator'
        }
      };

      const mockOrganization = { id: mockOrganizationId, ...validOrganizationData };
      const mockAdminUser = { id: mockUserId, email: 'admin@testhospital.com' };

      mockOrganizationService.createOrganization.mockResolvedValueOnce(mockOrganization as any);
      mockOrganizationService.registerProvider.mockResolvedValueOnce({
        user: mockAdminUser,
        organizationUser: { id: 'org-user-id' }
      } as any);

      // Act
      const response = await request(app)
        .post('/api/v1/organizations')
        .send(dataWithAdmin)
        .expect(201);

      // Assert
      expect(response.body.success).toBe(true);
      expect(mockOrganizationService.registerProvider).toHaveBeenCalledWith(mockOrganizationId, {
        email: 'admin@testhospital.com',
        name: 'Hospital Administrator',
        role: 'organization_owner',
        department: 'Administration'
      });
    });

    it('should return 400 for missing required fields', async () => {
      // Arrange
      const invalidData = {
        name: 'Test Hospital'
        // Missing required fields
      };

      // Act
      const response = await request(app)
        .post('/api/v1/organizations')
        .send(invalidData)
        .expect(400);

      // Assert
      expect(response.body.error).toBe('Missing required fields');
      expect(response.body.required).toEqual(['name', 'slug', 'type', 'address', 'contactInfo']);
    });

    it('should handle service errors gracefully', async () => {
      // Arrange
      const serviceError = new Error('Database connection failed');
      mockOrganizationService.createOrganization.mockRejectedValueOnce(serviceError);

      // Act
      const response = await request(app)
        .post('/api/v1/organizations')
        .send(validOrganizationData)
        .expect(400);

      // Assert
      expect(response.body.error).toBe('Database connection failed');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to create organization via API', {
        error: serviceError
      });
    });
  });

  describe('POST /api/v1/organizations/:id/providers', () => {
    const validProviderData = {
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
      const mockUser = { id: mockUserId, email: validProviderData.email };
      const mockOrgUser = { id: 'org-user-id' };
      
      mockOrganizationService.registerProvider.mockResolvedValueOnce({
        user: mockUser,
        organizationUser: mockOrgUser
      } as any);

      // Act
      const response = await request(app)
        .post(`/api/v1/organizations/${mockOrganizationId}/providers`)
        .send(validProviderData)
        .expect(201);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(validProviderData.email);
      expect(response.body.data.message).toContain('Provider registered successfully');
      expect(mockOrganizationService.registerProvider).toHaveBeenCalledWith(
        mockOrganizationId,
        validProviderData
      );
    });

    it('should return 400 for missing required fields', async () => {
      // Arrange
      const invalidData = {
        email: 'doctor@test.com'
        // Missing name and role
      };

      // Act
      const response = await request(app)
        .post(`/api/v1/organizations/${mockOrganizationId}/providers`)
        .send(invalidData)
        .expect(400);

      // Assert
      expect(response.body.error).toBe('Missing required fields');
      expect(response.body.required).toEqual(['email', 'name', 'role']);
    });

    it('should return 400 for invalid provider role', async () => {
      // Arrange
      const invalidRoleData = {
        ...validProviderData,
        role: 'invalid_role'
      };

      // Act
      const response = await request(app)
        .post(`/api/v1/organizations/${mockOrganizationId}/providers`)
        .send(invalidRoleData)
        .expect(400);

      // Assert
      expect(response.body.error).toBe('Invalid provider role');
      expect(response.body.validRoles).toContain('attending_physician');
      expect(response.body.validRoles).toContain('nurse_practitioner');
    });

    it('should handle duplicate provider registration', async () => {
      // Arrange
      const duplicateError = new Error('Provider with this email already exists in organization');
      mockOrganizationService.registerProvider.mockRejectedValueOnce(duplicateError);

      // Act
      const response = await request(app)
        .post(`/api/v1/organizations/${mockOrganizationId}/providers`)
        .send(validProviderData)
        .expect(400);

      // Assert
      expect(response.body.error).toBe('Provider with this email already exists in organization');
    });
  });

  describe('POST /api/v1/organizations/:id/patients', () => {
    const validPatientData = {
      email: 'patient@test.com',
      name: 'Test Patient',
      dateOfBirth: '1990-01-01',
      gender: 'female',
      phone: '+1-555-0123',
      address: {
        street: '789 Patient St',
        city: 'Test City',
        state: 'NY',
        zip: '10001'
      },
      emergencyContact: {
        name: 'Emergency Contact',
        phone: '+1-555-0124'
      },
      insuranceInfo: {
        provider: 'Test Insurance',
        policyNumber: 'INS-123456'
      }
    };

    it('should successfully register a patient', async () => {
      // Arrange
      const mockPatient = {
        id: mockUserId,
        email: validPatientData.email,
        medical_record_number: 'TEST-HOSPITAL-123456'
      };

      mockOrganizationService.registerPatient.mockResolvedValueOnce(mockPatient as any);

      // Act
      const response = await request(app)
        .post(`/api/v1/organizations/${mockOrganizationId}/patients`)
        .send(validPatientData)
        .expect(201);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data.patient.email).toBe(validPatientData.email);
      expect(response.body.data.message).toBe('Patient registered successfully');
      expect(mockOrganizationService.registerPatient).toHaveBeenCalledWith(
        mockOrganizationId,
        expect.objectContaining({
          email: validPatientData.email,
          dateOfBirth: new Date(validPatientData.dateOfBirth)
        })
      );
    });

    it('should return 400 for missing required fields', async () => {
      // Arrange
      const invalidData = {
        email: 'patient@test.com'
        // Missing name and dateOfBirth
      };

      // Act
      const response = await request(app)
        .post(`/api/v1/organizations/${mockOrganizationId}/patients`)
        .send(invalidData)
        .expect(400);

      // Assert
      expect(response.body.error).toBe('Missing required fields');
      expect(response.body.required).toEqual(['email', 'name', 'dateOfBirth']);
    });

    it('should return 400 for invalid date format', async () => {
      // Arrange
      const invalidDateData = {
        ...validPatientData,
        dateOfBirth: 'invalid-date'
      };

      // Act
      const response = await request(app)
        .post(`/api/v1/organizations/${mockOrganizationId}/patients`)
        .send(invalidDateData)
        .expect(400);

      // Assert
      expect(response.body.error).toBe('Invalid date of birth format');
    });
  });

  describe('POST /api/v1/organizations/:id/patients/:patientId/caregivers', () => {
    const mockPatientId = '44444444-4444-4444-4444-444444444444';
    const validCaregiverData = {
      caregiverEmail: 'caregiver@test.com',
      caregiverName: 'Test Caregiver',
      relationshipType: 'spouse',
      authorizationLevel: 'full',
      canScheduleAppointments: true,
      canReceiveMedicalInfo: true,
      canMakeMedicalDecisions: false,
      authorizedBy: mockPatientId
    };

    it('should successfully add a caregiver', async () => {
      // Arrange
      const mockCaregiver = {
        id: 'caregiver-relationship-id',
        relationshipType: 'spouse',
        canScheduleAppointments: true
      };

      mockOrganizationService.addCaregiver.mockResolvedValueOnce(mockCaregiver as any);

      // Act
      const response = await request(app)
        .post(`/api/v1/organizations/${mockOrganizationId}/patients/${mockPatientId}/caregivers`)
        .send(validCaregiverData)
        .expect(201);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data.caregiver.relationshipType).toBe('spouse');
      expect(response.body.data.message).toBe('Caregiver added successfully');
      expect(mockOrganizationService.addCaregiver).toHaveBeenCalledWith(
        mockOrganizationId,
        expect.objectContaining({
          patientId: mockPatientId,
          caregiverEmail: validCaregiverData.caregiverEmail
        })
      );
    });

    it('should return 400 for invalid relationship type', async () => {
      // Arrange
      const invalidRelationshipData = {
        ...validCaregiverData,
        relationshipType: 'invalid_relationship'
      };

      // Act
      const response = await request(app)
        .post(`/api/v1/organizations/${mockOrganizationId}/patients/${mockPatientId}/caregivers`)
        .send(invalidRelationshipData)
        .expect(400);

      // Assert
      expect(response.body.error).toBe('Invalid relationship type');
      expect(response.body.validTypes).toContain('spouse');
      expect(response.body.validTypes).toContain('parent');
      expect(response.body.validTypes).toContain('guardian');
    });
  });

  describe('POST /api/v1/organizations/:id/staff', () => {
    const validStaffData = {
      email: 'staff@testhospital.com',
      name: 'Test Staff',
      role: 'front_desk',
      department: 'Administration',
      employmentType: 'full_time'
    };

    it('should successfully register support staff', async () => {
      // Arrange
      const mockUser = { id: mockUserId, email: validStaffData.email };
      const mockOrgUser = { id: 'org-user-id' };

      mockOrganizationService.registerProvider.mockResolvedValueOnce({
        user: mockUser,
        organizationUser: mockOrgUser
      } as any);

      // Act
      const response = await request(app)
        .post(`/api/v1/organizations/${mockOrganizationId}/staff`)
        .send(validStaffData)
        .expect(201);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(validStaffData.email);
      expect(response.body.data.message).toBe('Staff member registered successfully');
    });

    it('should return 400 for invalid staff role', async () => {
      // Arrange
      const invalidRoleData = {
        ...validStaffData,
        role: 'invalid_staff_role'
      };

      // Act
      const response = await request(app)
        .post(`/api/v1/organizations/${mockOrganizationId}/staff`)
        .send(invalidRoleData)
        .expect(400);

      // Assert
      expect(response.body.error).toBe('Invalid staff role');
      expect(response.body.validRoles).toContain('front_desk');
      expect(response.body.validRoles).toContain('medical_assistant');
    });
  });

  describe('POST /api/v1/organizations/:id/bulk/providers', () => {
    const validBulkData = {
      providers: [
        {
          email: 'bulk1@hospital.com',
          name: 'Bulk Provider 1',
          role: 'attending_physician',
          specialties: ['Cardiology'],
          department: 'Cardiology'
        },
        {
          email: 'bulk2@hospital.com',
          name: 'Bulk Provider 2',
          role: 'registered_nurse',
          department: 'Emergency Department'
        }
      ]
    };

    it('should handle bulk provider registration with mixed results', async () => {
      // Arrange
      mockOrganizationService.registerProvider
        .mockResolvedValueOnce({ user: { id: 'user1' }, organizationUser: {} } as any)
        .mockRejectedValueOnce(new Error('Invalid email format'));

      // Act
      const response = await request(app)
        .post(`/api/v1/organizations/${mockOrganizationId}/bulk/providers`)
        .send(validBulkData)
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data.successful).toHaveLength(1);
      expect(response.body.data.failed).toHaveLength(1);
      expect(response.body.summary.total).toBe(2);
      expect(response.body.summary.successful).toBe(1);
      expect(response.body.summary.failed).toBe(1);
    });

    it('should return 400 for empty providers array', async () => {
      // Act
      const response = await request(app)
        .post(`/api/v1/organizations/${mockOrganizationId}/bulk/providers`)
        .send({ providers: [] })
        .expect(400);

      // Assert
      expect(response.body.error).toBe('Providers array is required');
    });
  });

  describe('GET /api/v1/organizations/:id', () => {
    it('should successfully get organization details', async () => {
      // Arrange
      const mockOrganization = {
        id: mockOrganizationId,
        name: 'Test Hospital',
        slug: 'test-hospital',
        type: 'hospital'
      };

      mockOrganizationService.findById.mockResolvedValueOnce(mockOrganization as any);

      // Act
      const response = await request(app)
        .get(`/api/v1/organizations/${mockOrganizationId}`)
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Test Hospital');
      expect(mockOrganizationService.findById).toHaveBeenCalledWith(mockOrganizationId);
    });

    it('should return 404 for non-existent organization', async () => {
      // Arrange
      mockOrganizationService.findById.mockResolvedValueOnce(null);

      // Act
      const response = await request(app)
        .get(`/api/v1/organizations/${mockOrganizationId}`)
        .expect(404);

      // Assert
      expect(response.body.error).toBe('Organization not found');
    });
  });

  describe('GET /api/v1/organizations/:id/stats', () => {
    it('should return organization statistics', async () => {
      // Arrange
      const mockStats = {
        totalUsers: 25,
        totalProviders: 8,
        totalPatients: 15,
        appointmentsThisMonth: 45,
        appointmentsLastMonth: 38,
        subscriptionStatus: 'active'
      };

      mockOrganizationService.getOrganizationStats.mockResolvedValueOnce(mockStats as any);

      // Act
      const response = await request(app)
        .get(`/api/v1/organizations/${mockOrganizationId}/stats`)
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalUsers).toBe(25);
      expect(response.body.data.totalProviders).toBe(8);
      expect(response.body.data.subscriptionStatus).toBe('active');
    });
  });

  describe('GET /api/v1/organizations/:id/onboarding', () => {
    it('should return onboarding status', async () => {
      // Arrange
      const mockStatus = {
        step: 'providers',
        completedSteps: ['organization', 'admin_user'],
        currentStep: 'providers',
        totalSteps: 5,
        isComplete: false,
        organizationId: mockOrganizationId
      };

      mockOrganizationService.getOnboardingStatus.mockResolvedValueOnce(mockStatus as any);

      // Act
      const response = await request(app)
        .get(`/api/v1/organizations/${mockOrganizationId}/onboarding`)
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data.currentStep).toBe('providers');
      expect(response.body.data.isComplete).toBe(false);
      expect(response.body.data.completedSteps).toContain('organization');
    });
  });

  describe('GET /api/v1/organizations/:id/roles', () => {
    it('should return available user roles', async () => {
      // Act
      const response = await request(app)
        .get(`/api/v1/organizations/${mockOrganizationId}/roles`)
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data).toContainEqual(
        expect.objectContaining({
          name: 'attending_physician',
          category: 'provider'
        })
      );
    });
  });

  describe('GET /api/v1/organizations/:id/departments', () => {
    it('should return organization departments', async () => {
      // Act
      const response = await request(app)
        .get(`/api/v1/organizations/${mockOrganizationId}/departments`)
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data).toContainEqual(
        expect.objectContaining({
          name: 'Emergency Department',
          type: 'clinical'
        })
      );
    });
  });

  describe('Multi-Tenant Middleware', () => {
    it('should call tenant resolution middleware for protected routes', async () => {
      // Arrange
      const mockOrganization = { id: mockOrganizationId, name: 'Test' };
      mockOrganizationService.findById.mockResolvedValueOnce(mockOrganization as any);

      // Act
      await request(app)
        .get(`/api/v1/organizations/${mockOrganizationId}`)
        .expect(200);

      // Assert
      expect(mockMultiTenantService.resolveTenantMiddleware).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors with proper status codes', async () => {
      // Arrange
      const serviceError = new Error('Service temporarily unavailable');
      mockOrganizationService.findById.mockRejectedValueOnce(serviceError);

      // Act
      const response = await request(app)
        .get(`/api/v1/organizations/${mockOrganizationId}`)
        .expect(500);

      // Assert
      expect(response.body.error).toBe('Internal server error');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to get organization', {
        error: serviceError
      });
    });

    it('should log all API operations', async () => {
      // Arrange
      const mockOrganization = { id: mockOrganizationId };
      mockOrganizationService.createOrganization.mockResolvedValueOnce(mockOrganization as any);

      // Act
      await request(app)
        .post('/api/v1/organizations')
        .send({
          name: 'Test Hospital',
          slug: 'test-hospital',
          type: 'hospital',
          address: { street: '123 Test St', city: 'Test', state: 'NY', zip: '10001', country: 'USA' },
          contactInfo: { phone: '+1-555-0100', email: 'admin@test.com' }
        });

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('Organization created via API', {
        organizationId: mockOrganizationId,
        name: 'Test Hospital',
        type: 'hospital'
      });
    });
  });
}); 