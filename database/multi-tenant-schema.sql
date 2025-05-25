-- AgentCare Multi-Tenant Schema Extension
-- Adds support for multiple hospitals/organizations
-- HIPAA-compliant with complete tenant isolation

-- Organizations/Hospitals table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL, -- URL-friendly identifier
    type VARCHAR(50) NOT NULL DEFAULT 'hospital', -- hospital, clinic, practice
    address JSONB NOT NULL,
    contact_info JSONB NOT NULL,
    logo_url VARCHAR(500),
    website VARCHAR(255),
    license_number VARCHAR(100) UNIQUE,
    accreditation JSONB DEFAULT '[]',
    settings JSONB DEFAULT '{}',
    subscription_plan VARCHAR(50) DEFAULT 'basic',
    subscription_status VARCHAR(50) DEFAULT 'active',
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    onboarded_at TIMESTAMP WITH TIME ZONE,
    onboarded_by UUID
);

-- Organization Users (staff, admins)
CREATE TABLE IF NOT EXISTS organization_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'staff', -- admin, manager, staff, readonly
    permissions JSONB DEFAULT '[]',
    department VARCHAR(100),
    employee_id VARCHAR(50),
    hire_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, user_id)
);

-- Organization Domains (for subdomain routing)
CREATE TABLE IF NOT EXISTS organization_domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    domain VARCHAR(255) NOT NULL UNIQUE,
    is_primary BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    verification_token VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add organization_id to existing tables (Migration Script)
-- This would be a migration in production, showing here for clarity

-- 1. Add organization_id to users table
ALTER TABLE users ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE users DROP CONSTRAINT users_email_key; -- Remove global email unique
CREATE UNIQUE INDEX users_email_org_unique ON users(email, organization_id); -- Tenant-scoped unique

-- 2. Add organization_id to providers table  
ALTER TABLE providers ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE providers DROP CONSTRAINT providers_email_key;
ALTER TABLE providers DROP CONSTRAINT providers_license_number_key;
CREATE UNIQUE INDEX providers_email_org_unique ON providers(email, organization_id);
CREATE UNIQUE INDEX providers_license_org_unique ON providers(license_number, organization_id);

-- 3. Add organization_id to other tables
ALTER TABLE appointments ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE medical_records ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE conversations ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE notifications ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE audit.access_logs ADD COLUMN organization_id UUID REFERENCES organizations(id);

-- 4. Add organization_id to sessions for tenant context
ALTER TABLE sessions ADD COLUMN organization_id UUID REFERENCES organizations(id);

-- Organization-specific system configuration
CREATE TABLE IF NOT EXISTS organization_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    key VARCHAR(255) NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    is_sensitive BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(id),
    UNIQUE(organization_id, key)
);

-- Organization subscription tracking
CREATE TABLE IF NOT EXISTS organization_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    plan_type VARCHAR(50) NOT NULL,
    features JSONB DEFAULT '[]',
    user_limit INTEGER,
    provider_limit INTEGER,
    appointment_limit_monthly INTEGER,
    price_monthly DECIMAL(10,2),
    billing_cycle VARCHAR(20) DEFAULT 'monthly',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    auto_renew BOOLEAN DEFAULT true,
    status VARCHAR(50) DEFAULT 'active',
    stripe_subscription_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Organization integrations (EHR, billing systems, etc.)
CREATE TABLE IF NOT EXISTS organization_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    integration_type VARCHAR(100) NOT NULL, -- epic, cerner, allscripts, stripe, etc.
    name VARCHAR(255) NOT NULL,
    config JSONB NOT NULL, -- Encrypted connection details
    credentials JSONB, -- Encrypted API keys/tokens
    is_active BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    sync_status VARCHAR(50) DEFAULT 'pending',
    error_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Multi-tenant indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_providers_organization_id ON providers(organization_id);
