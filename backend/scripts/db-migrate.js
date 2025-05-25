#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colors for output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// Configuration from environment variables
const config = {
  DB_NAME: process.env.DB_NAME || 'agentcare',
  DB_USER: process.env.DB_USER || 'agentcare_user',
  DB_PASSWORD: process.env.DB_PASSWORD || 'agentcare_pass',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT || '5432',
  POSTGRES_USER: process.env.POSTGRES_USER || 'postgres',
  FORCE_RECREATE: process.env.FORCE_RECREATE === 'true',
  SEED_DEMO_DATA: process.env.SEED_DEMO_DATA !== 'false'
};

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  forceRecreate: args.includes('--force-recreate') || config.FORCE_RECREATE,
  noDemoData: args.includes('--no-demo-data'),
  help: args.includes('--help')
};

if (options.noDemoData) {
  config.SEED_DEMO_DATA = false;
}

function printMessage(color, message) {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
}

function printInfo(message) {
  printMessage(colors.blue, `INFO: ${message}`);
}

function printSuccess(message) {
  printMessage(colors.green, `SUCCESS: ${message}`);
}

function printWarning(message) {
  printMessage(colors.yellow, `WARNING: ${message}`);
}

function printError(message) {
  printMessage(colors.red, `ERROR: ${message}`);
}

function showUsage() {
  console.log('Usage: node db-migrate.js [OPTIONS]');
  console.log('');
  console.log('AgentCare Backend Database Migration Script');
  console.log('');
  console.log('OPTIONS:');
  console.log('  --force-recreate    Drop and recreate database');
  console.log('  --no-demo-data     Skip seeding demo data');
  console.log('  --help             Show this help message');
  console.log('');
  console.log('ENVIRONMENT VARIABLES:');
  console.log('  DB_NAME            Database name (default: agentcare)');
  console.log('  DB_USER            Database user (default: agentcare_user)');
  console.log('  DB_PASSWORD        Database password (default: agentcare_pass)');
  console.log('  DB_HOST            Database host (default: localhost)');
  console.log('  DB_PORT            Database port (default: 5432)');
  console.log('  POSTGRES_USER      PostgreSQL admin user (default: postgres)');
  console.log('  FORCE_RECREATE     Force recreate database (default: false)');
  console.log('  SEED_DEMO_DATA     Seed demo data (default: true)');
}

function execCommand(command, description) {
  try {
    const result = execSync(command, { stdio: 'pipe' });
    return true;
  } catch (error) {
    printError(`Failed to ${description}: ${error.message}`);
    if (error.stderr) {
      printError(`STDERR: ${error.stderr.toString()}`);
    }
    if (error.stdout) {
      printError(`STDOUT: ${error.stdout.toString()}`);
    }
    return false;
  }
}

function checkPostgres() {
  printInfo('Checking PostgreSQL connection...');
  
  // Check if psql is available
  try {
    execSync('which psql', { stdio: 'pipe' });
  } catch (error) {
    printError('PostgreSQL client (psql) not found. Please install PostgreSQL.');
    process.exit(1);
  }
  
  // Check if PostgreSQL is running
  const checkCmd = `pg_isready -h ${config.DB_HOST} -p ${config.DB_PORT} -U ${config.POSTGRES_USER}`;
  if (!execCommand(checkCmd, 'check PostgreSQL connection')) {
    printError(`Cannot connect to PostgreSQL at ${config.DB_HOST}:${config.DB_PORT}`);
    printInfo('Please ensure PostgreSQL is running and accessible.');
    printInfo('You can start PostgreSQL with: brew services start postgresql');
    process.exit(1);
  }
  
  printSuccess('PostgreSQL is running and accessible');
}

