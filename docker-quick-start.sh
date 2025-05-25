#!/bin/bash

# AgentCare Docker Quick Start Script
# Multi-Agent Healthcare Scheduling System with Ollama LLM Integration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
ENV_FILE="${PROJECT_ROOT}/.env"
COMPOSE_FILE="${PROJECT_ROOT}/docker-compose.yml"
PROD_COMPOSE_FILE="${PROJECT_ROOT}/docker-compose.prod.yml"

# Default configuration
DEFAULT_POSTGRES_PASSWORD="agentcare_secure_$(openssl rand -hex 8)"
DEFAULT_REDIS_PASSWORD="redis_secure_$(openssl rand -hex 8)"
DEFAULT_JWT_SECRET="jwt_$(openssl rand -hex 32)"
DEFAULT_SESSION_SECRET="session_$(openssl rand -hex 32)"

print_banner() {
    echo -e "${CYAN}"
    echo "  ╔═══════════════════════════════════════════════════════════════╗"
    echo "  ║                     🏥 AgentCare Docker Setup 🤖              ║"
    echo "  ║              Multi-Agent Healthcare Scheduling System         ║"
    echo "  ║                    with Ollama LLM Integration                ║"
    echo "  ╚═══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_section() {
    echo -e "\n${BLUE}━━━ $1 ━━━${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${PURPLE}ℹ️  $1${NC}"
}

check_requirements() {
    print_section "Checking Requirements"
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    print_success "Docker is installed"

    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    print_success "Docker Compose is available"

    # Check if Docker daemon is running
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running. Please start Docker first."
        exit 1
    fi
    print_success "Docker daemon is running"

    # Check available memory (for Ollama)
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        AVAILABLE_MEMORY=$(free -m | awk 'NR==2{printf "%.0f", $7}')
        if [ "$AVAILABLE_MEMORY" -lt 4096 ]; then
            print_warning "Less than 4GB RAM available. Ollama may not perform optimally."
        else
            print_success "Sufficient memory available for Ollama"
        fi
    fi
}

setup_environment() {
    print_section "Setting up Environment"
    
    if [ ! -f "$ENV_FILE" ]; then
        print_info "Creating .env file with secure defaults..."
        cat > "$ENV_FILE" << EOF
# AgentCare Environment Configuration
# Generated: $(date)

# Application Configuration
NODE_ENV=development
API_PORT=3000
LOG_LEVEL=debug

# Database Configuration
POSTGRES_DB=agentcare_dev
POSTGRES_USER=agentcare
POSTGRES_PASSWORD=${DEFAULT_POSTGRES_PASSWORD}
DATABASE_URL=postgresql://agentcare:${DEFAULT_POSTGRES_PASSWORD}@localhost:5432/agentcare_dev

# Redis Configuration
REDIS_PASSWORD=${DEFAULT_REDIS_PASSWORD}
REDIS_URL=redis://:${DEFAULT_REDIS_PASSWORD}@localhost:6379/0

# Ollama LLM Configuration
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen2.5:latest
ENABLE_OLLAMA_LLM=true
OLLAMA_NUM_PARALLEL=2
OLLAMA_MAX_LOADED_MODELS=1

# Multi-Agent System Configuration
ENABLE_RAG_SYSTEM=true
ENABLE_USER_REGISTRATION=true
ENABLE_RATE_LIMITING=true
API_RATE_LIMIT=100
API_RATE_WINDOW=900000

# Security Configuration
JWT_SECRET=${DEFAULT_JWT_SECRET}
SESSION_SECRET=${DEFAULT_SESSION_SECRET}
PASSWORD_SALT_ROUNDS=12

# HIPAA Compliance
HIPAA_LOGGING=true
AUDIT_LOG_RETENTION_DAYS=2555

# Development Features
ENABLE_SWAGGER_UI=true
ENABLE_METRICS=true
METRICS_PORT=9090

# Frontend Configuration
VITE_API_BASE_URL=http://localhost:3000
VITE_ENABLE_MOCK_API=false
VITE_APP_TITLE=AgentCare - AI Healthcare Scheduling
VITE_APP_VERSION=2.0.0

# Production Settings (for production deployment)
ENABLE_SSL=false
SSL_CERT_PATH=
SSL_KEY_PATH=
CORS_ORIGIN=http://localhost:3001
EOF
        print_success "Environment file created with secure defaults"
    else
        print_info ".env file already exists, skipping creation"
    fi
}

