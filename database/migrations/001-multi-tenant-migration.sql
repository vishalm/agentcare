-- AgentCare Multi-Tenant Migration Script
-- Safely migrates existing single-tenant system to multi-tenant architecture
-- Run this script during maintenance window

BEGIN;

-- Step 1: Create new multi-tenant tables
\echo 'Creating multi-tenant tables...'

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    level INTEGER DEFAULT 0,
    permissions JSONB DEFAULT '[]',
    is_system_role BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'clinic',
    subtype VARCHAR(100),
    size VARCHAR(20) DEFAULT 'small',
    address JSONB NOT NULL,
    contact_info JSONB NOT NULL,
    business_hours JSONB DEFAULT '{}',
    timezone VARCHAR(50) DEFAULT 'America/New_York',
    license_number VARCHAR(100),
    tax_id VARCHAR(50),
    npi_number VARCHAR(20),
    accreditation JSONB DEFAULT '[]',
    logo_url VARCHAR(500),
    website VARCHAR(255),
    brand_colors JSONB DEFAULT '{}',
    custom_domain VARCHAR(255),
    settings JSONB DEFAULT '{}',
    features_enabled JSONB DEFAULT '[]',
    integration_config JSONB DEFAULT '{}',
    subscription_plan VARCHAR(50) DEFAULT 'basic',
    subscription_status VARCHAR(50) DEFAULT 'active',
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    billing_info JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT true,
    onboarding_status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    onboarded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    onboarded_by UUID
);

-- Insert system roles
\echo 'Inserting system roles...'
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
('insurance_rep', 'Insurance Representative - Coverage liaison', 'external', 5, '["insurance_inquiries", "authorization_view"]', true)
ON CONFLICT (name) DO NOTHING;

-- Step 2: Create default organization for existing data
\echo 'Creating default organization...'
INSERT INTO organizations (
    id, 
    name, 
    slug, 
    type, 
    address, 
    contact_info,
    onboarding_status,
    is_verified
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'Default Organization',
    'default',
    'clinic',
    '{"street": "123 Main St", "city": "Default City", "state": "NY", "zip": "10001", "country": "USA"}',
    '{"phone": "+1-555-0100", "email": "admin@agentcare.com"}',
    'completed',
    true
) ON CONFLICT (id) DO NOTHING;

-- Step 3: Add organization_id columns to existing tables (nullable initially)
\echo 'Adding organization_id columns...'

-- Add to users table
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

-- Add to providers table
ALTER TABLE providers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- Add to appointments table
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- Add to medical_records table
ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- Add to conversations table (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations') THEN
        ALTER TABLE conversations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
    END IF;
END $$;

-- Add to notifications table (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
        ALTER TABLE notifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
    END IF;
END $$;

-- Add to sessions table (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sessions') THEN
        ALTER TABLE sessions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
    END IF;
END $$;

-- Step 4: Update all existing records to use default organization
\echo 'Migrating existing data to default organization...'

UPDATE users 
SET organization_id = '00000000-0000-0000-0000-000000000000'
WHERE organization_id IS NULL;

UPDATE providers 
SET organization_id = '00000000-0000-0000-0000-000000000000'
WHERE organization_id IS NULL;

UPDATE appointments 
SET organization_id = '00000000-0000-0000-0000-000000000000'
WHERE organization_id IS NULL;

UPDATE medical_records 
SET organization_id = '00000000-0000-0000-0000-000000000000'
WHERE organization_id IS NULL;

-- Update other tables if they exist
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations') THEN
        UPDATE conversations 
        SET organization_id = '00000000-0000-0000-0000-000000000000'
        WHERE organization_id IS NULL;
    END IF;
END $$;

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
        UPDATE notifications 
        SET organization_id = '00000000-0000-0000-0000-000000000000'
        WHERE organization_id IS NULL;
    END IF;
END $$;

-- Step 5: Create additional multi-tenant tables
\echo 'Creating additional multi-tenant tables...'

-- Organization users table
CREATE TABLE IF NOT EXISTS organization_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    primary_role_id UUID NOT NULL REFERENCES user_roles(id),
    additional_roles JSONB DEFAULT '[]',
    custom_permissions JSONB DEFAULT '[]',
    employee_id VARCHAR(50),
    department VARCHAR(100),
    title VARCHAR(150),
    specialties JSONB DEFAULT '[]',
    license_number VARCHAR(100),
    license_state VARCHAR(10),
    license_expires_at DATE,
    dea_number VARCHAR(20),
    npi_number VARCHAR(20),
    certifications JSONB DEFAULT '[]',
    hire_date DATE,
    employment_type VARCHAR(50) DEFAULT 'full_time',
    work_schedule JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    access_level INTEGER DEFAULT 0,
    last_login_at TIMESTAMP WITH TIME ZONE,
    password_expires_at TIMESTAMP WITH TIME ZONE,
    requires_2fa BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    UNIQUE(organization_id, user_id)
);

-- Patient caregivers table
CREATE TABLE IF NOT EXISTS patient_caregivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    caregiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    is_emergency_contact BOOLEAN DEFAULT false,
    authorization_level VARCHAR(50) DEFAULT 'basic',
    authorized_actions JSONB DEFAULT '[]',
    authorization_document_url VARCHAR(500),
    authorized_by UUID REFERENCES users(id),
    authorized_at TIMESTAMP WITH TIME ZONE,
    can_schedule_appointments BOOLEAN DEFAULT false,
    can_receive_medical_info BOOLEAN DEFAULT false,
    can_make_medical_decisions BOOLEAN DEFAULT false,
    preferred_contact_method VARCHAR(50) DEFAULT 'phone',
    is_active BOOLEAN DEFAULT true,
    verified_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, patient_id, caregiver_id)
);

