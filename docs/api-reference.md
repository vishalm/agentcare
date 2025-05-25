---
layout: default
title: API Reference
permalink: /api-reference/
---

{% include doc-header.html %}

# AgentCare API Reference

**Complete REST API documentation for multi-tenant healthcare operations**

The AgentCare API provides comprehensive endpoints for managing healthcare organizations, users, appointments, and AI-powered scheduling across multiple tenants with full HIPAA compliance.

## 🚀 API Overview

- **Base URL**: `https://api.agentcare.com/api/v1`
- **Authentication**: JWT Bearer Token + Organization Context
- **Content Type**: `application/json`
- **Rate Limiting**: 1000 requests/hour per organization
- **HIPAA Compliant**: All endpoints maintain strict data isolation

## 🔐 Authentication

### JWT Token Authentication

```bash
# Login and obtain JWT token
POST /auth/login
{
  "email": "admin@hospital.com",
  "password": "secure_password",
  "organizationSlug": "general-hospital"
}

# Response
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "email": "admin@hospital.com",
      "organizationId": "org-uuid"
    }
  }
}
```

### Request Headers

```bash
Authorization: Bearer <jwt_token>
Content-Type: application/json
X-Organization-Context: <organization_id>  # Optional override
```

## 🏥 Organization Management

### Create Organization

Creates a new healthcare organization with complete multi-tenant setup.

```http
POST /organizations
```

**Request Body:**
```json
{
  "name": "General Hospital",
  "slug": "general-hospital",
  "type": "hospital",
  "size": "large",
  "address": {
    "street": "123 Medical Center Dr",
    "city": "Healthcare City",
    "state": "CA",
    "zip": "90210",
    "country": "USA"
  },
  "contactInfo": {
    "phone": "+1-555-0100",
    "email": "admin@generalhospital.com",
    "website": "https://generalhospital.com"
  },
  "businessHours": {
    "monday": { "open": "07:00", "close": "19:00" },
    "tuesday": { "open": "07:00", "close": "19:00" },
    "wednesday": { "open": "07:00", "close": "19:00" },
    "thursday": { "open": "07:00", "close": "19:00" },
    "friday": { "open": "07:00", "close": "19:00" },
    "saturday": { "open": "08:00", "close": "17:00" },
    "sunday": { "closed": true }
  },
  "timezone": "America/Los_Angeles",
  "subscriptionTier": "professional",
  "adminUser": {
    "email": "admin@generalhospital.com",
    "name": "Hospital Administrator",
    "phone": "+1-555-0101"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "organization": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "General Hospital",
      "slug": "general-hospital",
      "type": "hospital",
      "onboardingStatus": "pending",
      "createdAt": "2024-01-15T10:00:00Z"
    },
    "adminUser": {
      "id": "user-uuid",
      "email": "admin@generalhospital.com",
      "temporaryPassword": "temp_secure_123"
    }
  }
}
```

### Get Organization Details

```http
GET /organizations/{organizationId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "org-uuid",
    "name": "General Hospital",
    "slug": "general-hospital",
    "type": "hospital",
    "size": "large",
    "address": { /* address object */ },
    "contactInfo": { /* contact object */ },
    "businessHours": { /* hours object */ },
    "onboardingStatus": "completed",
    "subscriptionTier": "professional",
    "isActive": true,
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}
```

### Get Organization Statistics

```http
GET /organizations/{organizationId}/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 145,
    "totalProviders": 25,
    "totalPatients": 1250,
    "totalStaff": 20,
    "appointmentsThisMonth": 450,
    "appointmentsLastMonth": 380,
    "appointmentCompletionRate": 92.5,
    "averageBookingTime": 3.2,
    "subscriptionStatus": "active",
    "lastActivity": "2024-01-15T14:30:00Z"
  }
}
```

## 👨‍⚕️ Healthcare Provider Management

### Register Healthcare Provider

Registers a new healthcare provider (doctor, nurse, etc.) within an organization.

```http
POST /organizations/{organizationId}/providers
```

