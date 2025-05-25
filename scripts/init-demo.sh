#!/bin/bash

# AgentCare Demo Initialization Script
# Complete first-time setup for demo environment

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
ALWAYS_SEED="${ALWAYS_SEED:-true}"
SKIP_DEPS="${SKIP_DEPS:-false}"

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

print_header() {
    print_message "$PURPLE" "$1"
}

print_step() {
    print_message "$CYAN" "STEP: $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check system requirements
check_system_requirements() {
    print_header "=== Checking System Requirements ==="
    
    local missing_deps=()
    
    # Check Node.js
    if command_exists node; then
        local node_version=$(node --version | sed 's/v//')
        local major_version=$(echo $node_version | cut -d. -f1)
        if [ "$major_version" -ge 18 ]; then
            print_success "Node.js $node_version detected"
        else
            print_error "Node.js 18+ required, found $node_version"
            missing_deps+=("nodejs")
        fi
    else
        print_error "Node.js not found"
        missing_deps+=("nodejs")
    fi
    
    # Check npm
    if command_exists npm; then
        local npm_version=$(npm --version)
        print_success "npm $npm_version detected"
    else
        print_error "npm not found"
        missing_deps+=("npm")
    fi
    
    # Check PostgreSQL
    if command_exists psql; then
        local pg_version=$(psql --version | awk '{print $3}' | cut -d. -f1)
        if [ "$pg_version" -ge 12 ]; then
            print_success "PostgreSQL $pg_version detected"
        else
            print_warning "PostgreSQL 12+ recommended, found $pg_version"
        fi
    else
        print_error "PostgreSQL not found"
        missing_deps+=("postgresql")
    fi
    
    # Check if PostgreSQL is running
    if command_exists pg_isready; then
        if pg_isready >/dev/null 2>&1; then
            print_success "PostgreSQL is running"
        else
            print_warning "PostgreSQL is not running"
            print_info "To start PostgreSQL: brew services start postgresql"
        fi
    fi
    
    # Check Git
    if command_exists git; then
        local git_version=$(git --version | awk '{print $3}')
        print_success "Git $git_version detected"
    else
        print_warning "Git not found (optional)"
    fi
    
    # Report missing dependencies
    if [ ${#missing_deps[@]} -gt 0 ]; then
        print_error "Missing required dependencies: ${missing_deps[*]}"
        print_info "Please install missing dependencies before continuing"
        
        print_info "Installation commands:"
        for dep in "${missing_deps[@]}"; do
            case $dep in
                "nodejs"|"npm")
                    print_info "  brew install node"
                    ;;
                "postgresql")
                    print_info "  brew install postgresql"
                    print_info "  brew services start postgresql"
                    ;;
            esac
        done
        
        exit 1
    fi
    
    print_success "All system requirements met!"
}

# Function to setup environment files
setup_environment() {
    print_header "=== Setting Up Environment ==="
    
    if [ ! -f ".env" ]; then
        if [ -f "env.example" ]; then
            print_info "Copying env.example to .env"
            cp env.example .env
            print_success "Environment file created"
        else
            print_info "Creating basic .env file"
            cat > .env << EOF
# AgentCare Environment Configuration
NODE_ENV=development
API_PORT=3000

# Database Configuration
DB_NAME=agentcare
DB_USER=agentcare_user
DB_PASSWORD=agentcare_pass
DB_HOST=localhost
DB_PORT=5432

# Ollama Configuration
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen2.5:latest
OLLAMA_TIMEOUT=30000

# Demo Configuration
DEMO_MODE=true
AUTO_SEED_DEMO_DATA=true

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=24h

# Logging
LOG_LEVEL=info
EOF
            print_success "Basic environment file created"
        fi
    else
        print_info "Environment file already exists"
    fi
}

# Function to install dependencies
install_dependencies() {
    if [ "$SKIP_DEPS" = "true" ]; then
        print_info "Skipping dependency installation (SKIP_DEPS=true)"
        return
    fi
    
    print_header "=== Installing Dependencies ==="
    
    print_step "Installing Node.js dependencies..."
    npm install
    print_success "Node.js dependencies installed"
    
    # Install frontend dependencies
    if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then
        print_step "Installing frontend dependencies..."
        cd frontend
        npm install
        cd ..
        print_success "Frontend dependencies installed"
    fi
}

# Function to setup Ollama
setup_ollama() {
    print_header "=== Setting Up Ollama LLM ==="
    
    if command_exists ollama; then
        print_success "Ollama detected"
        
        # Check if Ollama is running
        if curl -s http://127.0.0.1:11434/api/tags >/dev/null 2>&1; then
            print_success "Ollama is running"
        else
            print_warning "Ollama is not running"
            print_info "Starting Ollama service..."
            # Start ollama in background
            ollama serve &
            sleep 3
        fi
        
        # Pull required model
        print_step "Pulling qwen2.5:latest model..."
        if ollama pull qwen2.5:latest; then
            print_success "Ollama model downloaded"
        else
            print_warning "Failed to download model, but continuing..."
        fi
    else
        print_warning "Ollama not found"
        print_info "To install Ollama:"
        print_info "  Visit: https://ollama.ai/download"
        print_info "  Or: curl -fsSL https://ollama.ai/install.sh | sh"
        print_info "AgentCare will work in demo mode without Ollama"
    fi
}

# Function to setup database
setup_database() {
    print_header "=== Setting Up Database ==="
    
    print_step "Running database setup script..."
    ./scripts/db-setup.sh
}

# Function to build application
build_application() {
    print_header "=== Building Application ==="
    
    print_step "Building backend..."
    npm run build
    print_success "Backend built successfully"
}

# Function to verify installation
verify_installation() {
    print_header "=== Verifying Installation ==="
    
    # Check database
    print_step "Checking database connection..."
    if npm run db:status >/dev/null 2>&1; then
        print_success "Database connection verified"
    else
        print_warning "Database verification failed, but may work at runtime"
    fi
    
    # Check if frontend files exist
    if [ -d "frontend/dist" ] || [ -d "frontend/build" ] || [ -f "frontend/src/index.tsx" ]; then
        print_success "Frontend files detected"
    else
        print_warning "Frontend files not found"
    fi
    
    print_success "Installation verification completed"
}

# Function to show completion message
show_completion_message() {
    print_header "=== Setup Complete! ==="
    
    echo ""
    print_success "🎉 AgentCare demo environment is ready!"
    echo ""
    
    print_info "Quick start commands:"
    print_info "  npm run dev                 # Start both frontend and backend"
    print_info "  npm run dev:backend         # Start backend only"
    print_info "  npm run dev:frontend        # Start frontend only"
    echo ""
    
    print_info "Access the application:"
    print_info "  Frontend: http://localhost:3001"
    print_info "  Backend:  http://localhost:3000"
    print_info "  API Docs: http://localhost:3000/api-docs"
    echo ""
    
    print_info "Demo credentials (password: AgentCare2024!):"
    print_info "  Admin:        admin@agentcare.dev"
    print_info "  Doctor:       doctor@agentcare.dev"
    print_info "  Nurse:        nurse@agentcare.dev"
    print_info "  Patient:      patient@agentcare.dev"
    print_info "  Receptionist: receptionist@agentcare.dev"
    echo ""
    
    print_info "Additional commands:"
    print_info "  npm run db:reset:demo       # Reset demo data"
    print_info "  npm run db:status           # Check database status"
    print_info "  npm run setup:fresh         # Complete fresh setup"
    echo ""
    
    print_info "For detailed information, see:"
    print_info "  📚 DEMO_GUIDE.md            # Complete demo guide"
    print_info "  📖 docs/README.md           # Full documentation"
    echo ""
    
    print_success "Happy coding! 🚀"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "AgentCare Demo Initialization Script"
    echo ""
    echo "OPTIONS:"
    echo "  --skip-deps        Skip dependency installation"
    echo "  --no-seed          Don't seed demo data"
    echo "  --help             Show this help message"
    echo ""
    echo "ENVIRONMENT VARIABLES:"
    echo "  SKIP_DEPS          Skip dependency installation (default: false)"
    echo "  ALWAYS_SEED        Always seed demo data (default: true)"
    echo ""
    echo "EXAMPLES:"
    echo "  $0                 # Full setup with demo data"
    echo "  $0 --skip-deps     # Setup without installing dependencies"
    echo "  $0 --no-seed       # Setup without demo data"
}

# Main execution function
main() {
    print_header "🏥 AgentCare Demo Initialization"
    print_info "Setting up your AgentCare demo environment..."
    echo ""
    
    check_system_requirements
    setup_environment
    install_dependencies
    setup_ollama
    setup_database
    build_application
    verify_installation
    show_completion_message
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-deps)
            SKIP_DEPS="true"
            shift
            ;;
        --no-seed)
            ALWAYS_SEED="false"
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
if [ ! -f "package.json" ]; then
    print_error "This script must be run from the AgentCare project root directory"
    exit 1
fi

# Make other scripts executable
chmod +x scripts/*.sh 2>/dev/null || true

# Run main function
main 