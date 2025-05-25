import { config } from 'dotenv';
import * as path from 'path';

/**
 * Global setup for Jest tests
 * Runs once before all test suites
 */
export default async function globalSetup(): Promise<void> {
  console.log('🧪 Setting up global test environment...');

  // Load test environment variables
  config({ 
    path: path.resolve(process.cwd(), '.env.test'),
    override: true 
  });

  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'error';
  process.env.DB_LOGGING = 'false';

  // Override sensitive settings for testing
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
  process.env.SESSION_SECRET = 'test-session-secret-for-testing-only';
  process.env.PASSWORD_SALT_ROUNDS = '4'; // Lower for faster tests

  // Database settings for testing
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/agentcare_test';
  process.env.REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379/1';

  // Disable external services in tests
  process.env.ENABLE_OLLAMA_LLM = 'false';
  process.env.ENABLE_SMS_NOTIFICATIONS = 'false';
  process.env.ENABLE_EMAIL_REMINDERS = 'false';

  // Test-specific configurations
  process.env.API_RATE_LIMIT = '1000';
  process.env.API_RATE_WINDOW = '60000';
  process.env.TEST_TIMEOUT = '30000';

  // Healthcare compliance settings for testing
  process.env.HIPAA_LOGGING = 'false';
  process.env.AUDIT_LOG_RETENTION_DAYS = '1';

  // Mock external service URLs
  process.env.OLLAMA_BASE_URL = 'http://localhost:11434';
  process.env.MAIL_HOST = 'smtp.test.local';
  process.env.TWILIO_ACCOUNT_SID = 'test_twilio_sid';

  console.log('✅ Global test environment setup completed');
} 