pull_images() {
    print_section "Pulling Docker Images"
    
    print_info "This may take a while for the first run..."
    
    # Pull specific images to show progress
    echo -e "${CYAN}Pulling PostgreSQL...${NC}"
    docker pull postgres:14
    
    echo -e "${CYAN}Pulling Redis...${NC}"
    docker pull redis:7-alpine
    
    echo -e "${CYAN}Pulling Ollama...${NC}"
    docker pull ollama/ollama:latest
    
    print_success "All base images pulled successfully"
}

build_services() {
    print_section "Building AgentCare Services"
    
    print_info "Building backend and frontend containers..."
    
    if command -v docker-compose &> /dev/null; then
        docker-compose -f "$COMPOSE_FILE" build --no-cache
    else
        docker compose -f "$COMPOSE_FILE" build --no-cache
    fi
    
    print_success "Services built successfully"
}

start_services() {
    print_section "Starting Services"
    
    print_info "Starting AgentCare multi-agent healthcare system..."
    
    # Start core services first
    if command -v docker-compose &> /dev/null; then
        docker-compose -f "$COMPOSE_FILE" up -d ollama postgres redis
    else
        docker compose -f "$COMPOSE_FILE" up -d ollama postgres redis
    fi
    
    print_info "Waiting for core services to be ready..."
    sleep 10
    
    # Wait for Ollama to be ready and pull models
    print_info "Waiting for Ollama to start and pull models (this may take several minutes)..."
    for i in {1..30}; do
        if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
            print_success "Ollama is ready"
            break
        fi
        echo -ne "Waiting for Ollama... ${i}/30\r"
        sleep 10
    done
    
    # Start application services
    print_info "Starting backend and frontend services..."
    if command -v docker-compose &> /dev/null; then
        docker-compose -f "$COMPOSE_FILE" up -d backend frontend
    else
        docker compose -f "$COMPOSE_FILE" up -d backend frontend
    fi
    
    print_success "All services started"
}

wait_for_services() {
    print_section "Waiting for Services to be Ready"
    
    # Wait for backend
    print_info "Waiting for backend API..."
    for i in {1..30}; do
        if curl -s http://localhost:3000/health > /dev/null 2>&1; then
            print_success "Backend API is ready"
            break
        fi
        echo -ne "Waiting for backend... ${i}/30\r"
        sleep 2
    done
    
    # Wait for frontend
    print_info "Waiting for frontend..."
    for i in {1..20}; do
        if curl -s http://localhost:3001 > /dev/null 2>&1; then
            print_success "Frontend is ready"
            break
        fi
        echo -ne "Waiting for frontend... ${i}/20\r"
        sleep 2
    done
}

show_status() {
    print_section "Service Status"
    
    # Check service health
    echo -e "${CYAN}Backend Health:${NC}"
    curl -s http://localhost:3000/health | jq '.' 2>/dev/null || echo "Backend not responding"
    
    echo -e "\n${CYAN}Ollama Status:${NC}"
    curl -s http://localhost:3000/api/v1/ollama/status | jq '.' 2>/dev/null || echo "Ollama integration not responding"
    
    echo -e "\n${CYAN}Available Models:${NC}"
    curl -s http://localhost:11434/api/tags | jq '.models[].name' 2>/dev/null || echo "Ollama not responding"
    
    # Show running containers
    echo -e "\n${CYAN}Running Containers:${NC}"
    if command -v docker-compose &> /dev/null; then
        docker-compose -f "$COMPOSE_FILE" ps
    else
        docker compose -f "$COMPOSE_FILE" ps
    fi
}

test_ai_agents() {
    print_section "Testing AI Agents"
    
    print_info "Testing multi-agent system with Ollama..."
    
    # Test booking agent
    echo -e "${CYAN}Testing Booking Agent:${NC}"
    curl -s -X POST -H "Content-Type: application/json" \
         -d '{"message":"I want to book an appointment with a cardiologist"}' \
         http://localhost:3000/api/v1/agents/process | jq '.response' 2>/dev/null || echo "Agent test failed"
    
    # Test availability agent
    echo -e "\n${CYAN}Testing Availability Agent:${NC}"
    curl -s -X POST -H "Content-Type: application/json" \
         -d '{"message":"What doctors are available tomorrow?"}' \
         http://localhost:3000/api/v1/agents/process | jq '.response' 2>/dev/null || echo "Agent test failed"
}

