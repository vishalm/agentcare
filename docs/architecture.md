---
layout: default
title: Architecture
permalink: /architecture/
---

{% include doc-header.html %}

# AgentCare Architecture Guide

**Multi-Tenant Healthcare SaaS Platform Design**

AgentCare implements a sophisticated multi-tenant architecture specifically designed for healthcare organizations, combining AI-powered agent coordination with enterprise-grade security and HIPAA compliance.

## 🏗️ System Architecture Overview

<div class="mermaid">
graph TB
    subgraph "🏥 Multi-Tenant Healthcare Platform"
        subgraph "🌐 Organization Management Layer"
            ORG["`**Organizations**
            🏥 Hospitals & Health Systems
            🏢 Clinics & Specialty Centers  
            🚑 Urgent Care & Telehealth
            📊 Multi-tenant Data Isolation`"]
            
            USERS["`**User Management**
            👨‍⚕️ Healthcare Providers
            👥 Patients & Caregivers
            👔 Administrative Staff
            🔐 Role-based Access Control`"]
            
            TENANT["`**Tenant Context**
            🏢 Organization Isolation
            🔒 Data Segregation
            📋 HIPAA Compliance
            🛡️ Security Policies`"]
        end
        
        subgraph "🤖 AI Agent Coordination Layer"
            SUPERVISOR["`**Supervisor Agent**
            🎯 Intelligent Routing
            📋 Context Management
            🔄 Agent Orchestration
            🧠 LLM-Powered Decisions`"]
            
            AVAILABILITY["`**Availability Agent**
            📅 Schedule Management
            ⏰ Time Slot Optimization
            🏥 Provider Availability
            📊 Capacity Planning`"]
            
            BOOKING["`**Booking Agent**
            📝 Appointment Creation
            ✅ Confirmation Workflows
            📧 Notification System
            🔄 Rescheduling Logic`"]
            
            FAQ["`**FAQ Agent**
            ❓ Healthcare Information
            📚 Medical Knowledge Base
            🏥 Organization Policies
            💬 Patient Support`"]
        end
        
        subgraph "🗄️ Multi-Tenant Data Layer"
            POSTGRES["`**PostgreSQL**
            🏥 Healthcare Data Storage
            🔒 Row-Level Security (RLS)
            📊 Organization Isolation
            🔐 Encrypted at Rest`"]
            
            SCHEMA["`**Multi-Tenant Schema**
            👥 Users & Roles
            🏥 Organizations
            📅 Appointments  
            📋 Medical Records
            👨‍👩‍👧‍👦 Patient-Caregiver Relations`"]
            
            INDEXES["`**Performance Optimization**
            📈 Tenant-Aware Indexes
            🚀 Query Optimization
            📊 Monitoring & Analytics
            ⚡ Connection Pooling`"]
        end
        
        subgraph "🛡️ Security & Compliance Layer"
            HIPAA["`**HIPAA Compliance**
            🔒 Patient Data Protection
            📋 Audit Trails
            🎯 Minimum Necessary Access
            🚨 Breach Prevention`"]
            
            AUTH["`**Authentication**
            🔐 JWT & Session Management
            👥 Multi-Factor Authentication
            🏥 Organization SSO
            📱 Mobile Access`"]
            
            ISOLATION["`**Data Isolation**
            🏢 Organization Boundaries
            🔒 Cross-Tenant Prevention
            📊 Access Control
            🛡️ SQL Injection Protection`"]
        end
    end
</div>

## 🌐 Multi-Tenant Organization Layer

### Organization Management

AgentCare supports various healthcare organization types with complete data isolation:

```typescript
interface Organization {
  id: string;
  name: string;
  slug: string; // Unique identifier
  type: OrganizationType;
  size: 'small' | 'medium' | 'large' | 'enterprise';
  address: Address;
  contactInfo: ContactInfo;
  businessHours: BusinessHours;
  timezone: string;
  settings: OrganizationSettings;
  subscriptionTier: 'basic' | 'professional' | 'enterprise';
  onboardingStatus: OnboardingStatus;
}

type OrganizationType = 
  | 'hospital' 
  | 'clinic' 
  | 'specialty_center' 
  | 'urgent_care' 
  | 'telehealth' 
  | 'diagnostic_center';
```

### User Management Hierarchy

<div class="mermaid">
graph TD
    A[Organization] --> B[Organization Users]
    B --> C[Healthcare Providers]
    B --> D[Administrative Staff]
    B --> E[Patients]
    E --> F[Caregivers]
    
    C --> G[Attending Physicians]
    C --> H[Specialists]
    C --> I[Nurses]
    C --> J[Medical Assistants]
    
    D --> K[Practice Managers]
    D --> L[Front Desk Staff]
    D --> M[Schedulers]
    D --> N[Billing Staff]
</div>

### Tenant Context Management

```sql
-- Tenant context functions for data isolation
CREATE OR REPLACE FUNCTION set_tenant_context(tenant_uuid UUID)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_tenant_id', tenant_uuid::text, true);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_current_tenant()
RETURNS UUID AS $$
BEGIN
  RETURN current_setting('app.current_tenant_id')::UUID;
EXCEPTION
  WHEN others THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

## 🤖 AI Agent Coordination Layer

### Supervisor Agent Architecture

The Supervisor Agent coordinates all healthcare workflow decisions:

```typescript
class SupervisorAgent {
  private llmService: LLMService;
  private contextManager: ContextManager;
  private agents: Map<AgentType, Agent>;

  async processRequest(request: HealthcareRequest): Promise<AgentResponse> {
    // 1. Analyze intent and context
    const intent = await this.analyzeIntent(request);
    
    // 2. Set organization context
    await this.setTenantContext(request.organizationId);
    
    // 3. Route to appropriate agent
    const targetAgent = this.selectAgent(intent);
    
    // 4. Execute with coordination
    return await this.executeWithCoordination(targetAgent, request);
  }

  private selectAgent(intent: HealthcareIntent): Agent {
    switch (intent.type) {
      case 'appointment_booking':
        return this.agents.get('booking');
      case 'availability_check':
        return this.agents.get('availability');
      case 'healthcare_faq':
        return this.agents.get('faq');
      default:
        return this.agents.get('general');
    }
  }
}
```

### Agent Coordination Flow

<div class="mermaid">
sequenceDiagram
    participant U as User/Patient
    participant S as Supervisor Agent
    participant A as Availability Agent
    participant B as Booking Agent
    participant D as Database
    
    U->>S: Request appointment booking
    S->>S: Analyze intent & set tenant context
    S->>A: Check provider availability
    A->>D: Query available slots (with org filter)
    D-->>A: Return filtered availability
    A-->>S: Available time slots
    S->>B: Create appointment booking
    B->>D: Insert appointment (with org isolation)
    D-->>B: Confirm booking
    B-->>S: Booking confirmation
    S-->>U: Appointment confirmed
</div>

## 🗄️ Multi-Tenant Data Layer

### Database Schema Design

<div class="mermaid">
erDiagram
    organizations {
        uuid id PK
        string name
        string slug UK
        jsonb address
        jsonb contact_info
        timestamp created_at
        timestamp updated_at
    }
    
    users {
        uuid id PK
        uuid organization_id FK
        string email
        string name
        string user_type
        string medical_record_number
        timestamp created_at
    }
    
    organization_users {
        uuid id PK
        uuid organization_id FK
        uuid user_id FK
        uuid primary_role_id FK
        string department
        string license_number
        jsonb specialties
        boolean is_active
    }
    
    patient_caregivers {
        uuid id PK
        uuid organization_id FK
        uuid patient_id FK
        uuid caregiver_id FK
        string relationship_type
        string authorization_level
        boolean can_schedule_appointments
        boolean is_active
    }
    
    appointments {
        uuid id PK
        uuid organization_id FK
        uuid patient_id FK
        uuid provider_id FK
        timestamp scheduled_at
        string status
        string appointment_type
        jsonb metadata
    }
    
    medical_records {
        uuid id PK
        uuid organization_id FK
        uuid patient_id FK
        uuid provider_id FK
        text content
        string record_type
        boolean is_sensitive
        timestamp created_at
    }
    
    organizations ||--o{ users : "has"
    organizations ||--o{ organization_users : "has"
    organizations ||--o{ patient_caregivers : "has"
    organizations ||--o{ appointments : "has"
    organizations ||--o{ medical_records : "has"
    users ||--o{ organization_users : "belongs_to"
    users ||--o{ patient_caregivers : "patient"
    users ||--o{ patient_caregivers : "caregiver"
</div>

### Row-Level Security (RLS) Implementation

```sql
-- Enable RLS on all tenant-specific tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;

-- Create policies for tenant isolation
CREATE POLICY tenant_isolation_users ON users
  FOR ALL TO application_user
  USING (organization_id = get_current_tenant());

CREATE POLICY tenant_isolation_appointments ON appointments
  FOR ALL TO application_user
  USING (organization_id = get_current_tenant());

CREATE POLICY tenant_isolation_medical_records ON medical_records
  FOR ALL TO application_user
  USING (organization_id = get_current_tenant());
```

### Performance Optimization

```sql
-- Tenant-aware indexes for optimal query performance
CREATE INDEX CONCURRENTLY idx_users_org_type 
  ON users(organization_id, user_type);

CREATE INDEX CONCURRENTLY idx_appointments_org_scheduled 
  ON appointments(organization_id, scheduled_at);

CREATE INDEX CONCURRENTLY idx_medical_records_org_patient 
  ON medical_records(organization_id, patient_id);

-- Partial indexes for active records
CREATE INDEX CONCURRENTLY idx_organization_users_active 
  ON organization_users(organization_id, user_id) 
  WHERE is_active = true;
```

## 🛡️ Security & Compliance Layer

### HIPAA Compliance Architecture

<div class="mermaid">
graph LR
    subgraph "🔒 HIPAA Compliance Framework"
        A[Data Encryption] --> B[Access Control]
        B --> C[Audit Trails]
        C --> D[Breach Detection]
        D --> E[Risk Assessment]
        E --> F[Incident Response]
        
        A1[At Rest: AES-256] --> A
        A2[In Transit: TLS 1.3] --> A
        
        B1[Role-Based Access] --> B
        B2[Minimum Necessary] --> B
        
        C1[Database Logs] --> C
        C2[Application Logs] --> C
        C3[Access Logs] --> C
        
        D1[Anomaly Detection] --> D
        D2[Failed Login Monitoring] --> D
        
        E1[Vulnerability Scanning] --> E
        E2[Penetration Testing] --> E
        
        F1[Automated Alerts] --> F
        F2[Response Procedures] --> F
    end
</div>

### Authentication & Authorization

```typescript
interface SecurityContext {
  organizationId: string;
  userId: string;
  roles: Role[];
  permissions: Permission[];
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  mfaVerified: boolean;
}

class SecurityService {
  async authenticateUser(credentials: LoginCredentials): Promise<SecurityContext> {
    // 1. Validate credentials
    const user = await this.validateCredentials(credentials);
    
    // 2. Check MFA if required
    if (user.mfaEnabled) {
      await this.verifyMFA(credentials.mfaToken);
    }
    
    // 3. Set organization context
    await this.setTenantContext(user.organizationId);
    
    // 4. Create security context
    return this.createSecurityContext(user);
  }

  async authorizeAction(
    context: SecurityContext, 
    resource: string, 
    action: string
  ): Promise<boolean> {
    // Verify organization boundary
    if (!this.isWithinOrganization(context, resource)) {
      return false;
    }
    
    // Check role permissions
    return this.hasPermission(context.roles, resource, action);
  }
}
```

## 📊 Data Flow Architecture

### Request Processing Flow

<div class="mermaid">
graph TD
    A[Client Request] --> B[Load Balancer]
    B --> C[API Gateway]
    C --> D[Authentication Middleware]
    D --> E[Multi-Tenant Middleware]
    E --> F[Rate Limiting]
    F --> G[Request Validation]
    G --> H[Supervisor Agent]
    
    H --> I{Intent Analysis}
    I -->|Booking| J[Booking Agent]
    I -->|Availability| K[Availability Agent]
    I -->|FAQ| L[FAQ Agent]
    
    J --> M[Database Layer]
    K --> M
    L --> M
    
    M --> N[Row-Level Security]
    N --> O[PostgreSQL]
    
    O --> P[Response Processing]
    P --> Q[Audit Logging]
    Q --> R[Client Response]
</div>

### Event-Driven Architecture

```typescript
interface HealthcareEvent {
  id: string;
  type: EventType;
  organizationId: string;
  userId: string;
  entityId: string;
  timestamp: Date;
  data: Record<string, any>;
  metadata: EventMetadata;
}

class EventBus {
  async publishEvent(event: HealthcareEvent): Promise<void> {
    // Ensure tenant context in event
    event.organizationId = await this.getCurrentTenant();
    
    // Publish to appropriate handlers
    await this.distributeEvent(event);
    
    // Log for audit trail
    await this.auditLog(event);
  }

  private async distributeEvent(event: HealthcareEvent): Promise<void> {
    const handlers = this.getHandlers(event.type);
    await Promise.all(handlers.map(h => h.handle(event)));
  }
}
```

## 🚀 Scalability & Performance

### Horizontal Scaling Strategy

<div class="mermaid">
graph TB
    subgraph "🌍 Multi-Region Deployment"
        subgraph "Region 1"
            LB1[Load Balancer] --> API1[API Cluster]
            API1 --> DB1[Primary DB]
            API1 --> CACHE1[Redis Cache]
        end
        
        subgraph "Region 2"
            LB2[Load Balancer] --> API2[API Cluster]
            API2 --> DB2[Read Replica]
            API2 --> CACHE2[Redis Cache]
        end
        
        DB1 -.->|Replication| DB2
    end
    
    subgraph "🔧 Auto-Scaling"
        METRICS[Metrics Collection] --> SCALING[Auto-Scaler]
        SCALING --> API1
        SCALING --> API2
    end
</div>

### Caching Strategy

```typescript
class CacheManager {
  private redis: Redis;
  
  async get<T>(key: string, organizationId: string): Promise<T | null> {
    // Tenant-aware cache keys
    const tenantKey = `${organizationId}:${key}`;
    const cached = await this.redis.get(tenantKey);
    return cached ? JSON.parse(cached) : null;
  }
  
  async set<T>(
    key: string, 
    value: T, 
    organizationId: string, 
    ttl: number = 3600
  ): Promise<void> {
    const tenantKey = `${organizationId}:${key}`;
    await this.redis.setex(tenantKey, ttl, JSON.stringify(value));
  }
}
```

## 📈 Monitoring & Observability

### Healthcare Metrics

```typescript
interface HealthcareMetrics {
  // Organization metrics
  organizationCount: number;
  activeOrganizations: number;
  
  // User metrics
  totalProviders: number;
  totalPatients: number;
  activeUsers: number;
  
  // Appointment metrics
  appointmentsToday: number;
  appointmentCompletionRate: number;
  averageBookingTime: number;
  
  // System metrics
  responseTime: number;
  errorRate: number;
  tenantIsolationViolations: number;
}
```

### Audit Trail System

```sql
-- Audit trail table for HIPAA compliance
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  user_id UUID,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id VARCHAR(255),
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for efficient querying
CREATE INDEX idx_audit_logs_org_time 
  ON audit_logs(organization_id, created_at DESC);
```

## 🔧 Development & Deployment

### Container Architecture

```dockerfile
# Multi-stage build for production optimization
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: agentcare-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: agentcare-api
  template:
    metadata:
      labels:
        app: agentcare-api
    spec:
      containers:
      - name: api
        image: agentcare:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

## 📚 Architecture Patterns

AgentCare implements several enterprise architecture patterns:

- **Multi-Tenancy Pattern** - Complete data isolation per organization
- **Agent Pattern** - Coordinated AI agents for healthcare workflows
- **CQRS Pattern** - Command Query Responsibility Segregation
- **Event Sourcing** - Audit trail and state reconstruction
- **Circuit Breaker** - Fault tolerance and resilience
- **API Gateway** - Centralized request management
- **Microservices** - Loosely coupled service architecture

## 🎯 Next Steps

1. **[API Reference](api-reference.md)** - Explore the comprehensive API
2. **[Testing Guide](testing.md)** - Understand the testing framework
3. **[Deployment Guide](deployment.md)** - Deploy to production
4. **[Security Guide](security.md)** - Implement HIPAA compliance

---

**Architecture designed for healthcare at scale**

*Built with security, compliance, and performance as core principles.* 