-- Organization departments table
CREATE TABLE IF NOT EXISTS organization_departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(20),
    description TEXT,
    department_type VARCHAR(50),
    parent_department_id UUID REFERENCES organization_departments(id),
    head_user_id UUID REFERENCES users(id),
    location JSONB,
    contact_info JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Organization domains table
CREATE TABLE IF NOT EXISTS organization_domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    domain VARCHAR(255) NOT NULL UNIQUE,
    is_primary BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    verification_token VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 6: Create organization users for existing users
\echo 'Creating organization user records for existing users...'

-- Get patient role ID
DO $$ 
DECLARE
    patient_role_id UUID;
    provider_role_id UUID;
    user_record RECORD;
BEGIN
    SELECT id INTO patient_role_id FROM user_roles WHERE name = 'patient';
    SELECT id INTO provider_role_id FROM user_roles WHERE name = 'attending_physician';
    
    -- Create organization users for existing users
    FOR user_record IN SELECT id, organization_id FROM users WHERE organization_id IS NOT NULL LOOP
        INSERT INTO organization_users (
            organization_id, 
            user_id, 
            primary_role_id, 
            is_active
        ) VALUES (
            user_record.organization_id,
            user_record.id,
            CASE 
                WHEN EXISTS (SELECT 1 FROM providers WHERE user_id = user_record.id) 
                THEN provider_role_id
                ELSE patient_role_id
            END,
            true
        ) ON CONFLICT (organization_id, user_id) DO NOTHING;
    END LOOP;
END $$;

-- Step 7: Drop old unique constraints and create tenant-scoped ones
\echo 'Updating unique constraints for multi-tenancy...'

-- Drop existing unique constraints that conflict with multi-tenancy
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_unique;

-- Check if providers table exists before modifying it
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'providers') THEN
        ALTER TABLE providers DROP CONSTRAINT IF EXISTS providers_email_key;
        ALTER TABLE providers DROP CONSTRAINT IF EXISTS providers_email_unique;
        ALTER TABLE providers DROP CONSTRAINT IF EXISTS providers_license_number_key;
        ALTER TABLE providers DROP CONSTRAINT IF EXISTS providers_license_number_unique;
        
        -- Create tenant-scoped unique indexes for providers
        CREATE UNIQUE INDEX IF NOT EXISTS providers_email_org_unique ON providers(email, organization_id);
        CREATE UNIQUE INDEX IF NOT EXISTS providers_license_org_unique ON providers(license_number, organization_id) WHERE license_number IS NOT NULL;
    END IF;