function setupDatabase() {
  printInfo('Setting up database and user...');
  
  // Check if database exists
  const checkDbCmd = `psql -h ${config.DB_HOST} -p ${config.DB_PORT} -U ${config.POSTGRES_USER} -tAc "SELECT 1 FROM pg_database WHERE datname='${config.DB_NAME}';"`;
  let dbExists = false;
  
  try {
    const result = execSync(checkDbCmd, { stdio: 'pipe' }).toString().trim();
    dbExists = result === '1';
  } catch (error) {
    // Database doesn't exist or connection failed
  }
  
  if (dbExists && options.forceRecreate) {
    printWarning(`Database '${config.DB_NAME}' exists. Recreating...`);
    execCommand(`psql -h ${config.DB_HOST} -p ${config.DB_PORT} -U ${config.POSTGRES_USER} -c "DROP DATABASE IF EXISTS ${config.DB_NAME};"`, 'drop database');
    execCommand(`psql -h ${config.DB_HOST} -p ${config.DB_PORT} -U ${config.POSTGRES_USER} -c "DROP USER IF EXISTS ${config.DB_USER};"`, 'drop user');
    dbExists = false;
  }
  
  if (!dbExists) {
    printInfo(`Creating database user '${config.DB_USER}'...`);
    execCommand(`psql -h ${config.DB_HOST} -p ${config.DB_PORT} -U ${config.POSTGRES_USER} -c "CREATE USER ${config.DB_USER} WITH PASSWORD '${config.DB_PASSWORD}';"`, 'create user');
    
    printInfo(`Creating database '${config.DB_NAME}'...`);
    execCommand(`psql -h ${config.DB_HOST} -p ${config.DB_PORT} -U ${config.POSTGRES_USER} -c "CREATE DATABASE ${config.DB_NAME} OWNER ${config.DB_USER};"`, 'create database');
    
    printInfo('Granting privileges...');
    execCommand(`psql -h ${config.DB_HOST} -p ${config.DB_PORT} -U ${config.POSTGRES_USER} -c "GRANT ALL PRIVILEGES ON DATABASE ${config.DB_NAME} TO ${config.DB_USER};"`, 'grant database privileges');
    execCommand(`psql -h ${config.DB_HOST} -p ${config.DB_PORT} -U ${config.POSTGRES_USER} -d ${config.DB_NAME} -c "GRANT ALL ON SCHEMA public TO ${config.DB_USER};"`, 'grant schema privileges');
    
    printSuccess('Database and user created successfully');
  } else {
    printInfo(`Database '${config.DB_NAME}' already exists`);
  }
}

function runSqlFile(filePath, description) {
  if (!existsSync(filePath)) {
    printWarning(`${description} file not found: ${filePath}`);
    return false;
  }
  
  printInfo(`Running ${description}...`);
  const cmd = `PGPASSWORD="${config.DB_PASSWORD}" psql -h ${config.DB_HOST} -p ${config.DB_PORT} -U ${config.DB_USER} -d ${config.DB_NAME} -f "${filePath}"`;
  
  if (execCommand(cmd, description)) {
    printSuccess(`${description} completed`);
    return true;
  }
  return false;
}

function applySchema() {
  printInfo('Applying database schema...');
  
  // Check if tables already exist
  const checkTablesCmd = `PGPASSWORD="${config.DB_PASSWORD}" psql -h ${config.DB_HOST} -p ${config.DB_PORT} -U ${config.DB_USER} -d ${config.DB_NAME} -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"`;
  
  let tableCount = 0;
  try {
    tableCount = parseInt(execSync(checkTablesCmd, { stdio: 'pipe' }).toString().trim());
  } catch (error) {
    // Assume no tables exist
  }
  
  if (tableCount > 0 && !options.forceRecreate) {
    printWarning('Database tables already exist. Use --force-recreate to recreate.');
    return;
  }
  
  // Try to find schema file
  const schemaPath = join(__dirname, '../../database/schema.sql');
  runSqlFile(schemaPath, 'schema creation');
}

function runMigrations() {
  printInfo('Running database migrations...');
  
  const migrationsDir = join(__dirname, '../../database/migrations');
  if (!existsSync(migrationsDir)) {
    printInfo('No migrations directory found');
    return;
  }
  
  try {
    const files = readdirSync(migrationsDir).filter(file => file.endsWith('.sql')).sort();
    
    for (const file of files) {
      const migrationPath = join(migrationsDir, file);
      runSqlFile(migrationPath, `migration ${file}`);
    }
  } catch (error) {
    printWarning('Could not read migrations directory');
  }
}