CREATE INDEX IF NOT EXISTS idx_appointments_organization_id ON appointments(organization_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_organization_id ON medical_records(organization_id);
CREATE INDEX IF NOT EXISTS idx_conversations_organization_id ON conversations(organization_id);
CREATE INDEX IF NOT EXISTS idx_sessions_organization_id ON sessions(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_organization_id ON audit.access_logs(organization_id);

-- Organization-specific indexes
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organization_users_org_id ON organization_users(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_users_user_id ON organization_users(user_id);
CREATE INDEX IF NOT EXISTS idx_organization_domains_domain ON organization_domains(domain);

-- Update RLS policies for multi-tenancy
DROP POLICY IF EXISTS users_own_data ON users;
DROP POLICY IF EXISTS medical_records_patient_access ON medical_records;
DROP POLICY IF EXISTS appointments_patient_access ON appointments;

-- Multi-tenant RLS policies
CREATE POLICY users_tenant_isolation ON users
    USING (organization_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY providers_tenant_isolation ON providers
    USING (organization_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY appointments_tenant_isolation ON appointments
    USING (organization_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY medical_records_tenant_isolation ON medical_records
    USING (organization_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY conversations_tenant_isolation ON conversations
    USING (organization_id = current_setting('app.current_tenant_id')::UUID);

-- Enable RLS on all tenant-aware tables
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Triggers for multi-tenant tables
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organization_users_updated_at BEFORE UPDATE ON organization_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organization_config_updated_at BEFORE UPDATE ON organization_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to set tenant context
CREATE OR REPLACE FUNCTION set_tenant_context(tenant_id UUID)
RETURNS void AS $$
BEGIN
    PERFORM set_config('app.current_tenant_id', tenant_id::text, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current tenant
CREATE OR REPLACE FUNCTION get_current_tenant()
RETURNS UUID AS $$
BEGIN
    RETURN current_setting('app.current_tenant_id', true)::UUID;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Sample organizations for testing
INSERT INTO organizations (id, name, slug, type, address, contact_info, license_number) VALUES
(
    '11111111-1111-1111-1111-111111111111',
    'Metro General Hospital',
    'metro-general',
    'hospital',
    '{"street": "123 Medical Center Dr", "city": "New York", "state": "NY", "zip": "10001", "country": "USA"}',
    '{"phone": "+1-555-0100", "email": "info@metrogeneral.com", "website": "https://metrogeneral.com"}',
    'NY-HOSP-001'
),
(
    '22222222-2222-2222-2222-222222222222',
    'Sunset Community Clinic',
    'sunset-clinic',
    'clinic',
    '{"street": "456 Sunset Blvd", "city": "Los Angeles", "state": "CA", "zip": "90028", "country": "USA"}',
    '{"phone": "+1-555-0200", "email": "info@sunsetclinic.com", "website": "https://sunsetclinic.com"}',
    'CA-CLINIC-002'
),
(
    '33333333-3333-3333-3333-333333333333',
    'Children\'s Medical Center',
    'childrens-medical',
    'hospital',
    '{"street": "789 Pediatric Way", "city": "Chicago", "state": "IL", "zip": "60601", "country": "USA"}',
    '{"phone": "+1-555-0300", "email": "info@childrensmedical.com", "website": "https://childrensmedical.com"}',
    'IL-HOSP-003'
);

-- Sample domains
INSERT INTO organization_domains (organization_id, domain, is_primary, is_verified) VALUES
('11111111-1111-1111-1111-111111111111', 'metro-general.agentcare.dev', true, true),
('22222222-2222-2222-2222-222222222222', 'sunset-clinic.agentcare.dev', true, true),
('33333333-3333-3333-3333-333333333333', 'childrens-medical.agentcare.dev', true, true);

-- Grant permissions for multi-tenant tables
GRANT SELECT, INSERT, UPDATE, DELETE ON organizations TO agentcare_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON organization_users TO agentcare_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON organization_domains TO agentcare_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON organization_config TO agentcare_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON organization_subscriptions TO agentcare_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON organization_integrations TO agentcare_user; 