END $$;

-- Create tenant-scoped unique indexes for users
CREATE UNIQUE INDEX IF NOT EXISTS users_email_org_unique ON users(email, organization_id);
CREATE UNIQUE INDEX IF NOT EXISTS users_medical_record_org_unique ON users(medical_record_number, organization_id) WHERE medical_record_number IS NOT NULL;

-- Step 8: Create performance indexes
\echo 'Creating performance indexes...'

CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_appointments_organization_id ON appointments(organization_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_organization_id ON medical_records(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_users_org_id ON organization_users(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_users_role ON organization_users(primary_role_id);
CREATE INDEX IF NOT EXISTS idx_patient_caregivers_patient ON patient_caregivers(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_caregivers_caregiver ON patient_caregivers(caregiver_id);

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'providers') THEN
        CREATE INDEX IF NOT EXISTS idx_providers_organization_id ON providers(organization_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations') THEN
        CREATE INDEX IF NOT EXISTS idx_conversations_organization_id ON conversations(organization_id);
    END IF;
END $$;

-- Step 9: Create default domain for default organization
\echo 'Creating default domain...'
INSERT INTO organization_domains (organization_id, domain, is_primary, is_verified) 
VALUES ('00000000-0000-0000-0000-000000000000', 'default.agentcare.com', true, true)
ON CONFLICT (domain) DO NOTHING;

-- Step 10: Create trigger functions for updated_at
\echo 'Creating trigger functions...'

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at columns
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organization_users_updated_at BEFORE UPDATE ON organization_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_caregivers_updated_at BEFORE UPDATE ON patient_caregivers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 11: Create tenant context functions
\echo 'Creating tenant context functions...'

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

-- Step 12: Enable Row Level Security (OPTIONAL - can be enabled later)
\echo 'Setting up Row Level Security (commented out for safety)...'

-- Uncomment these lines when ready to enable RLS:
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE organization_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (commented out for safety):
-- CREATE POLICY users_tenant_isolation ON users
--     USING (organization_id = current_setting('app.current_tenant_id')::UUID);

-- Step 13: Grant permissions
\echo 'Granting permissions...'

GRANT SELECT, INSERT, UPDATE, DELETE ON organizations TO agentcare_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_roles TO agentcare_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON organization_users TO agentcare_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON patient_caregivers TO agentcare_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON organization_departments TO agentcare_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON organization_domains TO agentcare_user;

-- Step 14: Make organization_id NOT NULL (after data migration)
\echo 'Making organization_id columns NOT NULL...'

-- Only make NOT NULL if all records have been updated
DO $$ 
DECLARE
    null_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO null_count FROM users WHERE organization_id IS NULL;
    IF null_count = 0 THEN
        ALTER TABLE users ALTER COLUMN organization_id SET NOT NULL;
    ELSE
        RAISE NOTICE 'Skipping NOT NULL constraint on users.organization_id - % records still have NULL values', null_count;
    END IF;
    
    SELECT COUNT(*) INTO null_count FROM appointments WHERE organization_id IS NULL;
    IF null_count = 0 THEN
        ALTER TABLE appointments ALTER COLUMN organization_id SET NOT NULL;
    ELSE
        RAISE NOTICE 'Skipping NOT NULL constraint on appointments.organization_id - % records still have NULL values', null_count;
    END IF;
    
    SELECT COUNT(*) INTO null_count FROM medical_records WHERE organization_id IS NULL;
    IF null_count = 0 THEN
        ALTER TABLE medical_records ALTER COLUMN organization_id SET NOT NULL;
    ELSE
        RAISE NOTICE 'Skipping NOT NULL constraint on medical_records.organization_id - % records still have NULL values', null_count;
    END IF;
END $$;

-- Commit the transaction
COMMIT;

\echo 'Multi-tenant migration completed successfully!'
\echo 'Next steps:'
\echo '1. Test the application with the default organization'
\echo '2. Create new organizations using the API'
\echo '3. Gradually enable Row Level Security policies'
\echo '4. Update application code to be tenant-aware' 