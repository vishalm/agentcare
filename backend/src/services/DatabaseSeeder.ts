import * as fs from 'fs';
import * as path from 'path';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import { Logger } from '../utils/Logger';
import { Config } from '../utils/Config';

export interface DemoUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
  phone?: string;
  department?: string;
  bio?: string;
  theme?: string;
  permissions?: string[];
}

export interface SeederOptions {
  forceRecreate?: boolean;
  seedDemoData?: boolean;
  verbose?: boolean;
}

export class DatabaseSeeder {
  private logger: Logger;
  private config: Config;
  private dbPool: Pool | null = null;

  constructor() {
    this.logger = new Logger();
    this.config = Config.getInstance();
  }

  /**
   * Initialize database connection
   */
  private async initializeConnection(): Promise<void> {
    if (!this.dbPool) {
      this.dbPool = new Pool({
        host: this.config.get('DB_HOST', 'localhost'),
        port: this.config.getNumber('DB_PORT', 5432),
        database: this.config.get('DB_NAME', 'agentcare'),
        user: this.config.get('DB_USER', 'agentcare_user'),
        password: this.config.get('DB_PASSWORD', 'agentcare_pass'),
        max: 5,
        connectionTimeoutMillis: 5000,
      });
    }
  }

  /**
   * Close database connection
   */
  private async closeConnection(): Promise<void> {
    if (this.dbPool) {
      await this.dbPool.end();
      this.dbPool = null;
    }
  }

  /**
   * Execute SQL file
   */
  private async executeSqlFile(filePath: string): Promise<void> {
    if (!this.dbPool) {
      throw new Error('Database connection not initialized');
    }

    const fullPath = path.resolve(filePath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`SQL file not found: ${fullPath}`);
    }

    const sql = fs.readFileSync(fullPath, 'utf8');
    
    this.logger.info(`Executing SQL file: ${filePath}`);
    
