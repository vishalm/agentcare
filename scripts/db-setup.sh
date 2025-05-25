#!/bin/bash

# AgentCare Database Setup Script
# Sets up PostgreSQL database with schema and demo data

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DB_NAME="${DB_NAME:-agentcare}"
DB_USER="${DB_USER:-agentcare_user}"
DB_PASSWORD="${DB_PASSWORD:-agentcare_pass}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"
FORCE_RECREATE="${FORCE_RECREATE:-false}"
SEED_DEMO_DATA="${SEED_DEMO_DATA:-true}"

# Function to print colored messages
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}[$(date +'%Y-%m-%d %H:%M:%S')] $message${NC}"
}

print_info() {
    print_message "$BLUE" "INFO: $1"
}

print_success() {
    print_message "$GREEN" "SUCCESS: $1"
}

print_warning() {
    print_message "$YELLOW" "WARNING: $1"
}

print_error() {
    print_message "$RED" "ERROR: $1"
}

# Function to check if PostgreSQL is running
check_postgres() {
    print_info "Checking PostgreSQL connection..."
    
    if ! command -v psql &> /dev/null; then
        print_error "PostgreSQL client (psql) not found. Please install PostgreSQL."
        exit 1
    fi
    
    if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$POSTGRES_USER" &> /dev/null; then
        print_error "Cannot connect to PostgreSQL at $DB_HOST:$DB_PORT"
        print_info "Please ensure PostgreSQL is running and accessible."
        print_info "You can start PostgreSQL with: brew services start postgresql"
        exit 1
    fi
    
    print_success "PostgreSQL is running and accessible"
}

# Function to create database and user
setup_database() {
    print_info "Setting up database and user..."
    
    # Check if database exists
    DB_EXISTS=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$POSTGRES_USER" -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME';" 2>/dev/null || echo "")
    
    if [ "$DB_EXISTS" = "1" ] && [ "$FORCE_RECREATE" = "true" ]; then
        print_warning "Database '$DB_NAME' exists. Recreating..."
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$POSTGRES_USER" -c "DROP DATABASE IF EXISTS $DB_NAME;" &> /dev/null
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$POSTGRES_USER" -c "DROP USER IF EXISTS $DB_USER;" &> /dev/null
        DB_EXISTS=""
    fi
    
    if [ "$DB_EXISTS" != "1" ]; then
        print_info "Creating database user '$DB_USER'..."
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$POSTGRES_USER" -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" &> /dev/null || true
        
        print_info "Creating database '$DB_NAME'..."
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$POSTGRES_USER" -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" &> /dev/null
        
        print_info "Granting privileges..."
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$POSTGRES_USER" -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" &> /dev/null
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$POSTGRES_USER" -d "$DB_NAME" -c "GRANT ALL ON SCHEMA public TO $DB_USER;" &> /dev/null
        
        print_success "Database and user created successfully"
    else
        print_info "Database '$DB_NAME' already exists"
    fi
}

# Function to run SQL files
run_sql_file() {
    local file=$1
    local description=$2
    
    if [ -f "$file" ]; then
        print_info "Running $description..."
        if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$file" &> /dev/null; then
            print_success "$description completed"
        else
            print_error "Failed to run $description"
            return 1
        fi
    else
        print_warning "$description file not found: $file"
        return 1
    fi
}

# Function to apply schema
apply_schema() {
    print_info "Applying database schema..."
    
    # Check if tables already exist
    TABLE_COUNT=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null || echo "0")
    
    if [ "$TABLE_COUNT" -gt 0 ] && [ "$FORCE_RECREATE" != "true" ]; then
        print_warning "Database tables already exist. Use FORCE_RECREATE=true to recreate."
        return 0
    fi
    
    run_sql_file "database/schema.sql" "schema creation"
}