**Request Body:**
```json
{
  "email": "dr.smith@generalhospital.com",
  "name": "Dr. John Smith",
  "role": "attending_physician",
  "specialties": ["Cardiology", "Internal Medicine"],
  "licenseNumber": "CA-MD-12345",
  "licenseState": "CA",
  "licenseExpiry": "2025-12-31",
  "department": "Cardiology",
  "employmentType": "full_time",
  "phone": "+1-555-0102",
  "education": [
    {
      "degree": "MD",
      "institution": "Stanford University School of Medicine",
      "year": 2010
    }
  ],
  "certifications": [
    {
      "name": "Board Certified Cardiologist",
      "issuingBody": "American Board of Internal Medicine",
      "year": 2014
    }
  ],
  "availability": {
    "monday": [
      { "start": "08:00", "end": "12:00" },
      { "start": "13:00", "end": "17:00" }
    ],
    "tuesday": [
      { "start": "08:00", "end": "12:00" },
      { "start": "13:00", "end": "17:00" }
    ]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "provider-uuid",
      "email": "dr.smith@generalhospital.com",
      "name": "Dr. John Smith",
      "userType": "provider"
    },
    "organizationUser": {
      "id": "org-user-uuid",
      "primaryRole": "attending_physician",
      "department": "Cardiology",
      "licenseNumber": "CA-MD-12345",
      "specialties": ["Cardiology", "Internal Medicine"],
      "isActive": true
    },
    "credentials": {
      "temporaryPassword": "secure_temp_456",
      "mustChangePassword": true
    }
  }
}
```

### Get Provider Details

```http
GET /organizations/{organizationId}/providers/{providerId}
```

### Update Provider Information

```http
PUT /organizations/{organizationId}/providers/{providerId}
```

### Bulk Provider Registration

Register multiple providers in a single request.

```http
POST /organizations/{organizationId}/bulk/providers
```

**Request Body:**
```json
{
  "providers": [
    {
      "email": "dr.jones@hospital.com",
      "name": "Dr. Sarah Jones",
      "role": "specialist",
      "specialties": ["Oncology"],
      "department": "Oncology"
    },
    {
      "email": "nurse.wilson@hospital.com",
      "name": "Mary Wilson",
      "role": "registered_nurse",
      "department": "Emergency Department"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total": 2,
      "successful": 2,
      "failed": 0
    },
    "results": [
      {
        "email": "dr.jones@hospital.com",
        "status": "success",
        "userId": "user-uuid-1"
      },
      {
        "email": "nurse.wilson@hospital.com",
        "status": "success",
        "userId": "user-uuid-2"
      }
    ],
    "errors": []
  }
}
```

## 👥 Patient Management

### Register Patient

Register a new patient with medical record number generation.

```http
POST /organizations/{organizationId}/patients
```

**Request Body:**
```json
{
  "email": "john.doe@email.com",
  "name": "John Doe",
  "dateOfBirth": "1985-06-15",
  "gender": "male",
  "phone": "+1-555-0150",
  "address": {
    "street": "456 Patient Avenue",
    "city": "Healthcare City",
    "state": "CA",
    "zip": "90210"
  },
  "emergencyContact": {
    "name": "Jane Doe",
    "relationship": "spouse",
    "phone": "+1-555-0151",
    "email": "jane.doe@email.com"
  },
  "insuranceInfo": {
    "provider": "Blue Cross Blue Shield",
    "policyNumber": "BCBS-123456789",
    "groupNumber": "GRP-456",
    "subscriberName": "John Doe",
    "effectiveDate": "2024-01-01",
    "expirationDate": "2024-12-31"
  },
  "medicalHistory": {
    "allergies": ["Penicillin", "Shellfish"],
    "medications": ["Lisinopril 10mg daily"],
    "conditions": ["Hypertension"],
    "surgeries": []
  },
  "preferences": {
    "preferredLanguage": "en",
    "communicationMethod": "email",
    "appointmentReminders": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "patient": {
      "id": "patient-uuid",
      "email": "john.doe@email.com",
      "name": "John Doe",
      "medicalRecordNumber": "GH-2024-001234",
      "dateOfBirth": "1985-06-15",
      "userType": "patient"
    },
    "organizationUser": {
      "id": "org-user-uuid",
      "primaryRole": "patient",
      "isActive": true,
      "registrationDate": "2024-01-15T10:00:00Z"
    }
  }
}
```

### Get Patient Details

```http
GET /organizations/{organizationId}/patients/{patientId}
```

### Add Patient Caregiver

Add an authorized caregiver for a patient.

```http
POST /organizations/{organizationId}/patients/{patientId}/caregivers
```