    try {
      await this.dbPool.query(sql);
      this.logger.info(`Successfully executed: ${filePath}`);
    } catch (error) {
      this.logger.error(`Failed to execute SQL file: ${filePath}`, { error });
      throw error;
    }
  }

  /**
   * Check if database is properly initialized
   */
  private async isDatabaseInitialized(): Promise<boolean> {
    if (!this.dbPool) {
      throw new Error('Database connection not initialized');
    }

    try {
      const result = await this.dbPool.query(`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      
      const tableCount = parseInt(result.rows[0].count);
      return tableCount > 0;
    } catch (error) {
      this.logger.error('Error checking database initialization', { error });
      return false;
    }
  }

  /**
   * Check if demo data exists
   */
  private async hasDemoData(): Promise<boolean> {
    if (!this.dbPool) {
      throw new Error('Database connection not initialized');
    }

    try {
      const result = await this.dbPool.query(`
        SELECT COUNT(*) as count 
        FROM users 
        WHERE email LIKE '%@agentcare.dev'
      `);
      
      const demoUserCount = parseInt(result.rows[0].count);
      return demoUserCount > 0;
    } catch (error) {
      this.logger.error('Error checking demo data', { error });
      return false;
    }
  }

  /**
   * Initialize database schema
   */
  private async initializeSchema(forceRecreate: boolean = false): Promise<void> {
    const isInitialized = await this.isDatabaseInitialized();
    
    if (isInitialized && !forceRecreate) {
      this.logger.info('Database schema already exists');
      return;
    }

    if (forceRecreate && isInitialized) {
      this.logger.warn('Force recreating database schema');
      await this.dropAllTables();
    }

    // Apply main schema
    await this.executeSqlFile('database/schema.sql');

    // Apply any migrations
    await this.applyMigrations();
  }

  /**
   * Drop all tables (for recreate)
   */
  private async dropAllTables(): Promise<void> {
    if (!this.dbPool) {
      throw new Error('Database connection not initialized');
    }

    this.logger.warn('Dropping all database tables');
    
    await this.dbPool.query(`
      DROP SCHEMA IF EXISTS audit CASCADE;
      DROP TABLE IF EXISTS notifications CASCADE;
      DROP TABLE IF EXISTS medical_records CASCADE;
      DROP TABLE IF EXISTS conversations CASCADE;
      DROP TABLE IF EXISTS appointments CASCADE;
      DROP TABLE IF EXISTS providers CASCADE;
      DROP TABLE IF EXISTS sessions CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS system_config CASCADE;
    `);
  }

  /**
   * Apply database migrations
   */
  private async applyMigrations(): Promise<void> {
    const migrationsDir = path.resolve('database/migrations');
    
    if (!fs.existsSync(migrationsDir)) {
      this.logger.info('No migrations directory found');
      return;
    }

    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      await this.executeSqlFile(filePath);
    }
  }

  /**
   * Seed demo data from SQL files
   */
  private async seedFromFiles(): Promise<void> {
    const seedsDir = path.resolve('database/seeds');
    
    if (!fs.existsSync(seedsDir)) {
      this.logger.warn('No seeds directory found');
      return;
    }

    const seedFiles = fs.readdirSync(seedsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    for (const file of seedFiles) {
      const filePath = path.join(seedsDir, file);
      await this.executeSqlFile(filePath);
    }
  }

  /**
   * Create demo users programmatically
   */
  private async createDemoUsers(): Promise<void> {
    if (!this.dbPool) {
      throw new Error('Database connection not initialized');
    }

    const password = 'AgentCare2024!';
    const passwordHash = await bcrypt.hash(password, 12);

    const demoUsers: DemoUser[] = [
      {
        id: 'a0000000-0000-4000-8000-000000000001',
        email: 'admin@agentcare.dev',
        password: passwordHash,
        name: 'System Administrator',
        role: 'admin',
        phone: '+1-555-0001',
        department: 'IT',
        bio: 'System administrator with full access to AgentCare platform',
        theme: 'admin',
        permissions: ['admin', 'user_management', 'system_settings']
      },
      {
        id: 'a0000000-0000-4000-8000-000000000002',
        email: 'doctor@agentcare.dev',
        password: passwordHash,
        name: 'Dr. Sarah Johnson',
        role: 'doctor',
        phone: '+1-555-0003',
        department: 'Cardiology',
        bio: 'Board-certified cardiologist with 15 years of experience',
        theme: 'doctor',
        permissions: ['patient_access', 'appointment_management', 'medical_records']
      },
      {
        id: 'a0000000-0000-4000-8000-000000000003',
        email: 'nurse@agentcare.dev',
        password: passwordHash,
        name: 'Alice Brown, RN',
        role: 'nurse',
        phone: '+1-555-0005',
        department: 'Emergency',
        bio: 'Registered nurse specializing in emergency care',
        theme: 'nurse',
        permissions: ['patient_access', 'basic_records', 'medication_admin']
      },
      {
        id: 'a0000000-0000-4000-8000-000000000004',
        email: 'patient@agentcare.dev',
        password: passwordHash,
        name: 'John Smith',
        role: 'patient',
        phone: '+1-555-0007',
        bio: 'Regular patient with managed hypertension',
        theme: 'patient',
        permissions: ['self_access']
      },
      {
        id: 'a0000000-0000-4000-8000-000000000005',
        email: 'receptionist@agentcare.dev',
        password: passwordHash,
        name: 'Maria Garcia',
        role: 'receptionist',
        phone: '+1-555-0009',
        department: 'Front Desk',
        bio: 'Bilingual front desk coordinator with excellent customer service skills',
        theme: 'receptionist',
        permissions: ['appointment_scheduling', 'patient_checkin', 'basic_info']
      }
    ];

    for (const user of demoUsers) {
      await this.insertDemoUser(user);
    }

    this.logger.info(`Created ${demoUsers.length} demo users`);
  }

  /**
   * Insert a single demo user
   */
  private async insertDemoUser(user: DemoUser): Promise<void> {
    if (!this.dbPool) {
      throw new Error('Database connection not initialized');
    }

    const query = `
      INSERT INTO users (
        id, email, password_hash, name, phone, 
        preferences, profile, is_active, email_verified, phone_verified,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        preferences = EXCLUDED.preferences,
        profile = EXCLUDED.profile,
        updated_at = CURRENT_TIMESTAMP
    `;

    const preferences = {
      theme: user.theme || user.role,
      language: 'en',
      notifications: true,
      timezone: 'America/Los_Angeles'
    };

    const profile = {
      role: user.role,
      department: user.department,
      permissions: user.permissions || [],
      bio: user.bio
    };

    const values = [
      user.id,
      user.email,
      user.password,
      user.name,
      user.phone,
      JSON.stringify(preferences),
      JSON.stringify(profile),
      true, // is_active
      true, // email_verified
      true, // phone_verified
      new Date(), // created_at
      new Date()  // updated_at
    ];

    try {
      await this.dbPool.query(query, values);
      this.logger.info(`Created demo user: ${user.email}`);
    } catch (error) {
      this.logger.error(`Failed to create demo user: ${user.email}`, { error });
      throw error;
    }
  }

  /**
   * Set system configuration for demo mode
   */
  private async configureDemoMode(): Promise<void> {
    if (!this.dbPool) {
      throw new Error('Database connection not initialized');
    }

    const configs = [
      { key: 'demo_mode', value: 'true', description: 'Enable demo mode with sample data' },
      { key: 'demo_credentials_enabled', value: 'true', description: 'Allow demo credentials for testing' },
      { key: 'auto_seed_demo_data', value: 'true', description: 'Automatically seed demo data on startup' },
      { key: 'demo_password_expiry', value: 'false', description: 'Disable password expiry for demo accounts' }
    ];

    for (const config of configs) {
      const query = `
        INSERT INTO system_config (key, value, description, is_sensitive, environment)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (key) DO UPDATE SET
          value = EXCLUDED.value,
          description = EXCLUDED.description,
          updated_at = CURRENT_TIMESTAMP
      `;

      await this.dbPool.query(query, [
        config.key,
        JSON.stringify(config.value),
        config.description,
        false,
        'development'
      ]);
    }

    this.logger.info('Configured demo mode settings');
  }

  /**
   * Get database statistics
   */
  public async getStatistics(): Promise<Record<string, number>> {
    if (!this.dbPool) {
      await this.initializeConnection();
    }

    const stats: Record<string, number> = {};

    try {
      const tables = ['users', 'providers', 'appointments', 'conversations', 'sessions'];
      
      for (const table of tables) {
        try {
          const result = await this.dbPool!.query(`SELECT COUNT(*) as count FROM ${table}`);
          stats[table] = parseInt(result.rows[0].count);
        } catch (error) {
          stats[table] = 0;
        }
      }

      return stats;
    } catch (error) {
      this.logger.error('Error getting database statistics', { error });
      return stats;
    }
  }

  /**
   * Main seeding method
   */
  public async seed(options: SeederOptions = {}): Promise<void> {
    const {
      forceRecreate = false,
      seedDemoData = true,
      verbose = false
    } = options;

    if (verbose) {
      // this.logger.setLevel('debug'); // Not available in current Logger implementation
    }

    this.logger.info('Starting database seeding process', { options });

    try {
      await this.initializeConnection();

      // Initialize schema
      await this.initializeSchema(forceRecreate);

      // Seed demo data if requested
      if (seedDemoData) {
        const hasDemoData = await this.hasDemoData();
        
        if (!hasDemoData || forceRecreate) {
          this.logger.info('Seeding demo data...');
          
          // Try to seed from SQL files first
          try {
            await this.seedFromFiles();
          } catch (error) {
            this.logger.warn('SQL file seeding failed, using programmatic approach', { error });
            await this.createDemoUsers();
          }

          await this.configureDemoMode();
        } else {
          this.logger.info('Demo data already exists');
        }
      }

      // Get final statistics
      const stats = await this.getStatistics();
      this.logger.info('Database seeding completed', { stats });

    } catch (error) {
      this.logger.error('Database seeding failed', { error });
      throw error;
    } finally {
      await this.closeConnection();
    }
  }

  /**
   * Reset database (drop and recreate)
   */
  public async reset(): Promise<void> {
    this.logger.warn('Resetting database - all data will be lost!');
    await this.seed({ forceRecreate: true, seedDemoData: true });
  }

  /**
   * Check if seeding is needed
   */
  public async isSeededWithDemoData(): Promise<boolean> {
    try {
      await this.initializeConnection();
      return await this.hasDemoData();
    } catch (error) {
      this.logger.error('Error checking if database is seeded', { error });
      return false;
    } finally {
      await this.closeConnection();
    }
  }
}

// Export singleton instance
export const databaseSeeder = new DatabaseSeeder(); 