show_access_info() {
    print_section "Access Information"
    
    echo -e "${GREEN}🎉 AgentCare is now running!${NC}\n"
    
    echo -e "${CYAN}📱 Frontend Application:${NC}"
    echo -e "   URL: ${YELLOW}http://localhost:3001${NC}"
    echo -e "   Description: React-based healthcare scheduling interface"
    
    echo -e "\n${CYAN}🔧 Backend API:${NC}"
    echo -e "   URL: ${YELLOW}http://localhost:3000${NC}"
    echo -e "   Health: ${YELLOW}http://localhost:3000/health${NC}"
    echo -e "   Swagger Docs: ${YELLOW}http://localhost:3000/api-docs${NC}"
    
    echo -e "\n${CYAN}🤖 AI Services:${NC}"
    echo -e "   Ollama API: ${YELLOW}http://localhost:11434${NC}"
    echo -e "   Agent Processing: ${YELLOW}http://localhost:3000/api/v1/agents/process${NC}"
    echo -e "   Ollama Status: ${YELLOW}http://localhost:3000/api/v1/ollama/status${NC}"
    
    echo -e "\n${CYAN}🗄️ Database & Cache:${NC}"
    echo -e "   PostgreSQL: ${YELLOW}localhost:5432${NC}"
    echo -e "   Redis: ${YELLOW}localhost:6379${NC}"
    echo -e "   pgAdmin: ${YELLOW}http://localhost:5050${NC} (admin@agentcare.local / admin)"
    
    echo -e "\n${CYAN}📊 Monitoring (Optional):${NC}"
    echo -e "   Prometheus: ${YELLOW}http://localhost:9091${NC}"
    echo -e "   Grafana: ${YELLOW}http://localhost:3002${NC} (admin / admin)"
    
    echo -e "\n${CYAN}🎮 Quick Commands:${NC}"
    echo -e "   View logs: ${YELLOW}docker-compose logs -f${NC}"
    echo -e "   Stop services: ${YELLOW}docker-compose down${NC}"
    echo -e "   Restart: ${YELLOW}docker-compose restart${NC}"
    echo -e "   Full cleanup: ${YELLOW}docker-compose down -v --remove-orphans${NC}"
}

show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "OPTIONS:"
    echo "  --help, -h          Show this help message"
    echo "  --production, -p    Start in production mode"
    echo "  --clean, -c         Clean up existing containers and volumes"
    echo "  --no-cache          Build without cache"
    echo "  --pull              Pull latest images only"
    echo "  --status            Show current status"
    echo "  --stop              Stop all services"
    echo ""
    echo "Examples:"
    echo "  $0                  Start in development mode"
    echo "  $0 --production     Start in production mode"
    echo "  $0 --clean          Clean up and restart"
    echo "  $0 --status         Show service status"
}

cleanup() {
    print_section "Cleaning Up"
    
    print_info "Stopping and removing containers..."
    if command -v docker-compose &> /dev/null; then
        docker-compose -f "$COMPOSE_FILE" down -v --remove-orphans
    else
        docker compose -f "$COMPOSE_FILE" down -v --remove-orphans
    fi
    
    print_info "Removing unused images and networks..."
    docker system prune -f
    
    print_success "Cleanup completed"
}

stop_services() {
    print_section "Stopping Services"
    
    if command -v docker-compose &> /dev/null; then
        docker-compose -f "$COMPOSE_FILE" down
    else
        docker compose -f "$COMPOSE_FILE" down
    fi
    
    print_success "Services stopped"
}

# Main execution
main() {
    print_banner
    
    case "${1:-}" in
        --help|-h)
            show_usage
            exit 0
            ;;
        --clean|-c)
            cleanup
            setup_environment
            check_requirements
            pull_images
            build_services
            start_services
            wait_for_services
            show_status
            test_ai_agents
            show_access_info
            ;;
        --production|-p)
            print_info "Starting in production mode..."
            check_requirements
            setup_environment
            if command -v docker-compose &> /dev/null; then
                docker-compose -f "$PROD_COMPOSE_FILE" up -d
            else
                docker compose -f "$PROD_COMPOSE_FILE" up -d
            fi
            wait_for_services
            show_status
            show_access_info
            ;;
        --pull)
            pull_images
            exit 0
            ;;
        --status)
            show_status
            exit 0
            ;;
        --stop)
            stop_services
            exit 0
            ;;
        --no-cache)
            check_requirements
            setup_environment
            pull_images
            print_info "Building without cache..."
            if command -v docker-compose &> /dev/null; then
                docker-compose -f "$COMPOSE_FILE" build --no-cache
            else
                docker compose -f "$COMPOSE_FILE" build --no-cache
            fi
            start_services
            wait_for_services
            show_status
            test_ai_agents
            show_access_info
            ;;
        "")
            # Default: development mode
            check_requirements
            setup_environment
            pull_images
            build_services
            start_services
            wait_for_services
            show_status
            test_ai_agents
            show_access_info
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
}

# Handle interruption
trap cleanup EXIT

# Run main function
main "$@" 