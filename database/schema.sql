-- AgentCare Database Schema
-- HIPAA-compliant healthcare scheduling system
-- PostgreSQL 15+ compatible

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create schema for audit logging
CREATE SCHEMA IF NOT EXISTS audit;

-- Users table with HIPAA compliance
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(20),
    address JSONB,
    emergency_contact JSONB,
    medical_record_number VARCHAR(50) UNIQUE,
    insurance_info JSONB,
    preferences JSONB DEFAULT '{}',
    profile JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP WITH TIME ZONE,
    verification_token VARCHAR(255),
    verification_expires TIMESTAMP WITH TIME ZONE
);

-- Sessions table for user authentication
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'
);

-- Healthcare providers/doctors
CREATE TABLE IF NOT EXISTS providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    specialization VARCHAR(255) NOT NULL,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    office_location VARCHAR(255),
    bio TEXT,
    qualifications JSONB DEFAULT '[]',
    availability_schedule JSONB DEFAULT '{}',
    consultation_fee DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES providers(id),
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    appointment_type VARCHAR(100) NOT NULL, -- consultation, follow-up, emergency, etc.
    status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, confirmed, in-progress, completed, cancelled, no-show
    chief_complaint TEXT,
    notes TEXT,
    consultation_fee DECIMAL(10,2),
    insurance_claim_number VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    reminded_at TIMESTAMP WITH TIME ZONE[],
    metadata JSONB DEFAULT '{}'
);

-- Conversation history for AI agents
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    agent_type VARCHAR(50) NOT NULL, -- supervisor, booking, availability, faq
    message_role VARCHAR(20) NOT NULL, -- user, assistant, system
    message_content TEXT NOT NULL,
    intent_analysis JSONB,
    response_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    conversation_context JSONB DEFAULT '{}',
    entities JSONB DEFAULT '{}',
    sentiment_score DECIMAL(3,2),
    processed_by_llm BOOLEAN DEFAULT false,
    llm_model VARCHAR(100),
    tokens_used INTEGER
);

-- Medical records (encrypted)
CREATE TABLE IF NOT EXISTS medical_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES providers(id),
    appointment_id UUID REFERENCES appointments(id),
    record_type VARCHAR(100) NOT NULL, -- diagnosis, prescription, lab_result, note
    title VARCHAR(255) NOT NULL,
    content TEXT, -- Encrypted in production
    diagnosis_codes JSONB DEFAULT '[]', -- ICD-10 codes
    medication_codes JSONB DEFAULT '[]', -- RxNorm codes
    lab_values JSONB DEFAULT '{}',
    attachments JSONB DEFAULT '[]',
    is_confidential BOOLEAN DEFAULT true,
    access_level VARCHAR(50) DEFAULT 'restricted',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES providers(id),
    digital_signature TEXT,
    checksum VARCHAR(255)
);

-- Audit log table for HIPAA compliance
CREATE TABLE IF NOT EXISTS audit.access_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    session_id UUID REFERENCES sessions(id),
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID,
    action VARCHAR(100) NOT NULL, -- create, read, update, delete, access
    ip_address INET,
    user_agent TEXT,
    access_granted BOOLEAN NOT NULL,
    denial_reason TEXT,
    data_accessed JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    request_id UUID,
    additional_metadata JSONB DEFAULT '{}'
);

-- Notification preferences and history
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL, -- appointment_reminder, cancellation, confirmation, etc.
    channel VARCHAR(50) NOT NULL, -- email, sms, push, in_app
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    content TEXT NOT NULL,
    template_id VARCHAR(100),
    template_variables JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'pending', -- pending, sent, delivered, failed, bounced
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    scheduled_for TIMESTAMP WITH TIME ZONE,
    retry_count INTEGER DEFAULT 0,
    error_message TEXT,
    external_id VARCHAR(255),
    metadata JSONB DEFAULT '{}'
);

-- System configuration and feature flags
CREATE TABLE IF NOT EXISTS system_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    is_sensitive BOOLEAN DEFAULT false,
    environment VARCHAR(50) DEFAULT 'production',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_medical_record_number ON users(medical_record_number);
CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_provider_id ON appointments(provider_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit.access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit.access_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON providers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON medical_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_config_updated_at BEFORE UPDATE ON system_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) for HIPAA compliance
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (extend based on application requirements)
CREATE POLICY users_own_data ON users
    USING (id = current_setting('app.current_user_id')::UUID);

CREATE POLICY medical_records_patient_access ON medical_records
    USING (patient_id = current_setting('app.current_user_id')::UUID);

CREATE POLICY appointments_patient_access ON appointments
    USING (patient_id = current_setting('app.current_user_id')::UUID);

-- Grant permissions
GRANT USAGE ON SCHEMA audit TO agentcare_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO agentcare_user;
GRANT SELECT, INSERT ON ALL TABLES IN SCHEMA audit TO agentcare_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO agentcare_user;

-- Initial system configuration
INSERT INTO system_config (key, value, description) VALUES
('app.version', '"2.0.0-alpha"', 'Application version'),
('features.llm_enabled', 'true', 'Enable Ollama LLM integration'),
('features.rag_enabled', 'true', 'Enable RAG system for context'),
('features.notifications_enabled', 'true', 'Enable notification system'),
('hipaa.audit_retention_days', '2555', 'HIPAA audit log retention period (7 years)'),
('security.session_timeout_minutes', '60', 'Session timeout in minutes'),
('security.max_failed_login_attempts', '5', 'Maximum failed login attempts before lockout'),
('appointments.default_duration_minutes', '30', 'Default appointment duration'),
('appointments.booking_advance_days', '90', 'Maximum days in advance for booking'),
('notifications.reminder_hours_before', '[24, 2]', 'Hours before appointment to send reminders')
ON CONFLICT (key) DO NOTHING; 