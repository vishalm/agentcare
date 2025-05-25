-- Demo Users Seed Data
-- Contains demo credentials for all personas
-- Password for all demo accounts: AgentCare2024!
-- Hashed using bcrypt with salt rounds 12

-- Insert demo users with hashed passwords
INSERT INTO users (
    id,
    email,
    password_hash,
    name,
    phone,
    date_of_birth,
    gender,
    address,
    emergency_contact,
    medical_record_number,
    preferences,
    profile,
    is_active,
    email_verified,
    phone_verified,
    created_at,
    updated_at
) VALUES 
-- Administrator
(
    'a0000000-0000-4000-8000-000000000001',
    'admin@agentcare.dev',
    '$2b$12$LJmO8NKhb.YbVB.BYw8yIOeZ8QJ7C.xGvZGp3mH8NqU9tKwCw0KtS', -- AgentCare2024!
    'System Administrator',
    '+1-555-0001',
    '1985-01-15',
    'Non-binary',
    '{"street": "123 Admin St", "city": "Tech City", "state": "CA", "zip": "90210", "country": "USA"}',
    '{"name": "Emergency Admin", "phone": "+1-555-0002", "relationship": "Colleague"}',
    NULL,
    '{"theme": "admin", "language": "en", "notifications": true, "timezone": "America/Los_Angeles"}',
    '{"role": "admin", "department": "IT", "permissions": ["admin", "user_management", "system_settings"], "bio": "System administrator with full access to AgentCare platform"}',
    true,
    true,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
-- Doctor/Physician
(
    'a0000000-0000-4000-8000-000000000002',
    'doctor@agentcare.dev',
    '$2b$12$LJmO8NKhb.YbVB.BYw8yIOeZ8QJ7C.xGvZGp3mH8NqU9tKwCw0KtS', -- AgentCare2024!
    'Dr. Sarah Johnson',
    '+1-555-0003',
    '1980-03-22',
    'Female',
    '{"street": "456 Medical Blvd", "city": "Health City", "state": "CA", "zip": "90211", "country": "USA"}',
    '{"name": "Dr. Michael Johnson", "phone": "+1-555-0004", "relationship": "Spouse"}',
    NULL,
    '{"theme": "doctor", "language": "en", "notifications": true, "timezone": "America/Los_Angeles"}',
    '{"role": "doctor", "department": "Cardiology", "permissions": ["patient_access", "appointment_management", "medical_records"], "specialization": "Cardiology", "license": "CA-MD-12345", "bio": "Board-certified cardiologist with 15 years of experience"}',
    true,
    true,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
-- Nurse
(
    'a0000000-0000-4000-8000-000000000003',
    'nurse@agentcare.dev',
    '$2b$12$LJmO8NKhb.YbVB.BYw8yIOeZ8QJ7C.xGvZGp3mH8NqU9tKwCw0KtS', -- AgentCare2024!
    'Alice Brown, RN',
    '+1-555-0005',
    '1988-07-10',
    'Female',
    '{"street": "789 Care Ave", "city": "Nursing Town", "state": "CA", "zip": "90212", "country": "USA"}',
    '{"name": "Robert Brown", "phone": "+1-555-0006", "relationship": "Husband"}',
    NULL,
    '{"theme": "nurse", "language": "en", "notifications": true, "timezone": "America/Los_Angeles"}',
    '{"role": "nurse", "department": "Emergency", "permissions": ["patient_access", "basic_records", "medication_admin"], "license": "CA-RN-67890", "bio": "Registered nurse specializing in emergency care"}',
    true,
    true,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
-- Patient
(
    'a0000000-0000-4000-8000-000000000004',
    'patient@agentcare.dev',
    '$2b$12$LJmO8NKhb.YbVB.BYw8yIOeZ8QJ7C.xGvZGp3mH8NqU9tKwCw0KtS', -- AgentCare2024!
    'John Smith',
    '+1-555-0007',
    '1975-11-05',
    'Male',
    '{"street": "321 Patient Rd", "city": "Wellness City", "state": "CA", "zip": "90213", "country": "USA"}',
    '{"name": "Jane Smith", "phone": "+1-555-0008", "relationship": "Wife"}',
    'MRN-001-2024',
    '{"theme": "patient", "language": "en", "notifications": true, "timezone": "America/Los_Angeles"}',
    '{"role": "patient", "permissions": ["self_access"], "insurance": {"provider": "HealthCare Plus", "policy": "HP-12345678", "group": "G-ABCD"}, "allergies": ["Penicillin"], "conditions": ["Hypertension"], "bio": "Regular patient with managed hypertension"}',
    true,
    true,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
-- Receptionist
(
    'a0000000-0000-4000-8000-000000000005',
    'receptionist@agentcare.dev',
    '$2b$12$LJmO8NKhb.YbVB.BYw8yIOeZ8QJ7C.xGvZGp3mH8NqU9tKwCw0KtS', -- AgentCare2024!
    'Maria Garcia',
    '+1-555-0009',
    '1990-09-15',
    'Female',
    '{"street": "654 Front Desk St", "city": "Reception City", "state": "CA", "zip": "90214", "country": "USA"}',
    '{"name": "Carlos Garcia", "phone": "+1-555-0010", "relationship": "Brother"}',
    NULL,
    '{"theme": "receptionist", "language": "en", "notifications": true, "timezone": "America/Los_Angeles"}',
    '{"role": "receptionist", "department": "Front Desk", "permissions": ["appointment_scheduling", "patient_checkin", "basic_info"], "languages": ["English", "Spanish"], "bio": "Bilingual front desk coordinator with excellent customer service skills"}',
    true,
    true,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
-- Specialist
(
    'a0000000-0000-4000-8000-000000000006',
    'specialist@agentcare.dev',
    '$2b$12$LJmO8NKhb.YbVB.BYw8yIOeZ8QJ7C.xGvZGp3mH8NqU9tKwCw0KtS', -- AgentCare2024!
    'Dr. Michael Chen',
    '+1-555-0011',
    '1978-12-03',
    'Male',
    '{"street": "987 Specialist Way", "city": "Expert Hills", "state": "CA", "zip": "90215", "country": "USA"}',
    '{"name": "Dr. Lisa Chen", "phone": "+1-555-0012", "relationship": "Spouse"}',
    NULL,
    '{"theme": "doctor", "language": "en", "notifications": true, "timezone": "America/Los_Angeles"}',
    '{"role": "specialist", "department": "Neurology", "permissions": ["patient_access", "appointment_management", "medical_records", "specialist_referrals"], "specialization": "Neurology", "license": "CA-MD-54321", "bio": "Board-certified neurologist specializing in movement disorders"}',
    true,
    true,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
-- Nurse Practitioner
(
    'a0000000-0000-4000-8000-000000000007',
    'np@agentcare.dev',
    '$2b$12$LJmO8NKhb.YbVB.BYw8yIOeZ8QJ7C.xGvZGp3mH8NqU9tKwCw0KtS', -- AgentCare2024!
    'Jennifer Wilson, NP',
    '+1-555-0013',
    '1985-05-20',
    'Female',
    '{"street": "147 Practice St", "city": "Care Valley", "state": "CA", "zip": "90216", "country": "USA"}',
    '{"name": "Mark Wilson", "phone": "+1-555-0014", "relationship": "Husband"}',
    NULL,
    '{"theme": "nurse", "language": "en", "notifications": true, "timezone": "America/Los_Angeles"}',
    '{"role": "nurse_practitioner", "department": "Primary Care", "permissions": ["patient_access", "prescription_management", "diagnosis", "medical_records"], "license": "CA-NP-11111", "bio": "Nurse practitioner providing comprehensive primary care services"}',
    true,
    true,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
-- Physician Assistant
(
    'a0000000-0000-4000-8000-000000000008',
    'pa@agentcare.dev',
    '$2b$12$LJmO8NKhb.YbVB.BYw8yIOeZ8QJ7C.xGvZGp3mH8NqU9tKwCw0KtS', -- AgentCare2024!
    'David Martinez, PA-C',
    '+1-555-0015',
    '1987-08-12',
    'Male',
    '{"street": "258 Assistant Blvd", "city": "Medical Valley", "state": "CA", "zip": "90217", "country": "USA"}',
    '{"name": "Sofia Martinez", "phone": "+1-555-0016", "relationship": "Wife"}',
    NULL,
    '{"theme": "nurse", "language": "en", "notifications": true, "timezone": "America/Los_Angeles"}',
    '{"role": "physician_assistant", "department": "Orthopedics", "permissions": ["patient_access", "treatment_plans", "medical_records"], "license": "CA-PA-22222", "bio": "Physician assistant specializing in orthopedic care and sports medicine"}',
    true,
    true,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
-- Super Admin
(
    'a0000000-0000-4000-8000-000000000009',
    'superadmin@agentcare.dev',
    '$2b$12$LJmO8NKhb.YbVB.BYw8yIOeZ8QJ7C.xGvZGp3mH8NqU9tKwCw0KtS', -- AgentCare2024!
    'Super Administrator',
    '+1-555-0017',
    '1982-02-28',
    'Non-binary',
    '{"street": "999 Super Admin Ct", "city": "Control Center", "state": "CA", "zip": "90218", "country": "USA"}',
    '{"name": "Security Team", "phone": "+1-555-0018", "relationship": "Work"}',
    NULL,
    '{"theme": "admin", "language": "en", "notifications": true, "timezone": "America/Los_Angeles"}',
    '{"role": "super_admin", "department": "System Management", "permissions": ["super_admin", "system_admin", "user_management", "organization_management"], "clearance": "Level 5", "bio": "Super administrator with maximum system privileges"}',
    true,
    true,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
-- Patient - Family Member Access
(
    'a0000000-0000-4000-8000-000000000010',
    'family@agentcare.dev',
    '$2b$12$LJmO8NKhb.YbVB.BYw8yIOeZ8QJ7C.xGvZGp3mH8NqU9tKwCw0KtS', -- AgentCare2024!
    'Mary Smith',
    '+1-555-0019',
    '1978-04-14',
    'Female',
    '{"street": "321 Patient Rd", "city": "Wellness City", "state": "CA", "zip": "90213", "country": "USA"}',
    '{"name": "John Smith", "phone": "+1-555-0007", "relationship": "Husband"}',
    'MRN-002-2024',
    '{"theme": "patient", "language": "en", "notifications": true, "timezone": "America/Los_Angeles"}',
    '{"role": "family_member", "permissions": ["family_access"], "primary_patient": "a0000000-0000-4000-8000-000000000004", "relationship": "Spouse", "bio": "Family member with access to spouse medical records"}',
    true,
    true,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Update last_login for realistic demo data
UPDATE users SET 
    last_login = CURRENT_TIMESTAMP - INTERVAL '1 hour'
WHERE email IN (
    'admin@agentcare.dev',
    'doctor@agentcare.dev',
    'nurse@agentcare.dev'
);

UPDATE users SET 
    last_login = CURRENT_TIMESTAMP - INTERVAL '1 day'
WHERE email IN (
    'patient@agentcare.dev',
    'receptionist@agentcare.dev'
);

UPDATE users SET 
    last_login = CURRENT_TIMESTAMP - INTERVAL '2 days'
WHERE email IN (
    'specialist@agentcare.dev',
    'np@agentcare.dev',
    'pa@agentcare.dev'
);

-- Insert corresponding providers for healthcare staff
INSERT INTO providers (
    id,
    name,
    specialization,
    license_number,
    email,
    phone,
    office_location,
    bio,
    qualifications,
    availability_schedule,
    consultation_fee,
    is_active,
    created_at,
    updated_at
) VALUES 
-- Dr. Sarah Johnson (Cardiologist)
(
    'p0000000-0000-4000-8000-000000000001',
    'Dr. Sarah Johnson',
    'Cardiology',
    'CA-MD-12345',
    'doctor@agentcare.dev',
    '+1-555-0003',
    'Building A, Floor 3, Room 301',
    'Board-certified cardiologist with 15 years of experience in interventional cardiology and heart failure management.',
    '["MD - Harvard Medical School", "Fellowship - Interventional Cardiology", "Board Certified - American Board of Internal Medicine"]',
    '{
        "monday": {"start": "08:00", "end": "17:00", "lunch": "12:00-13:00"},
        "tuesday": {"start": "08:00", "end": "17:00", "lunch": "12:00-13:00"},
        "wednesday": {"start": "08:00", "end": "17:00", "lunch": "12:00-13:00"},
        "thursday": {"start": "08:00", "end": "17:00", "lunch": "12:00-13:00"},
        "friday": {"start": "08:00", "end": "16:00", "lunch": "12:00-13:00"},
        "saturday": {"available": false},
        "sunday": {"available": false}
    }',
    450.00,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
-- Dr. Michael Chen (Neurologist)
(
    'p0000000-0000-4000-8000-000000000002',
    'Dr. Michael Chen',
    'Neurology',
    'CA-MD-54321',
    'specialist@agentcare.dev',
    '+1-555-0011',
    'Building B, Floor 2, Room 205',
    'Board-certified neurologist specializing in movement disorders, Parkinson\'s disease, and epilepsy treatment.',
    '["MD - Stanford Medical School", "Residency - UCSF Neurology", "Fellowship - Movement Disorders", "Board Certified - American Board of Psychiatry and Neurology"]',
    '{
        "monday": {"start": "09:00", "end": "17:00", "lunch": "12:30-13:30"},
        "tuesday": {"start": "09:00", "end": "17:00", "lunch": "12:30-13:30"},
        "wednesday": {"start": "09:00", "end": "17:00", "lunch": "12:30-13:30"},
        "thursday": {"start": "09:00", "end": "17:00", "lunch": "12:30-13:30"},
        "friday": {"available": false},
        "saturday": {"available": false},
        "sunday": {"available": false}
    }',
    500.00,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
-- Jennifer Wilson (Nurse Practitioner)
(
    'p0000000-0000-4000-8000-000000000003',
    'Jennifer Wilson, NP',
    'Primary Care',
    'CA-NP-11111',
    'np@agentcare.dev',
    '+1-555-0013',
    'Building A, Floor 1, Room 105',
    'Nurse practitioner providing comprehensive primary care services for adults and adolescents.',
    '["MSN - UCLA School of Nursing", "Family Nurse Practitioner Certification", "Board Certified - American Academy of Nurse Practitioners"]',
    '{
        "monday": {"start": "07:30", "end": "16:30", "lunch": "12:00-13:00"},
        "tuesday": {"start": "07:30", "end": "16:30", "lunch": "12:00-13:00"},
        "wednesday": {"start": "07:30", "end": "16:30", "lunch": "12:00-13:00"},
        "thursday": {"start": "07:30", "end": "16:30", "lunch": "12:00-13:00"},
        "friday": {"start": "07:30", "end": "15:30", "lunch": "12:00-13:00"},
        "saturday": {"start": "09:00", "end": "13:00"},
        "sunday": {"available": false}
    }',
    200.00,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
-- David Martinez (Physician Assistant)
(
    'p0000000-0000-4000-8000-000000000004',
    'David Martinez, PA-C',
    'Orthopedics',
    'CA-PA-22222',
    'pa@agentcare.dev',
    '+1-555-0015',
    'Building C, Floor 1, Room 115',
    'Physician assistant specializing in orthopedic care, sports medicine, and injury rehabilitation.',
    '["MS - Physician Assistant Studies", "Orthopedic Medicine Certification", "Sports Medicine Certificate"]',
    '{
        "monday": {"start": "08:00", "end": "17:00", "lunch": "12:00-13:00"},
        "tuesday": {"start": "08:00", "end": "17:00", "lunch": "12:00-13:00"},
        "wednesday": {"start": "08:00", "end": "17:00", "lunch": "12:00-13:00"},
        "thursday": {"start": "08:00", "end": "17:00", "lunch": "12:00-13:00"},
        "friday": {"start": "08:00", "end": "16:00", "lunch": "12:00-13:00"},
        "saturday": {"available": false},
        "sunday": {"available": false}
    }',
    275.00,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Insert sample appointments for demo
INSERT INTO appointments (
    id,
    patient_id,
    provider_id,
    appointment_date,
    duration_minutes,
    appointment_type,
    status,
    chief_complaint,
    notes,
    consultation_fee,
    created_at,
    updated_at,
    metadata
) VALUES 
-- Upcoming appointment
(
    'app00000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000004', -- John Smith
    'p0000000-0000-4000-8000-000000000001', -- Dr. Sarah Johnson
    CURRENT_TIMESTAMP + INTERVAL '2 days' + INTERVAL '10 hours',
    45,
    'follow-up',
    'confirmed',
    'Routine cardiology follow-up',
    'Follow-up for hypertension management',
    450.00,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    '{"reminder_sent": true, "insurance_verified": true}'
),
-- Recent completed appointment
(
    'app00000-0000-4000-8000-000000000002',
    'a0000000-0000-4000-8000-000000000010', -- Mary Smith
    'p0000000-0000-4000-8000-000000000003', -- Jennifer Wilson, NP
    CURRENT_TIMESTAMP - INTERVAL '3 days',
    30,
    'consultation',
    'completed',
    'Annual physical exam',
    'Completed annual physical, all vitals normal',
    200.00,
    CURRENT_TIMESTAMP - INTERVAL '4 days',
    CURRENT_TIMESTAMP - INTERVAL '3 days',
    '{"lab_orders": ["CBC", "CMP"], "follow_up_needed": false}'
);

-- Insert system configuration for demo environment
INSERT INTO system_config (
    key,
    value,
    description,
    is_sensitive,
    environment
) VALUES 
(
    'demo_mode',
    'true',
    'Enable demo mode with sample data and relaxed security',
    false,
    'development'
),
(
    'demo_credentials_enabled',
    'true',
    'Allow demo credentials for testing',
    false,
    'development'
),
(
    'auto_seed_demo_data',
    'true',
    'Automatically seed demo data on startup',
    false,
    'development'
),
(
    'demo_password_expiry',
    'false',
    'Disable password expiry for demo accounts',
    false,
    'development'
);

-- Set demo-specific permissions
UPDATE users SET 
    failed_login_attempts = 0,
    locked_until = NULL,
    password_reset_token = NULL,
    password_reset_expires = NULL
WHERE email LIKE '%@agentcare.dev';

COMMIT; 