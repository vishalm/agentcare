-- AgentCare Sample Healthcare Providers
-- Initial seed data for testing and development

INSERT INTO providers (id, name, specialization, license_number, email, phone, office_location, bio, qualifications, availability_schedule, consultation_fee, is_active) VALUES

-- General Medicine
(
    '550e8400-e29b-41d4-a716-446655440001',
    'Dr. Sarah Johnson',
    'Family Medicine',
    'FM12345',
    'dr.sarah.johnson@agentcare.dev',
    '+1-555-0101',
    'Building A, Floor 1',
    'Dr. Johnson is a board-certified family physician with over 15 years of experience in primary care.',
    '["MD from Johns Hopkins University", "Board Certified in Family Medicine", "American Academy of Family Physicians"]',
    '{
        "monday": {"start": "09:00", "end": "17:00", "breaks": [{"start": "12:00", "end": "13:00"}]},
        "tuesday": {"start": "09:00", "end": "17:00", "breaks": [{"start": "12:00", "end": "13:00"}]},
        "wednesday": {"start": "09:00", "end": "17:00", "breaks": [{"start": "12:00", "end": "13:00"}]},
        "thursday": {"start": "09:00", "end": "17:00", "breaks": [{"start": "12:00", "end": "13:00"}]},
        "friday": {"start": "09:00", "end": "15:00", "breaks": [{"start": "12:00", "end": "13:00"}]}
    }',
    150.00,
    true
),

-- Cardiology
(
    '550e8400-e29b-41d4-a716-446655440002',
    'Dr. Michael Chen',
    'Cardiology',
    'CD67890',
    'dr.michael.chen@agentcare.dev',
    '+1-555-0102',
    'Building B, Floor 3',
    'Dr. Chen specializes in interventional cardiology with expertise in cardiac catheterization and angioplasty.',
    '["MD from Stanford University", "Fellowship in Interventional Cardiology", "American College of Cardiology"]',
    '{
        "monday": {"start": "08:00", "end": "16:00", "breaks": [{"start": "12:00", "end": "13:00"}]},
        "tuesday": {"start": "08:00", "end": "16:00", "breaks": [{"start": "12:00", "end": "13:00"}]},
        "wednesday": {"start": "08:00", "end": "16:00", "breaks": [{"start": "12:00", "end": "13:00"}]},
        "thursday": {"start": "08:00", "end": "16:00", "breaks": [{"start": "12:00", "end": "13:00"}]},
        "friday": {"start": "08:00", "end": "14:00", "breaks": [{"start": "12:00", "end": "13:00"}]}
    }',
    300.00,
    true
),

-- Dermatology
(
    '550e8400-e29b-41d4-a716-446655440003',
    'Dr. Emily Rodriguez',
    'Dermatology',
    'DR11111',
    'dr.emily.rodriguez@agentcare.dev',
    '+1-555-0103',
    'Building A, Floor 2',
    'Dr. Rodriguez is a dermatologist specializing in both medical and cosmetic dermatology procedures.',
    '["MD from UCLA", "Dermatology Residency at UCSF", "American Academy of Dermatology"]',
    '{
        "monday": {"start": "10:00", "end": "18:00", "breaks": [{"start": "13:00", "end": "14:00"}]},
        "tuesday": {"start": "10:00", "end": "18:00", "breaks": [{"start": "13:00", "end": "14:00"}]},
        "wednesday": {"start": "10:00", "end": "18:00", "breaks": [{"start": "13:00", "end": "14:00"}]},
        "thursday": {"start": "10:00", "end": "18:00", "breaks": [{"start": "13:00", "end": "14:00"}]},
        "friday": {"start": "10:00", "end": "16:00", "breaks": [{"start": "13:00", "end": "14:00"}]}
    }',
    250.00,
    true
),

-- Pediatrics
(
    '550e8400-e29b-41d4-a716-446655440004',
    'Dr. David Kim',
    'Pediatrics',
    'PD22222',
    'dr.david.kim@agentcare.dev',
    '+1-555-0104',
    'Building C, Floor 1',
    'Dr. Kim is a pediatrician with special interest in developmental pediatrics and childhood nutrition.',
    '["MD from Harvard Medical School", "Pediatric Residency at Boston Children\'s Hospital", "American Academy of Pediatrics"]',
    '{
        "monday": {"start": "08:30", "end": "17:30", "breaks": [{"start": "12:30", "end": "13:30"}]},
        "tuesday": {"start": "08:30", "end": "17:30", "breaks": [{"start": "12:30", "end": "13:30"}]},
        "wednesday": {"start": "08:30", "end": "17:30", "breaks": [{"start": "12:30", "end": "13:30"}]},
        "thursday": {"start": "08:30", "end": "17:30", "breaks": [{"start": "12:30", "end": "13:30"}]},
        "friday": {"start": "08:30", "end": "15:30", "breaks": [{"start": "12:30", "end": "13:30"}]}
    }',
    180.00,
    true
),

