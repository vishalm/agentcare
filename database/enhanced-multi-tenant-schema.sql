-- Enhanced AgentCare Multi-Tenant Schema
-- Complete healthcare SaaS with all user types and roles
-- HIPAA-compliant with comprehensive tenant isolation

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enhanced organizations table with all healthcare facility types
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'clinic', -- hospital, clinic, practice, urgent_care, specialty_center, telehealth, multi_location
    subtype VARCHAR(100), -- solo_practice, group_practice, emergency_department, etc.
    size VARCHAR(20) DEFAULT 'small', -- small (1-10), medium (11-50), large (51-200), enterprise (200+)
    
    -- Contact & Location
    address JSONB NOT NULL,
    contact_info JSONB NOT NULL,
    business_hours JSONB DEFAULT '{}',
    timezone VARCHAR(50) DEFAULT 'America/New_York',
    
    -- Legal & Compliance
    license_number VARCHAR(100) UNIQUE,
    tax_id VARCHAR(50),
    npi_number VARCHAR(20), -- National Provider Identifier
    accreditation JSONB DEFAULT '[]', -- Joint Commission, NCQA, etc.
    
    -- Branding & Customization
    logo_url VARCHAR(500),
    website VARCHAR(255),
    brand_colors JSONB DEFAULT '{}',
    custom_domain VARCHAR(255),
    
    -- Settings & Configuration
    settings JSONB DEFAULT '{}',
    features_enabled JSONB DEFAULT '[]',
    integration_config JSONB DEFAULT '{}',
    
    -- Subscription & Billing
    subscription_plan VARCHAR(50) DEFAULT 'basic',
    subscription_status VARCHAR(50) DEFAULT 'trial',
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    billing_info JSONB DEFAULT '{}',
    
    -- Status & Tracking
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    onboarding_status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    onboarded_at TIMESTAMP WITH TIME ZONE,
    onboarded_by UUID
);

-- Enhanced user roles table
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- management, provider, nursing, support, allied_health, patient, caregiver, external
    level INTEGER DEFAULT 0, -- 0=basic, 10=advanced, 20=admin, 30=owner
    permissions JSONB DEFAULT '[]',
    is_system_role BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert comprehensive healthcare roles
INSERT INTO user_roles (name, description, category, level, permissions, is_system_role) VALUES
-- Management Roles
('organization_owner', 'Organization Owner - Full system access', 'management', 30, '["*"]', true),
('system_administrator', 'System Administrator - IT and integrations', 'management', 25, '["system_admin", "integration_manage", "user_manage"]', true),
('practice_manager', 'Practice Manager - Operations oversight', 'management', 20, '["operations_manage", "staff_manage", "schedule_manage"]', true),
('compliance_officer', 'Compliance Officer - HIPAA and regulatory', 'management', 20, '["compliance_manage", "audit_view", "policy_manage"]', true),
('billing_manager', 'Billing Manager - Financial operations', 'management', 15, '["billing_manage", "insurance_manage", "reports_financial"]', true),
('department_head', 'Department Head - Departmental oversight', 'management', 15, '["department_manage", "staff_supervise"]', true),

-- Provider Roles
('attending_physician', 'Attending Physician - Primary care provider', 'provider', 20, '["patient_full", "appointment_manage", "medical_record_full", "prescription_write"]', true),
('specialist', 'Medical Specialist - Specialty care provider', 'provider', 20, '["patient_assigned", "appointment_manage", "medical_record_full", "prescription_write"]', true),
('surgeon', 'Surgeon - Surgical procedures', 'provider', 20, '["patient_assigned", "appointment_manage", "medical_record_full", "surgery_schedule"]', true),
('resident_physician', 'Resident Physician - Training physician', 'provider', 15, '["patient_assigned", "appointment_view", "medical_record_limited", "prescription_supervised"]', true),
('nurse_practitioner', 'Nurse Practitioner - Advanced practice nurse', 'provider', 18, '["patient_assigned", "appointment_manage", "medical_record_full", "prescription_write"]', true),
('physician_assistant', 'Physician Assistant - Physician extender', 'provider', 18, '["patient_assigned", "appointment_manage", "medical_record_full", "prescription_supervised"]', true),

