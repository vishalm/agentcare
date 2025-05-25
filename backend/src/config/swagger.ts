import swaggerJSDoc from 'swagger-jsdoc';
import { SwaggerDefinition } from 'swagger-jsdoc';

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'AgentCare API',
    version: '3.0.0',
    description: `
# AgentCare - Multi-Tenant Healthcare SaaS Platform API

**Enterprise-grade healthcare scheduling and management system with multi-agent AI coordination**

## Overview

The AgentCare API provides comprehensive endpoints for managing healthcare organizations, users, appointments, and AI-powered scheduling across multiple tenants with full HIPAA compliance.

## Key Features

- 🏥 **Multi-Tenant Healthcare Organizations** - Complete isolation and management
- 👨‍⚕️ **Healthcare Provider Management** - License validation, specialties, departments
- 👥 **Patient Management** - Medical record numbers, caregivers, insurance
- 📅 **Intelligent Scheduling** - AI-powered appointment booking
- 🔒 **HIPAA Compliance** - End-to-end data protection and audit trails
- 🤖 **AI Agent Coordination** - Intelligent healthcare workflow automation

## Authentication

All API endpoints require JWT Bearer token authentication with organization context:

\`\`\`
Authorization: Bearer <jwt_token>
X-Organization-Context: <organization_id>
\`\`\`

## Rate Limiting

- **1000 requests/hour** per organization
- **100 requests/minute** per user
- **10 requests/second** for bulk operations

## HIPAA Compliance

All endpoints maintain strict data isolation between organizations and implement comprehensive audit trails for healthcare data access.
    `,
    contact: {
      name: 'AgentCare API Support',
      email: 'api-support@agentcare.com',
      url: 'https://docs.agentcare.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    },
    termsOfService: 'https://agentcare.com/terms'
  },
  servers: [
    {
      url: 'https://api.agentcare.com/api/v1',
      description: 'Production Server'
    },
    {
      url: 'https://staging-api.agentcare.com/api/v1',
      description: 'Staging Server'
    },
    {
      url: 'http://localhost:3000/api/v1',
      description: 'Development Server'
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT Bearer token for authentication'
      },
      OrganizationContext: {
        type: 'apiKey',
        in: 'header',
        name: 'X-Organization-Context',
        description: 'Organization UUID for multi-tenant context'
      }
    },
    schemas: {
      Organization: {
        type: 'object',
        required: ['name', 'type', 'address', 'contactInfo'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Unique organization identifier',
            example: '550e8400-e29b-41d4-a716-446655440000'
          },
          name: {
            type: 'string',
            description: 'Organization name',
            example: 'General Hospital'
          },
          slug: {
            type: 'string',
            description: 'URL-friendly organization identifier',
            example: 'general-hospital'
          },
          type: {
            type: 'string',
            enum: ['hospital', 'clinic', 'specialty_center', 'urgent_care', 'telehealth', 'diagnostic_center'],
            description: 'Type of healthcare organization',
            example: 'hospital'
          },
          size: {
            type: 'string',
            enum: ['small', 'medium', 'large', 'enterprise'],
            description: 'Organization size',
            example: 'large'
          },
          address: {
            $ref: '#/components/schemas/Address'
          },
          contactInfo: {
            $ref: '#/components/schemas/ContactInfo'
          },
          businessHours: {
            $ref: '#/components/schemas/BusinessHours'
          },
          timezone: {
            type: 'string',
            description: 'Organization timezone',
            example: 'America/Los_Angeles'
          },
          subscriptionTier: {
            type: 'string',
            enum: ['basic', 'professional', 'enterprise'],
            description: 'Subscription tier',
            example: 'professional'
          },
          onboardingStatus: {
            type: 'string',
            enum: ['pending', 'in_progress', 'completed'],
            description: 'Onboarding status',
            example: 'completed'
          },
          isActive: {
            type: 'boolean',
            description: 'Whether organization is active',
            example: true
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp',
            example: '2024-01-15T10:00:00Z'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp',
            example: '2024-01-15T10:00:00Z'
          }
        }
      },
      Address: {
        type: 'object',
        required: ['street', 'city', 'state', 'zip', 'country'],
        properties: {
          street: {
            type: 'string',
            description: 'Street address',
            example: '123 Medical Center Dr'
          },
          city: {
            type: 'string',
            description: 'City',
            example: 'Healthcare City'
          },
          state: {
            type: 'string',
            description: 'State or province',
            example: 'CA'
          },
          zip: {
            type: 'string',
            description: 'ZIP or postal code',
            example: '90210'
          },
          country: {
            type: 'string',
            description: 'Country',
            example: 'USA'
          }
        }
      },
      ContactInfo: {
        type: 'object',
        required: ['phone', 'email'],
        properties: {
          phone: {
            type: 'string',
            description: 'Primary phone number',
            example: '+1-555-0100'
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Primary email address',
            example: 'admin@generalhospital.com'
          },
          website: {
            type: 'string',
            format: 'uri',
            description: 'Organization website',
            example: 'https://generalhospital.com'
          },
          fax: {
            type: 'string',
            description: 'Fax number',
            example: '+1-555-0101'
          }
        }
      },
      BusinessHours: {
        type: 'object',
        properties: {
          monday: { $ref: '#/components/schemas/DayHours' },
          tuesday: { $ref: '#/components/schemas/DayHours' },
          wednesday: { $ref: '#/components/schemas/DayHours' },
          thursday: { $ref: '#/components/schemas/DayHours' },
          friday: { $ref: '#/components/schemas/DayHours' },
          saturday: { $ref: '#/components/schemas/DayHours' },
          sunday: { $ref: '#/components/schemas/DayHours' }
        }
      },
      DayHours: {
        type: 'object',
        properties: {
          open: {
            type: 'string',
            pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
            description: 'Opening time in HH:MM format',
            example: '07:00'
          },
          close: {
            type: 'string',
            pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
            description: 'Closing time in HH:MM format',
            example: '19:00'
          },
          closed: {
            type: 'boolean',
            description: 'Whether the organization is closed this day',
            example: false
          }
        }
      },
      User: {
        type: 'object',
        required: ['email', 'name', 'userType'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Unique user identifier'
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address',
            example: 'user@hospital.com'
          },
          name: {
            type: 'string',
            description: 'Full name',
            example: 'Dr. John Smith'
          },
          userType: {
            type: 'string',
            enum: ['provider', 'patient', 'staff', 'admin'],
            description: 'Type of user',
            example: 'provider'
          },
          medicalRecordNumber: {
            type: 'string',
            description: 'Medical record number (patients only)',
            example: 'GH-2024-001234'
          },
          phone: {
            type: 'string',
            description: 'Phone number',
            example: '+1-555-0102'
          },
          dateOfBirth: {
            type: 'string',
            format: 'date',
            description: 'Date of birth (patients only)',
            example: '1985-06-15'
          },
          gender: {
            type: 'string',
            enum: ['male', 'female', 'other', 'prefer_not_to_say'],
            description: 'Gender (patients only)',
            example: 'male'
          },
          address: {
            $ref: '#/components/schemas/Address'
          },
          isActive: {
            type: 'boolean',
            description: 'Whether user is active',
            example: true
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp'
          }
        }
      },
      HealthcareProvider: {
        allOf: [
          { $ref: '#/components/schemas/User' },
          {
            type: 'object',
            properties: {
              role: {
                type: 'string',
                enum: ['attending_physician', 'specialist', 'nurse_practitioner', 'physician_assistant', 'registered_nurse', 'licensed_practical_nurse', 'medical_assistant', 'physical_therapist', 'pharmacist'],
                description: 'Provider role',
                example: 'attending_physician'
              },
              specialties: {
                type: 'array',
                items: {
                  type: 'string'
                },
                description: 'Medical specialties',
                example: ['Cardiology', 'Internal Medicine']
              },
              licenseNumber: {
                type: 'string',
                description: 'Medical license number',
                example: 'CA-MD-12345'
              },
              licenseState: {
                type: 'string',
                description: 'State where license was issued',
                example: 'CA'
              },
              licenseExpiry: {
                type: 'string',
                format: 'date',
                description: 'License expiration date',
                example: '2025-12-31'
              },
              department: {
                type: 'string',
                description: 'Department',
                example: 'Cardiology'
              },
              employmentType: {
                type: 'string',
                enum: ['full_time', 'part_time', 'contract', 'locum_tenens'],
                description: 'Employment type',
                example: 'full_time'
              }
            }
          }
        ]
      },
      Patient: {
        allOf: [
          { $ref: '#/components/schemas/User' },
          {
            type: 'object',
            properties: {
              emergencyContact: {
                $ref: '#/components/schemas/EmergencyContact'
              },
              insuranceInfo: {
                $ref: '#/components/schemas/InsuranceInfo'
              },
              medicalHistory: {
                $ref: '#/components/schemas/MedicalHistory'
              },
              preferences: {
                $ref: '#/components/schemas/PatientPreferences'
              }
            }
          }
        ]
      },
      EmergencyContact: {
        type: 'object',
        required: ['name', 'phone', 'relationship'],
        properties: {
          name: {
            type: 'string',
            description: 'Emergency contact name',
            example: 'Jane Doe'
          },
          phone: {
            type: 'string',
            description: 'Emergency contact phone',
            example: '+1-555-0151'
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Emergency contact email',
            example: 'jane.doe@email.com'
          },
          relationship: {
            type: 'string',
            description: 'Relationship to patient',
            example: 'spouse'
          }
        }
      },
      InsuranceInfo: {
        type: 'object',
        required: ['provider', 'policyNumber'],
        properties: {
          provider: {
            type: 'string',
            description: 'Insurance provider',
            example: 'Blue Cross Blue Shield'
          },
          policyNumber: {
            type: 'string',
            description: 'Policy number',
            example: 'BCBS-123456789'
          },
          groupNumber: {
            type: 'string',
            description: 'Group number',
            example: 'GRP-456'
          },
          subscriberName: {
            type: 'string',
            description: 'Subscriber name',
            example: 'John Doe'
          },
          effectiveDate: {
            type: 'string',
            format: 'date',
            description: 'Policy effective date',
            example: '2024-01-01'
          },
          expirationDate: {
            type: 'string',
            format: 'date',
            description: 'Policy expiration date',
            example: '2024-12-31'
          }
        }
      },
      MedicalHistory: {
        type: 'object',
        properties: {
          allergies: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Known allergies',
            example: ['Penicillin', 'Shellfish']
          },
          medications: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Current medications',
            example: ['Lisinopril 10mg daily']
          },
          conditions: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Medical conditions',
            example: ['Hypertension']
          },
          surgeries: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Surgical history',
            example: []
          }
        }
      },
      PatientPreferences: {
        type: 'object',
        properties: {
          preferredLanguage: {
            type: 'string',
            description: 'Preferred language',
            example: 'en'
          },
          communicationMethod: {
            type: 'string',
            enum: ['email', 'sms', 'phone', 'portal'],
            description: 'Preferred communication method',
            example: 'email'
          },
          appointmentReminders: {
            type: 'boolean',
            description: 'Enable appointment reminders',
            example: true
          }
        }
      },
      Appointment: {
        type: 'object',
        required: ['patientId', 'providerId', 'scheduledAt', 'appointmentType'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Unique appointment identifier'
          },
          patientId: {
            type: 'string',
            format: 'uuid',
            description: 'Patient identifier'
          },
          providerId: {
            type: 'string',
            format: 'uuid',
            description: 'Provider identifier'
          },
          scheduledAt: {
            type: 'string',
            format: 'date-time',
            description: 'Appointment date and time',
            example: '2024-01-20T09:00:00Z'
          },
          duration: {
            type: 'integer',
            description: 'Appointment duration in minutes',
            example: 30
          },
          appointmentType: {
            type: 'string',
            enum: ['consultation', 'follow_up', 'procedure', 'surgery', 'test', 'vaccination'],
            description: 'Type of appointment',
            example: 'consultation'
          },
          status: {
            type: 'string',
            enum: ['scheduled', 'confirmed', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show'],
            description: 'Appointment status',
            example: 'scheduled'
          },
          reason: {
            type: 'string',
            description: 'Reason for appointment',
            example: 'Annual physical exam'
          },
          notes: {
            type: 'string',
            description: 'Additional notes',
            example: 'Patient requested morning appointment'
          },
          priority: {
            type: 'string',
            enum: ['routine', 'urgent', 'emergency'],
            description: 'Appointment priority',
            example: 'routine'
          },
          confirmationNumber: {
            type: 'string',
            description: 'Appointment confirmation number',
            example: 'CONF-2024-001'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp'
          }
        }
      },
      ApiResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Whether the request was successful',
            example: true
          },
          data: {
            type: 'object',
            description: 'Response data'
          },
          error: {
            $ref: '#/components/schemas/ApiError'
          }
        }
      },
      ApiError: {
        type: 'object',
        properties: {
          code: {
            type: 'string',
            description: 'Error code',
            example: 'VALIDATION_ERROR'
          },
          message: {
            type: 'string',
            description: 'Error message',
            example: 'Invalid input data'
          },
          details: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: {
                  type: 'string',
                  description: 'Field with error'
                },
                message: {
                  type: 'string',
                  description: 'Field error message'
                }
              }
            }
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'Error timestamp'
          },
          requestId: {
            type: 'string',
            description: 'Request identifier for debugging'
          }
        }
      }
    },
    parameters: {
      OrganizationId: {
        name: 'organizationId',
        in: 'path',
        required: true,
        schema: {
          type: 'string',
          format: 'uuid'
        },
        description: 'Organization identifier'
      },
      UserId: {
        name: 'userId',
        in: 'path',
        required: true,
        schema: {
          type: 'string',
          format: 'uuid'
        },
        description: 'User identifier'
      },
      AppointmentId: {
        name: 'appointmentId',
        in: 'path',
        required: true,
        schema: {
          type: 'string',
          format: 'uuid'
        },
        description: 'Appointment identifier'
      },
      Page: {
        name: 'page',
        in: 'query',
        schema: {
          type: 'integer',
          minimum: 1,
          default: 1
        },
        description: 'Page number for pagination'
      },
      Limit: {
        name: 'limit',
        in: 'query',
        schema: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          default: 20
        },
        description: 'Number of items per page'
      }
    },
    responses: {
      Unauthorized: {
        description: 'Authentication required',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ApiResponse'
            },
            example: {
              success: false,
              error: {
                code: 'AUTHENTICATION_REQUIRED',
                message: 'Authentication token required',
                timestamp: '2024-01-15T10:00:00Z',
                requestId: 'req-12345'
              }
            }
          }
        }
      },
      Forbidden: {
        description: 'Insufficient permissions',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ApiResponse'
            },
            example: {
              success: false,
              error: {
                code: 'INSUFFICIENT_PERMISSIONS',
                message: 'You do not have permission to access this resource',
                timestamp: '2024-01-15T10:00:00Z',
                requestId: 'req-12345'
              }
            }
          }
        }
      },
      NotFound: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ApiResponse'
            },
            example: {
              success: false,
              error: {
                code: 'RESOURCE_NOT_FOUND',
                message: 'The requested resource was not found',
                timestamp: '2024-01-15T10:00:00Z',
                requestId: 'req-12345'
              }
            }
          }
        }
      },
      ValidationError: {
        description: 'Validation error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ApiResponse'
            },
            example: {
              success: false,
              error: {
                code: 'VALIDATION_ERROR',
                message: 'Invalid input data',
                details: [
                  {
                    field: 'email',
                    message: 'Invalid email format'
                  }
                ],
                timestamp: '2024-01-15T10:00:00Z',
                requestId: 'req-12345'
              }
            }
          }
        }
      },
      RateLimited: {
        description: 'Rate limit exceeded',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ApiResponse'
            },
            example: {
              success: false,
              error: {
                code: 'RATE_LIMIT_EXCEEDED',
                message: 'Too many requests. Please try again later.',
                timestamp: '2024-01-15T10:00:00Z',
                requestId: 'req-12345'
              }
            }
          }
        }
      }
    }
  },
  security: [
    {
      BearerAuth: []
    }
  ],
  tags: [
    {
      name: 'Authentication',
      description: 'Authentication and authorization endpoints'
    },
    {
      name: 'Organizations',
      description: 'Healthcare organization management'
    },
    {
      name: 'Healthcare Providers',
      description: 'Healthcare provider registration and management'
    },
    {
      name: 'Patients',
      description: 'Patient registration and management'
    },
    {
      name: 'Staff',
      description: 'Administrative staff management'
    },
    {
      name: 'Appointments',
      description: 'Appointment scheduling and management'
    },
    {
      name: 'AI Agents',
      description: 'AI-powered healthcare assistance'
    },
    {
      name: 'Analytics',
      description: 'Healthcare analytics and reporting'
    },
    {
      name: 'Security',
      description: 'Security and audit endpoints'
    }
  ]
};

const options = {
  definition: swaggerDefinition,
  apis: [
    './src/index.ts',
    './src/routes/*.ts',
    './src/routes/**/*.ts',
    './src/models/*.ts',
    './src/middleware/*.ts'
  ]
};

export const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec; 