function seedDemoData() {
  if (!config.SEED_DEMO_DATA) {
    printInfo('Skipping demo data seeding (SEED_DEMO_DATA=false)');
    return;
  }
  
  printInfo('Seeding demo data...');
  
  const seedsDir = join(__dirname, '../../database/seeds');
  if (!existsSync(seedsDir)) {
    printWarning('No seeds directory found');
    return;
  }
  
  try {
    const files = readdirSync(seedsDir).filter(file => file.endsWith('.sql')).sort();
    
    for (const file of files) {
      const seedPath = join(seedsDir, file);
      runSqlFile(seedPath, `seed data ${file}`);
    }
  } catch (error) {
    printWarning('Could not read seeds directory');
  }
}

function verifySetup() {
  printInfo('Verifying database setup...');
  
  try {
    const userCountCmd = `PGPASSWORD="${config.DB_PASSWORD}" psql -h ${config.DB_HOST} -p ${config.DB_PORT} -U ${config.DB_USER} -d ${config.DB_NAME} -tAc "SELECT COUNT(*) FROM users;"`;
    const providerCountCmd = `PGPASSWORD="${config.DB_PASSWORD}" psql -h ${config.DB_HOST} -p ${config.DB_PORT} -U ${config.DB_USER} -d ${config.DB_NAME} -tAc "SELECT COUNT(*) FROM providers;"`;
    
    const userCount = execSync(userCountCmd, { stdio: 'pipe' }).toString().trim();
    const providerCount = execSync(providerCountCmd, { stdio: 'pipe' }).toString().trim();
    
    printInfo('Database verification results:');
    printInfo(`  - Users: ${userCount}`);
    printInfo(`  - Providers: ${providerCount}`);
    
    if (parseInt(userCount) > 0) {
      printSuccess('Database setup completed successfully!');
      
      if (config.SEED_DEMO_DATA) {
        printInfo('');
        printInfo('Demo credentials available:');
        printInfo('  - Admin: admin@agentcare.dev / AgentCare2024!');
        printInfo('  - Doctor: doctor@agentcare.dev / AgentCare2024!');
        printInfo('  - Nurse: nurse@agentcare.dev / AgentCare2024!');
        printInfo('  - Patient: patient@agentcare.dev / AgentCare2024!');
        printInfo('  - Receptionist: receptionist@agentcare.dev / AgentCare2024!');
      }
    } else if (config.SEED_DEMO_DATA) {
      printWarning('No users found after seeding - seed data may be incompatible with current schema');
      printInfo('Database migration completed successfully, but demo data seeding may have failed');
    } else {
      printSuccess('Database migration completed successfully!');
      printInfo('No demo data was seeded (--no-demo-data flag used)');
    }
  } catch (error) {
    printWarning('Could not verify database setup');
  }
}

async function main() {
  if (options.help) {
    showUsage();
    process.exit(0);
  }
  
  printInfo('Starting AgentCare backend database migration...');
  printInfo('Configuration:');
  printInfo(`  - Database: ${config.DB_NAME}`);
  printInfo(`  - User: ${config.DB_USER}`);
  printInfo(`  - Host: ${config.DB_HOST}:${config.DB_PORT}`);
  printInfo(`  - Force Recreate: ${options.forceRecreate}`);
  printInfo(`  - Seed Demo Data: ${config.SEED_DEMO_DATA}`);
  printInfo('');
  
  try {
    checkPostgres();
    setupDatabase();
    applySchema();
    await runMigrations();
    await seedDemoData();
    verifySetup();
    
    printSuccess('AgentCare backend database migration completed!');
  } catch (error) {
    printError(`Migration failed: ${error.message}`);
    process.exit(1);
  }
}

main().catch(error => {
  printError(`Unexpected error: ${error.message}`);
  process.exit(1);
}); 