-- Nursing Roles
('nurse_manager', 'Nurse Manager - Unit supervision', 'nursing', 18, '["nursing_supervise", "patient_assigned", "schedule_nursing"]', true),
('registered_nurse', 'Registered Nurse - Direct patient care', 'nursing', 15, '["patient_assigned", "medical_record_nursing", "medication_administer"]', true),
('charge_nurse', 'Charge Nurse - Shift leadership', 'nursing', 16, '["nursing_shift_lead", "patient_assigned", "staff_coordinate"]', true),
('licensed_practical_nurse', 'Licensed Practical Nurse - Basic nursing care', 'nursing', 12, '["patient_assigned", "medical_record_basic", "vital_signs"]', true),

-- Support Staff Roles
('medical_assistant', 'Medical Assistant - Clinical support', 'support', 12, '["patient_vitals", "appointment_assist", "medical_record_basic"]', true),
('front_desk', 'Front Desk Staff - Patient check-in/out', 'support', 10, '["patient_checkin", "appointment_schedule", "insurance_verify"]', true),
('scheduler', 'Scheduler - Appointment coordination', 'support', 10, '["appointment_manage", "patient_contact", "calendar_manage"]', true),
('insurance_verifier', 'Insurance Verifier - Coverage validation', 'support', 10, '["insurance_verify", "patient_demographics", "billing_basic"]', true),
('medical_records', 'Medical Records - Documentation management', 'support', 12, '["medical_record_manage", "document_scan", "record_organize"]', true),

-- Allied Health Roles
('physical_therapist', 'Physical Therapist - Rehabilitation', 'allied_health', 18, '["patient_assigned", "therapy_plan", "progress_notes"]', true),
('occupational_therapist', 'Occupational Therapist - Functional recovery', 'allied_health', 18, '["patient_assigned", "therapy_plan", "progress_notes"]', true),
('social_worker', 'Social Worker - Psychosocial support', 'allied_health', 16, '["patient_assigned", "social_assessment", "resource_coordinate"]', true),
('pharmacist', 'Pharmacist - Medication management', 'allied_health', 18, '["medication_review", "prescription_verify", "drug_interaction"]', true),

-- Patient & Caregiver Roles
('patient', 'Patient - Care recipient', 'patient', 5, '["own_data_view", "appointment_self_schedule", "medical_record_own"]', true),
('caregiver', 'Caregiver - Authorized care assistant', 'caregiver', 8, '["authorized_patient_data", "appointment_assist", "communication_receive"]', true),
('guardian', 'Legal Guardian - Legal decision maker', 'caregiver', 10, '["authorized_patient_full", "medical_decisions", "appointment_manage"]', true),

-- External Roles
('referring_physician', 'Referring Physician - External referrals', 'external', 5, '["referral_view", "patient_limited"]', true),
('insurance_rep', 'Insurance Representative - Coverage liaison', 'external', 5, '["insurance_inquiries", "authorization_view"]', true);

-- Enhanced organization users with comprehensive role management
CREATE TABLE IF NOT EXISTS organization_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Role Management
    primary_role_id UUID NOT NULL REFERENCES user_roles(id),
    additional_roles JSONB DEFAULT '[]', -- Array of additional role IDs
    custom_permissions JSONB DEFAULT '[]', -- Custom permissions beyond role
    
    -- Professional Information
    employee_id VARCHAR(50),
    department VARCHAR(100),
    title VARCHAR(150),
    specialties JSONB DEFAULT '[]',
    
    -- License & Credentials
    license_number VARCHAR(100),
    license_state VARCHAR(10),
    license_expires_at DATE,
    dea_number VARCHAR(20),
    npi_number VARCHAR(20),
    certifications JSONB DEFAULT '[]',
    
    -- Employment Details
    hire_date DATE,
    employment_type VARCHAR(50) DEFAULT 'full_time', -- full_time, part_time, contract, per_diem
    work_schedule JSONB DEFAULT '{}',
    
    -- Access Control
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    access_level INTEGER DEFAULT 0, -- 0=basic, 10=elevated, 20=admin
    last_login_at TIMESTAMP WITH TIME ZONE,
    password_expires_at TIMESTAMP WITH TIME ZONE,
    requires_2fa BOOLEAN DEFAULT false,
    
    -- Tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    
    UNIQUE(organization_id, user_id)
);