**Request Body:**
```json
{
  "caregiverEmail": "jane.doe@email.com",
  "caregiverName": "Jane Doe",
  "relationshipType": "spouse",
  "authorizationLevel": "full",
  "canScheduleAppointments": true,
  "canReceiveMedicalInfo": true,
  "canMakeMedicalDecisions": false,
  "canAccessPortal": true,
  "authorizedBy": "patient-uuid",
  "authorizationDocument": "signed_form_url",
  "effectiveDate": "2024-01-15",
  "expirationDate": "2025-01-15"
}
```

## 👔 Administrative Staff Management

### Register Staff Member

```http
POST /organizations/{organizationId}/staff
```

**Request Body:**
```json
{
  "email": "mary.admin@hospital.com",
  "name": "Mary Administrator",
  "role": "practice_manager",
  "department": "Administration",
  "employmentType": "full_time",
  "phone": "+1-555-0200",
  "permissions": [
    "manage_appointments",
    "view_patient_info",
    "manage_providers",
    "generate_reports"
  ],
  "workSchedule": {
    "monday": { "start": "08:00", "end": "17:00" },
    "tuesday": { "start": "08:00", "end": "17:00" },
    "wednesday": { "start": "08:00", "end": "17:00" },
    "thursday": { "start": "08:00", "end": "17:00" },
    "friday": { "start": "08:00", "end": "17:00" }
  }
}
```

## 📅 Appointment Management

### Check Provider Availability

```http
GET /organizations/{organizationId}/providers/{providerId}/availability
```

**Query Parameters:**
- `date`: ISO date string (required)
- `duration`: appointment duration in minutes (default: 30)

**Response:**
```json
{
  "success": true,
  "data": {
    "providerId": "provider-uuid",
    "date": "2024-01-20",
    "availableSlots": [
      {
        "startTime": "09:00",
        "endTime": "09:30",
        "duration": 30,
        "type": "consultation"
      },
      {
        "startTime": "10:30",
        "endTime": "11:00",
        "duration": 30,
        "type": "consultation"
      }
    ],
    "bookedSlots": [
      {
        "startTime": "09:30",
        "endTime": "10:00",
        "appointmentId": "appt-uuid"
      }
    ]
  }
}
```

### Create Appointment

```http
POST /organizations/{organizationId}/appointments
```

**Request Body:**
```json
{
  "patientId": "patient-uuid",
  "providerId": "provider-uuid",
  "scheduledAt": "2024-01-20T09:00:00Z",
  "duration": 30,
  "appointmentType": "consultation",
  "reason": "Annual physical exam",
  "notes": "Patient requested morning appointment",
  "priority": "routine",
  "location": {
    "building": "Main Hospital",
    "floor": "2",
    "room": "205"
  },
  "reminders": {
    "email": true,
    "sms": true,
    "timeBefore": 1440  // minutes (24 hours)
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "appointment": {
      "id": "appointment-uuid",
      "patientId": "patient-uuid",
      "providerId": "provider-uuid",
      "scheduledAt": "2024-01-20T09:00:00Z",
      "duration": 30,
      "status": "scheduled",
      "confirmationNumber": "CONF-2024-001",
      "createdAt": "2024-01-15T14:30:00Z"
    }
  }
}
```

### Get Appointments

```http
GET /organizations/{organizationId}/appointments
```

**Query Parameters:**
- `patientId`: Filter by patient
- `providerId`: Filter by provider
- `date`: Filter by date
- `status`: Filter by status (scheduled, confirmed, completed, cancelled)
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20)

### Update Appointment

```http
PUT /organizations/{organizationId}/appointments/{appointmentId}
```

### Cancel Appointment

```http
DELETE /organizations/{organizationId}/appointments/{appointmentId}
```

## 🤖 AI Agent Endpoints

### Chat with Healthcare Assistant

```http
POST /organizations/{organizationId}/chat
```

**Request Body:**
```json
{
  "message": "I need to schedule an appointment with Dr. Smith",
  "context": {
    "patientId": "patient-uuid",
    "preferredDate": "2024-01-20",
    "urgency": "routine"
  },
  "conversationId": "conv-uuid"  // Optional for continuing conversation
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "I can help you schedule an appointment with Dr. Smith. I see he has availability on January 20th at 9:00 AM and 2:30 PM. Which time works better for you?",
    "intent": "appointment_booking",
    "confidence": 0.95,
    "availableActions": [
      {
        "type": "book_appointment",
        "providerId": "provider-uuid",
        "availableSlots": ["09:00", "14:30"]
      }
    ],
    "conversationId": "conv-uuid"
  }
}
```