# Function to run migrations
run_migrations() {
    print_info "Running database migrations..."
    
    if [ -d "database/migrations" ]; then
        for migration in database/migrations/*.sql; do
            if [ -f "$migration" ]; then
                filename=$(basename "$migration")
                print_info "Applying migration: $filename"
                run_sql_file "$migration" "migration $filename"
            fi
        done
    else
        print_info "No migrations directory found"
    fi
}

# Function to seed demo data
seed_demo_data() {
    if [ "$SEED_DEMO_DATA" = "true" ]; then
        print_info "Seeding demo data..."
        
        if [ -d "database/seeds" ]; then
            # Run seed files in order
            for seed in database/seeds/*.sql; do
                if [ -f "$seed" ]; then
                    filename=$(basename "$seed")
                    run_sql_file "$seed" "seed data $filename"
                fi
            done
        else
            print_warning "No seeds directory found"
        fi
    else
        print_info "Skipping demo data seeding (SEED_DEMO_DATA=false)"
    fi
}

# Function to verify setup
verify_setup() {
    print_info "Verifying database setup..."
    
    # Check if tables exist
    USER_COUNT=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM users;" 2>/dev/null || echo "0")
    PROVIDER_COUNT=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM providers;" 2>/dev/null || echo "0")
    
    print_info "Database verification results:"
    print_info "  - Users: $USER_COUNT"
    print_info "  - Providers: $PROVIDER_COUNT"
    
    if [ "$USER_COUNT" -gt 0 ]; then
        print_success "Database setup completed successfully!"
        
        if [ "$SEED_DEMO_DATA" = "true" ]; then
            print_info ""
            print_info "Demo credentials available:"
            print_info "  - Admin: admin@agentcare.dev / AgentCare2024!"
            print_info "  - Doctor: doctor@agentcare.dev / AgentCare2024!"
            print_info "  - Nurse: nurse@agentcare.dev / AgentCare2024!"
            print_info "  - Patient: patient@agentcare.dev / AgentCare2024!"
            print_info "  - Receptionist: receptionist@agentcare.dev / AgentCare2024!"
        fi
    else
        print_error "Database setup may have failed - no users found"
        return 1
    fi
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "AgentCare Database Setup Script"
    echo ""
    echo "OPTIONS:"
    echo "  --force-recreate    Drop and recreate database"
    echo "  --no-demo-data     Skip seeding demo data"
    echo "  --help             Show this help message"
    echo ""
    echo "ENVIRONMENT VARIABLES:"
    echo "  DB_NAME            Database name (default: agentcare)"
    echo "  DB_USER            Database user (default: agentcare_user)"
    echo "  DB_PASSWORD        Database password (default: agentcare_pass)"
    echo "  DB_HOST            Database host (default: localhost)"
    echo "  DB_PORT            Database port (default: 5432)"
    echo "  POSTGRES_USER      PostgreSQL admin user (default: postgres)"
    echo "  FORCE_RECREATE     Force recreate database (default: false)"
    echo "  SEED_DEMO_DATA     Seed demo data (default: true)"
    echo ""
    echo "EXAMPLES:"
    echo "  $0                                    # Standard setup with demo data"
    echo "  $0 --force-recreate                  # Recreate database"
    echo "  $0 --no-demo-data                   # Setup without demo data"
    echo "  FORCE_RECREATE=true $0               # Environment variable approach"
}

# Main execution
main() {
    print_info "Starting AgentCare database setup..."
    print_info "Configuration:"
    print_info "  - Database: $DB_NAME"
    print_info "  - User: $DB_USER"
    print_info "  - Host: $DB_HOST:$DB_PORT"
    print_info "  - Force Recreate: $FORCE_RECREATE"
    print_info "  - Seed Demo Data: $SEED_DEMO_DATA"
    print_info ""
    
    check_postgres
    setup_database
    apply_schema
    run_migrations
    seed_demo_data
    verify_setup
    
    print_success "AgentCare database setup completed!"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --force-recreate)
            FORCE_RECREATE="true"
            shift
            ;;
        --no-demo-data)
            SEED_DEMO_DATA="false"
            shift
            ;;
        --help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "database" ]; then
    print_error "This script must be run from the AgentCare project root directory"
    exit 1
fi

# Run main function
main 