-- Patient-caregiver relationships
CREATE TABLE IF NOT EXISTS patient_caregivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    caregiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Relationship Details
    relationship_type VARCHAR(50) NOT NULL, -- spouse, parent, child, guardian, power_of_attorney, professional_caregiver
    is_primary BOOLEAN DEFAULT false,
    is_emergency_contact BOOLEAN DEFAULT false,
    
    -- Authorization & Permissions
    authorization_level VARCHAR(50) DEFAULT 'basic', -- basic, full, medical_decisions, financial
    authorized_actions JSONB DEFAULT '[]',
    authorization_document_url VARCHAR(500),
    authorized_by UUID REFERENCES users(id),
    authorized_at TIMESTAMP WITH TIME ZONE,
    
    -- Contact Preferences
    can_schedule_appointments BOOLEAN DEFAULT false,
    can_receive_medical_info BOOLEAN DEFAULT false,
    can_make_medical_decisions BOOLEAN DEFAULT false,
    preferred_contact_method VARCHAR(50) DEFAULT 'phone',
    
    -- Status & Tracking
    is_active BOOLEAN DEFAULT true,
    verified_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(organization_id, patient_id, caregiver_id)
);

-- Departments within organizations
CREATE TABLE IF NOT EXISTS organization_departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(20) UNIQUE,
    description TEXT,
    department_type VARCHAR(50), -- clinical, administrative, support, ancillary
    parent_department_id UUID REFERENCES organization_departments(id),
    head_user_id UUID REFERENCES users(id),
    location JSONB, -- Building, floor, room details
    contact_info JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced user profiles with healthcare-specific fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_type VARCHAR(50) DEFAULT 'patient';
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10) DEFAULT 'en';
ALTER TABLE users ADD COLUMN IF NOT EXISTS emergency_contact JSONB DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS insurance_info JSONB DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS medical_record_number VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';

-- Drop existing unique constraints that conflict with multi-tenancy
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE providers DROP CONSTRAINT IF EXISTS providers_email_key;
ALTER TABLE providers DROP CONSTRAINT IF EXISTS providers_license_number_key;

-- Create tenant-scoped unique indexes
CREATE UNIQUE INDEX IF NOT EXISTS users_email_org_unique ON users(email, organization_id);
CREATE UNIQUE INDEX IF NOT EXISTS users_medical_record_org_unique ON users(medical_record_number, organization_id) WHERE medical_record_number IS NOT NULL;

-- Add organization_id to all existing tables for tenant isolation
ALTER TABLE providers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- Create tenant-scoped unique indexes for providers
CREATE UNIQUE INDEX IF NOT EXISTS providers_email_org_unique ON providers(email, organization_id);
CREATE UNIQUE INDEX IF NOT EXISTS providers_license_org_unique ON providers(license_number, organization_id) WHERE license_number IS NOT NULL;

-- Enhanced audit logging with tenant context
ALTER TABLE audit.access_logs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
ALTER TABLE audit.access_logs ADD COLUMN IF NOT EXISTS user_role VARCHAR(100);
ALTER TABLE audit.access_logs ADD COLUMN IF NOT EXISTS department VARCHAR(100);