### Get FAQ Response

```http
POST /organizations/{organizationId}/faq
```

**Request Body:**
```json
{
  "question": "What are your visiting hours?",
  "category": "general_info"
}
```

## 📊 Analytics & Reporting

### Get Organization Analytics

```http
GET /organizations/{organizationId}/analytics
```

**Query Parameters:**
- `period`: time period (day, week, month, year)
- `startDate`: start date for custom period
- `endDate`: end date for custom period

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "month",
    "metrics": {
      "appointments": {
        "total": 450,
        "completed": 425,
        "cancelled": 15,
        "noShow": 10,
        "completionRate": 94.4
      },
      "patients": {
        "new": 25,
        "returning": 400,
        "total": 425
      },
      "providers": {
        "utilizationRate": 87.5,
        "averageAppointmentsPerDay": 18.2
      },
      "revenue": {
        "total": 125000,
        "insurance": 100000,
        "selfPay": 25000
      }
    }
  }
}
```

### Generate Report

```http
POST /organizations/{organizationId}/reports
```

**Request Body:**
```json
{
  "type": "appointment_summary",
  "period": {
    "start": "2024-01-01",
    "end": "2024-01-31"
  },
  "filters": {
    "department": "Cardiology",
    "provider": "provider-uuid"
  },
  "format": "pdf",  // pdf, csv, json
  "email": "admin@hospital.com"  // Optional: email report
}
```

## 🔒 Security & Audit

### Get Audit Trail

```http
GET /organizations/{organizationId}/audit
```

**Query Parameters:**
- `userId`: Filter by user
- `action`: Filter by action type
- `startDate`: Filter by date range
- `endDate`: Filter by date range
- `page`: Page number
- `limit`: Results per page

### Security Events

```http
GET /organizations/{organizationId}/security/events
```

## 📋 Organization Configuration

### Get User Roles

```http
GET /organizations/{organizationId}/roles
```

### Get Departments

```http
GET /organizations/{organizationId}/departments
```

### Update Organization Settings

```http
PUT /organizations/{organizationId}/settings
```

## ❌ Error Responses

All API endpoints return standardized error responses:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ],
    "timestamp": "2024-01-15T10:00:00Z",
    "requestId": "req-uuid"
  }
}
```

### Common Error Codes

- `AUTHENTICATION_REQUIRED` (401)
- `INVALID_CREDENTIALS` (401)
- `INSUFFICIENT_PERMISSIONS` (403)
- `ORGANIZATION_NOT_FOUND` (404)
- `USER_NOT_FOUND` (404)
- `VALIDATION_ERROR` (400)
- `DUPLICATE_ENTRY` (409)
- `RATE_LIMIT_EXCEEDED` (429)
- `INTERNAL_SERVER_ERROR` (500)

## 📚 SDKs & Code Examples

### JavaScript/TypeScript SDK

```bash
npm install @agentcare/sdk
```

```typescript
import { AgentCareClient } from '@agentcare/sdk';

const client = new AgentCareClient({
  apiKey: 'your-jwt-token',
  organizationId: 'your-org-id',
  baseUrl: 'https://api.agentcare.com'
});

// Create appointment
const appointment = await client.appointments.create({
  patientId: 'patient-uuid',
  providerId: 'provider-uuid',
  scheduledAt: new Date('2024-01-20T09:00:00Z'),
  duration: 30,
  appointmentType: 'consultation'
});
```

### Python SDK

```bash
pip install agentcare-python
```

```python
from agentcare import AgentCareClient

client = AgentCareClient(
    api_key='your-jwt-token',
    organization_id='your-org-id'
)

# Register patient
patient = client.patients.create({
    'email': 'patient@email.com',
    'name': 'John Doe',
    'dateOfBirth': '1985-06-15'
})
```

## 🎯 Next Steps

1. **[Testing Guide](testing.md)** - Learn about API testing
2. **[Security Guide](security.md)** - Implement authentication
3. **[Deployment Guide](deployment.md)** - Deploy your integration

---

**Complete API for Healthcare Management**

*Built for security, scalability, and compliance in healthcare environments.* 