-- Orthopedics
(
    '550e8400-e29b-41d4-a716-446655440005',
    'Dr. Jennifer Williams',
    'Orthopedic Surgery',
    'OS33333',
    'dr.jennifer.williams@agentcare.dev',
    '+1-555-0105',
    'Building B, Floor 2',
    'Dr. Williams is an orthopedic surgeon specializing in sports medicine and joint replacement surgery.',
    '["MD from Mayo Clinic", "Orthopedic Surgery Residency", "Sports Medicine Fellowship", "American Academy of Orthopedic Surgeons"]',
    '{
        "monday": {"start": "07:00", "end": "15:00", "breaks": [{"start": "12:00", "end": "13:00"}]},
        "tuesday": {"start": "07:00", "end": "15:00", "breaks": [{"start": "12:00", "end": "13:00"}]},
        "wednesday": {"start": "07:00", "end": "15:00", "breaks": [{"start": "12:00", "end": "13:00"}]},
        "thursday": {"start": "07:00", "end": "15:00", "breaks": [{"start": "12:00", "end": "13:00"}]},
        "friday": {"start": "07:00", "end": "13:00", "breaks": []}
    }',
    350.00,
    true
),

-- Psychiatry
(
    '550e8400-e29b-41d4-a716-446655440006',
    'Dr. Robert Thompson',
    'Psychiatry',
    'PS44444',
    'dr.robert.thompson@agentcare.dev',
    '+1-555-0106',
    'Building A, Floor 3',
    'Dr. Thompson is a psychiatrist with expertise in anxiety disorders, depression, and cognitive behavioral therapy.',
    '["MD from Columbia University", "Psychiatry Residency at NYU", "American Psychiatric Association"]',
    '{
        "monday": {"start": "09:00", "end": "17:00", "breaks": [{"start": "12:00", "end": "13:00"}]},
        "tuesday": {"start": "09:00", "end": "17:00", "breaks": [{"start": "12:00", "end": "13:00"}]},
        "wednesday": {"start": "09:00", "end": "17:00", "breaks": [{"start": "12:00", "end": "13:00"}]},
        "thursday": {"start": "09:00", "end": "17:00", "breaks": [{"start": "12:00", "end": "13:00"}]},
        "friday": {"start": "09:00", "end": "15:00", "breaks": [{"start": "12:00", "end": "13:00"}]}
    }',
    200.00,
    true
),

-- Emergency Medicine
(
    '550e8400-e29b-41d4-a716-446655440007',
    'Dr. Lisa Park',
    'Emergency Medicine',
    'EM55555',
    'dr.lisa.park@agentcare.dev',
    '+1-555-0107',
    'Emergency Department',
    'Dr. Park is an emergency medicine physician with extensive experience in trauma care and critical care medicine.',
    '["MD from University of Chicago", "Emergency Medicine Residency", "American Board of Emergency Medicine"]',
    '{
        "monday": {"start": "00:00", "end": "23:59", "shifts": ["day", "night"]},
        "tuesday": {"start": "00:00", "end": "23:59", "shifts": ["day", "night"]},
        "wednesday": {"start": "00:00", "end": "23:59", "shifts": ["day", "night"]},
        "thursday": {"start": "00:00", "end": "23:59", "shifts": ["day", "night"]},
        "friday": {"start": "00:00", "end": "23:59", "shifts": ["day", "night"]},
        "saturday": {"start": "00:00", "end": "23:59", "shifts": ["day", "night"]},
        "sunday": {"start": "00:00", "end": "23:59", "shifts": ["day", "night"]}
    }',
    400.00,
    true
),

-- Neurology
(
    '550e8400-e29b-41d4-a716-446655440008',
    'Dr. Ahmed Hassan',
    'Neurology',
    'NR66666',
    'dr.ahmed.hassan@agentcare.dev',
    '+1-555-0108',
    'Building C, Floor 3',
    'Dr. Hassan is a neurologist specializing in movement disorders, epilepsy, and neurodegenerative diseases.',
    '["MD from University of Pennsylvania", "Neurology Residency at Johns Hopkins", "Movement Disorders Fellowship"]',
    '{
        "monday": {"start": "08:00", "end": "16:00", "breaks": [{"start": "12:00", "end": "13:00"}]},
        "tuesday": {"start": "08:00", "end": "16:00", "breaks": [{"start": "12:00", "end": "13:00"}]},
        "wednesday": {"start": "08:00", "end": "16:00", "breaks": [{"start": "12:00", "end": "13:00"}]},
        "thursday": {"start": "08:00", "end": "16:00", "breaks": [{"start": "12:00", "end": "13:00"}]},
        "friday": {"start": "08:00", "end": "14:00", "breaks": [{"start": "12:00", "end": "13:00"}]}
    }',
    320.00,
    true
); 