-- Multi-tenant indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_providers_organization_id ON providers(organization_id);
CREATE INDEX IF NOT EXISTS idx_appointments_organization_id ON appointments(organization_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_organization_id ON medical_records(organization_id);
CREATE INDEX IF NOT EXISTS idx_conversations_organization_id ON conversations(organization_id);
CREATE INDEX IF NOT EXISTS idx_sessions_organization_id ON sessions(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_users_org_id ON organization_users(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_users_role ON organization_users(primary_role_id);
CREATE INDEX IF NOT EXISTS idx_patient_caregivers_patient ON patient_caregivers(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_caregivers_caregiver ON patient_caregivers(caregiver_id);

-- Row Level Security policies for complete tenant isolation
DROP POLICY IF EXISTS users_tenant_isolation ON users;
DROP POLICY IF EXISTS providers_tenant_isolation ON providers;
DROP POLICY IF EXISTS appointments_tenant_isolation ON appointments;
DROP POLICY IF EXISTS medical_records_tenant_isolation ON medical_records;

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_caregivers ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies
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

CREATE POLICY organization_users_tenant_isolation ON organization_users
    USING (organization_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY patient_caregivers_tenant_isolation ON patient_caregivers
    USING (organization_id = current_setting('app.current_tenant_id')::UUID);

-- Functions for tenant context management
CREATE OR REPLACE FUNCTION set_tenant_context(tenant_id UUID)
RETURNS void AS $$
BEGIN
    PERFORM set_config('app.current_tenant_id', tenant_id::text, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_current_tenant()
RETURNS UUID AS $$
BEGIN
    RETURN current_setting('app.current_tenant_id', true)::UUID;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to check user permissions
CREATE OR REPLACE FUNCTION user_has_permission(user_id UUID, permission_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    has_permission BOOLEAN := false;
    user_role RECORD;
    role_permissions JSONB;
BEGIN
    -- Get user's primary role and permissions
    SELECT ur.permissions INTO role_permissions
    FROM organization_users ou
    JOIN user_roles ur ON ou.primary_role_id = ur.id
    WHERE ou.user_id = user_id 
    AND ou.organization_id = get_current_tenant()
    AND ou.is_active = true;
    
    -- Check if user has the permission
    IF role_permissions ? permission_name OR role_permissions ? '*' THEN
        has_permission := true;
    END IF;
    
    RETURN has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for updated_at columns
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organization_users_updated_at BEFORE UPDATE ON organization_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_caregivers_updated_at BEFORE UPDATE ON patient_caregivers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample organizations with different types
INSERT INTO organizations (id, name, slug, type, subtype, size, address, contact_info, license_number) VALUES
(
    '11111111-1111-1111-1111-111111111111',
    'Metro General Hospital',
    'metro-general',
    'hospital',
    'general_hospital',
    'large',
    '{"street": "123 Medical Center Dr", "city": "New York", "state": "NY", "zip": "10001", "country": "USA"}',
    '{"phone": "+1-555-0100", "email": "info@metrogeneral.com", "website": "https://metrogeneral.com"}',
    'NY-HOSP-001'
),
(
    '22222222-2222-2222-2222-222222222222',
    'Sunset Family Clinic',
    'sunset-clinic',
    'clinic',
    'family_practice',
    'small',
    '{"street": "456 Sunset Blvd", "city": "Los Angeles", "state": "CA", "zip": "90028", "country": "USA"}',
    '{"phone": "+1-555-0200", "email": "info@sunsetclinic.com", "website": "https://sunsetclinic.com"}',
    'CA-CLINIC-002'
),
(
    '33333333-3333-3333-3333-333333333333',
    'Dr. Smith Cardiology',
    'smith-cardiology',
    'specialty_center',
    'cardiology',
    'small',
    '{"street": "789 Heart Way", "city": "Chicago", "state": "IL", "zip": "60601", "country": "USA"}',
    '{"phone": "+1-555-0300", "email": "info@smithcardiology.com"}',
    'IL-SPEC-003'
);

-- Grant permissions for all new tables
GRANT SELECT, INSERT, UPDATE, DELETE ON organizations TO agentcare_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_roles TO agentcare_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON organization_users TO agentcare_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON patient_caregivers TO agentcare_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON organization_departments TO agentcare_user;
GRANT USAGE ON SCHEMA audit TO agentcare_user; 