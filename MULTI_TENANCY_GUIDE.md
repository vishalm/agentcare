# 🏥 AgentCare Multi-Tenancy Implementation Guide

## 📋 **Current Status: NOT READY for Multi-Tenancy**

AgentCare is currently **NOT ready** for true multi-tenancy. While it has excellent healthcare features, it lacks the fundamental infrastructure to safely support multiple hospitals with complete data isolation.

## ⚠️ **Critical Security Issues**

### **Data Leakage Risks:**
- **Cross-tenant data access** - Users from Hospital A could see Hospital B's data
- **Shared email constraints** - Same email can't be used across hospitals
- **Global provider licenses** - License numbers must be unique globally
- **No tenant-aware APIs** - All endpoints currently access global data

### **HIPAA Compliance Issues:**
- **Audit logs don't track tenant context**
- **No tenant-specific access controls**
- **Shared cache keys** could leak data between hospitals

## 🛠️ **Implementation Roadmap**

### **Phase 1: Database Schema Migration (4-6 weeks)**

#### **Step 1: Create Multi-Tenant Schema**
```bash
# Apply the multi-tenant schema
psql -d agentcare -f database/multi-tenant-schema.sql
```

#### **Step 2: Data Migration**
```sql
-- Migrate existing data to default organization
INSERT INTO organizations (id, name, slug, type, address, contact_info) VALUES 
('00000000-0000-0000-0000-000000000000', 'Default Organization', 'default', 'hospital', '{}', '{}');

-- Update all existing records
UPDATE users SET organization_id = '00000000-0000-0000-0000-000000000000';
UPDATE providers SET organization_id = '00000000-0000-0000-0000-000000000000';
UPDATE appointments SET organization_id = '00000000-0000-0000-0000-000000000000';
-- ... repeat for all tables
```

### **Phase 2: Application Layer Updates (6-8 weeks)**

#### **Step 1: Update Services**
- **Add `organization_id` to all database queries**
- **Update cache keys to include tenant context**
- **Modify APIs to be tenant-aware**

#### **Step 2: Authentication & Authorization**
```typescript
// Example tenant-aware user authentication
export interface AuthenticatedUser {
  id: string;
  email: string;
  organizationId: string;
  role: string;
  permissions: Permission[];
}
```

#### **Step 3: Middleware Integration**
```typescript
// Add to Express app
app.use(multiTenantService.resolveTenantMiddleware());
app.use(multiTenantService.requireTenantMiddleware());
```

### **Phase 3: Frontend Updates (4-6 weeks)**

#### **Step 1: Tenant Context**
```typescript
// Add tenant context to React app
interface TenantContext {
  organization: Organization;
  permissions: Permission[];
  settings: OrganizationSettings;
}
```

#### **Step 2: Organization Selection**
- **Subdomain routing** (metro-general.agentcare.com)
- **Organization switcher** for users in multiple orgs
- **Custom branding** per organization

### **Phase 4: Testing & Security (3-4 weeks)**

#### **Step 1: Security Testing**
- **Cross-tenant isolation tests**
- **Permission boundary testing**
- **SQL injection with tenant context**

#### **Step 2: Performance Testing**
- **Multi-tenant load testing**
- **Database query optimization**
- **Cache effectiveness testing**

## 🚀 **Hospital Onboarding Process**

### **Step 1: Organization Registration**
```typescript
const hospital = await organizationService.create({
  name: "Metro General Hospital",
  slug: "metro-general", 
  type: "hospital",
  address: {
    street: "123 Medical Center Dr",
    city: "New York",
    state: "NY",
    zip: "10001",
    country: "USA"
  },
  contactInfo: {
    phone: "+1-555-0100",
    email: "info@metrogeneral.com"
  }
});
```

### **Step 2: Domain Setup**
```typescript
await organizationService.addDomain(hospital.id, {
  domain: "metro-general.agentcare.com",
  isPrimary: true
});
```

### **Step 3: Admin User Creation**
```typescript
const adminUser = await userService.createUser({
  email: "admin@metrogeneral.com",
  name: "Hospital Administrator",
  organizationId: hospital.id
});

await organizationService.addUser(hospital.id, adminUser.id, "admin");
```

### **Step 4: Settings Configuration**
```typescript
await organizationService.updateSettings(hospital.id, {
  enableOnlineBooking: true,
  enableTelehealth: true,
  businessHours: {
    monday: { start: "09:00", end: "17:00", isOpen: true },
    // ... other days
  },
  defaultAppointmentDuration: 30
});
```

## 🔒 **Security Implementation**

### **Row Level Security (RLS)**
```sql
-- All queries automatically filtered by organization_id
CREATE POLICY tenant_isolation ON appointments
USING (organization_id = current_setting('app.current_tenant_id')::UUID);
```

### **Tenant-Aware Caching**
```typescript
// Before multi-tenancy
const key = `patient:${patientId}`;

// After multi-tenancy  
const key = `tenant:${organizationId}:patient:${patientId}`;
```

### **API Security**
```typescript
// Automatic tenant filtering in all queries
const appointments = await appointmentService.findAll({
  organizationId: tenantContext.organizationId,
  status: 'scheduled'
});
```

## 🏗️ **Architecture Patterns**

### **1. Shared Database, Separate Schemas**
✅ **Chosen Approach**: Single database with `organization_id` in every table

**Pros:**
- Cost-effective
- Easier maintenance
- Shared infrastructure

**Cons:**
- More complex queries
- Potential data leakage if misconfigured

### **2. Tenant Resolution Methods**

#### **Subdomain Routing** (Recommended)
- `metro-general.agentcare.com` → Metro General Hospital
- `sunset-clinic.agentcare.com` → Sunset Clinic

#### **Header-Based**
- `X-Organization-ID: 11111111-1111-1111-1111-111111111111`

#### **Path-Based**
- `/org/metro-general/appointments`

## 📊 **Multi-Tenant Monitoring**

### **Key Metrics to Track**
- **Cross-tenant query attempts**
- **Failed tenant resolution**
- **Per-tenant resource usage**
- **Subscription compliance**

### **Alerting**
```typescript
// Alert on potential data leakage
if (query.organizationId !== currentTenant.organizationId) {
  securityLogger.alert('Cross-tenant query attempt', {
    userId,
    attemptedOrg: query.organizationId,
    currentOrg: currentTenant.organizationId
  });
}
```

## 💰 **Subscription Management**

### **Plan Types**
```typescript
interface SubscriptionPlan {
  name: 'basic' | 'professional' | 'enterprise';
  userLimit: number;
  providerLimit: number;
  appointmentLimit: number;
  features: string[];
  priceMonthly: number;
}
```

### **Usage Tracking**
```typescript
// Track usage per organization
await usageService.recordAppointment(organizationId);
await subscriptionService.checkLimits(organizationId);
```

## 🧪 **Testing Multi-Tenancy**

### **Integration Tests**
```typescript
describe('Multi-Tenant Isolation', () => {
  test('Hospital A cannot see Hospital B data', async () => {
    // Create appointments for both hospitals
    const hospitalA = await createOrganization('hospital-a');
    const hospitalB = await createOrganization('hospital-b');
    
    const appointmentA = await createAppointment(hospitalA.id);
    const appointmentB = await createAppointment(hospitalB.id);
    
    // Set tenant context to Hospital A
    await setTenantContext(hospitalA.id);
    
    // Query should only return Hospital A's appointments
    const appointments = await appointmentService.findAll();
    expect(appointments).toHaveLength(1);
    expect(appointments[0].id).toBe(appointmentA.id);
  });
});
```

## 📅 **Implementation Timeline**

| Phase | Duration | Dependencies | Risk Level |
|-------|----------|--------------|------------|
| **Database Migration** | 4-6 weeks | Schema design, data migration | High |
| **Backend Services** | 6-8 weeks | Database migration | Medium |
| **Frontend Updates** | 4-6 weeks | Backend services | Low |
| **Testing & Security** | 3-4 weeks | All previous phases | Medium |
| **Production Deployment** | 2-3 weeks | Full testing | High |

**Total Estimated Time: 19-27 weeks (5-7 months)**

## ⚡ **Quick Start for Development**

### **1. Enable Multi-Tenancy**
```bash
# Apply multi-tenant schema
docker-compose exec postgres psql -U agentcare_user -d agentcare -f /docker-entrypoint-initdb.d/multi-tenant-schema.sql

# Restart with multi-tenant configuration
docker-compose down
docker-compose up -d
```

### **2. Create Test Organizations**
```bash
curl -X POST http://localhost:3000/api/v1/organizations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Hospital",
    "slug": "test-hospital",
    "type": "hospital",
    "address": {"city": "Test City"},
    "contactInfo": {"email": "test@hospital.com"}
  }'
```

### **3. Test Tenant Resolution**
```bash
# Access via subdomain header
curl -H "Host: test-hospital.agentcare.dev" http://localhost:3000/api/v1/appointments

# Access via organization ID header
curl -H "X-Organization-ID: 11111111-1111-1111-1111-111111111111" http://localhost:3000/api/v1/appointments
```

## 🔄 **Migration Strategy**

### **Zero-Downtime Migration**
1. **Deploy schema changes** (backwards compatible)
2. **Update application** to be tenant-aware
3. **Migrate existing data** to default organization  
4. **Enable tenant enforcement**
5. **Create new organizations**

### **Rollback Plan**
- Keep backup of pre-migration database
- Feature flags to disable multi-tenancy
- Gradual rollout to minimize risk

## ✅ **Production Readiness Checklist**

- [ ] Database schema migration complete
- [ ] All services updated for tenant awareness
- [ ] Row Level Security policies active
- [ ] Cross-tenant isolation tests passing
- [ ] Performance benchmarks met
- [ ] Security audit completed
- [ ] Documentation updated
- [ ] Team training completed
- [ ] Monitoring and alerting configured
- [ ] Backup and disaster recovery tested

## 🎯 **Conclusion**

AgentCare has excellent healthcare features but requires significant architectural changes to support multiple hospitals safely. The implementation involves:

1. **6+ months of development work**
2. **Complete database schema overhaul**
3. **Extensive security testing**
4. **HIPAA compliance verification**

**Recommendation**: Plan for a major version release (v3.0) with multi-tenancy as the primary feature, ensuring proper testing and gradual rollout to minimize risks. 