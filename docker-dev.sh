#!/bin/bash

# AgentCare Development Docker Management Script
# Provides easy commands for managing the development environment with live reloading

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
COMPOSE_FILE="docker-compose.dev.yml"
PROJECT_NAME="agentcare-dev"

# Helper functions
print_header() {
    echo -e "${CYAN}================================${NC}"
    echo -e "${CYAN} 🏥 AgentCare Development Tools${NC}"
    echo -e "${CYAN}================================${NC}"
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
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Docker and Docker Compose are installed
check_requirements() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    if [ ! -f "$COMPOSE_FILE" ]; then
        print_error "Docker Compose file '$COMPOSE_FILE' not found!"
        exit 1
    fi
}

# Show usage
show_usage() {
    print_header
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  start                 Start all development services"
    echo "  stop                  Stop all services"
    echo "  restart               Restart all services"
    echo "  build                 Rebuild all services"
    echo "  logs [service]        Show logs (optionally for specific service)"
    echo "  shell [service]       Open shell in service container"
    echo "  status                Show status of all services"
    echo "  clean                 Stop and remove all containers, networks, and volumes"
    echo "  reset                 Clean and rebuild everything from scratch"
    echo ""
    echo "Service Management:"
    echo "  start-backend         Start only backend services (postgres, redis, ollama, backend)"
    echo "  start-frontend        Start only frontend service"
    echo "  start-observability   Start observability stack (prometheus, grafana, jaeger, elk)"
    echo "  start-tools           Start development tools (pgadmin, redis-commander, mailhog)"
    echo "  start-monitoring      Start monitoring exporters (node, redis, postgres)"
    echo "  start-storage         Start storage services (minio)"
    echo "  start-build           Start production build service"
    echo "  start-nginx           Start nginx with production build"
    echo "  start-watcher         Start file watcher service"
    echo ""
    echo "Development Utilities:"
    echo "  dev                   Start core development environment (backend + frontend)"
    echo "  prod-test             Test production build locally"
    echo "  health                Check health of all services"
    echo "  env                   Show environment variables"
    echo "  ps                    Show running containers"
    echo ""
    echo "Examples:"
    echo "  $0 dev                # Start development environment"
    echo "  $0 logs backend       # Show backend logs"
    echo "  $0 shell backend      # Open shell in backend container"
    echo "  $0 build              # Rebuild all services"
}

# Start all services
start_all() {
    print_info "Starting all AgentCare development services..."
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME up -d
    print_success "All services started!"
    show_access_info
}

# Start development environment (core services)
start_dev() {
    print_info "Starting AgentCare development environment..."
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME up -d postgres redis ollama elasticsearch backend frontend
    print_success "Development environment started!"
    show_access_info
}

# Start backend services only
start_backend() {
    print_info "Starting backend services..."
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME up -d postgres redis ollama elasticsearch backend
    print_success "Backend services started!"
}

# Start observability stack
start_observability() {
    print_info "Starting observability stack..."
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME up -d elasticsearch logstash kibana prometheus grafana jaeger
    print_success "Observability stack started!"
    echo ""
    echo "🔍 Observability URLs:"
    echo "  Prometheus:         http://localhost:9090"
    echo "  Grafana:            http://localhost:3002 (admin/admin)"
    echo "  Jaeger:             http://localhost:16686"
    echo "  Kibana:             http://localhost:5601"
    echo "  Elasticsearch:      http://localhost:9200"
}

# Start monitoring exporters
start_monitoring() {
    print_info "Starting monitoring exporters..."
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME --profile monitoring up -d
    print_success "Monitoring exporters started!"
    echo ""
    echo "📊 Monitoring Exporters:"
    echo "  Node Exporter:      http://localhost:9100"
    echo "  Redis Exporter:     http://localhost:9121"
    echo "  Postgres Exporter:  http://localhost:9187"
}

# Start storage services
start_storage() {
    print_info "Starting storage services..."
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME --profile storage up -d
    print_success "Storage services started!"
    echo ""
    echo "💾 Storage URLs:"
    echo "  MinIO Console:      http://localhost:9001 (agentcare/agentcare123)"
    echo "  MinIO API:          http://localhost:9000"
}

# Start frontend service only
start_frontend() {
    print_info "Starting frontend service..."
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME up -d frontend
    print_success "Frontend service started!"
}

# Start tools
start_tools() {
    print_info "Starting development tools..."
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME --profile tools up -d
    print_success "Development tools started!"
    echo ""
    echo "Access URLs:"
    echo "  📊 pgAdmin: http://localhost:5050 (admin@agentcare.local / admin)"
    echo "  🔧 Redis Commander: http://localhost:8081 (admin / admin)"
}

# Start production build test
start_prod_test() {
    print_info "Starting production build test..."
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME --profile build --profile nginx up -d
    print_success "Production test environment started!"
    echo ""
    echo "Access URLs:"
    echo "  🌐 Production Build: http://localhost:8080"
}

# Stop all services
stop_all() {
    print_info "Stopping all services..."
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME down
    print_success "All services stopped!"
}

# Restart services
restart_all() {
    print_info "Restarting all services..."
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME restart
    print_success "All services restarted!"
}

# Build services
build_all() {
    print_info "Building all services..."
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME build --no-cache
    print_success "All services built!"
}

# Show logs
show_logs() {
    if [ -n "$1" ]; then
        print_info "Showing logs for service: $1"
        docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME logs -f "$1"
    else
        print_info "Showing logs for all services..."
        docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME logs -f
    fi
}

# Open shell in service
open_shell() {
    if [ -z "$1" ]; then
        print_error "Please specify a service name"
        exit 1
    fi
    
    print_info "Opening shell in $1 container..."
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME exec "$1" /bin/sh
}

# Show service status
show_status() {
    print_info "Service Status:"
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME ps
}

# Show running containers
show_ps() {
    print_info "Running Containers:"
    docker ps --filter "name=${PROJECT_NAME}"
}

# Clean everything
clean_all() {
    print_warning "This will stop and remove all containers, networks, and volumes!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Cleaning up..."
        docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME down -v --remove-orphans
        docker system prune -f
        print_success "Cleanup complete!"
    else
        print_info "Cleanup cancelled."
    fi
}

# Reset everything
reset_all() {
    print_warning "This will clean and rebuild everything from scratch!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        clean_all
        build_all
        start_dev
        print_success "Reset complete!"
    else
        print_info "Reset cancelled."
    fi
}

# Check health of services
check_health() {
    print_info "Checking service health..."
    echo ""
    
    # Check if containers are running
    containers=$(docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME ps -q)
    
    if [ -z "$containers" ]; then
        print_warning "No containers are running"
        return
    fi
    
    # Check each service
    for service in postgres redis ollama elasticsearch backend frontend prometheus grafana jaeger kibana; do
        if docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME ps | grep -q "$service"; then
            health=$(docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME ps "$service" | tail -n +3 | awk '{print $4}')
            if [[ $health == *"Up"* ]]; then
                print_success "$service: Running"
            else
                print_error "$service: $health"
            fi
        else
            print_warning "$service: Not running"
        fi
    done
    
    echo ""
    print_info "Testing API endpoints..."
    
    # Test backend health
    if curl -s -f http://localhost:3000/health > /dev/null 2>&1; then
        print_success "Backend API: Healthy"
    else
        print_error "Backend API: Not responding"
    fi
    
    # Test frontend
    if curl -s -f http://localhost:3001 > /dev/null 2>&1; then
        print_success "Frontend: Healthy"
    else
        print_error "Frontend: Not responding"
    fi
    
    # Test Ollama
    if curl -s -f http://localhost:11434/api/tags > /dev/null 2>&1; then
        print_success "Ollama: Healthy"
    else
        print_error "Ollama: Not responding"
    fi
}

# Show environment info
show_env() {
    print_info "Environment Configuration:"
    echo ""
    echo "Project: $PROJECT_NAME"
    echo "Compose File: $COMPOSE_FILE"
    echo "Docker Version: $(docker --version)"
    echo "Docker Compose Version: $(docker-compose --version)"
    echo ""
    print_info "Service URLs:"
    show_access_info
}

# Show access information
show_access_info() {
    echo ""
    echo "🌐 Core Services:"
    echo "  Frontend (Dev):     http://localhost:3001"
    echo "  Backend API:        http://localhost:3000"
    echo "  API Documentation:  http://localhost:3000/api/v1"
    echo "  Ollama LLM:         http://localhost:11434"
    echo ""
    echo "🗄️  Database & Cache:"
    echo "  PostgreSQL:         localhost:5432 (agentcare/agentcare_dev)"
    echo "  Redis:              localhost:6379"
    echo ""
    echo "📊 Observability Stack:"
    echo "  Prometheus:         http://localhost:9090"
    echo "  Grafana:            http://localhost:3002 (admin/admin)"
    echo "  Jaeger (Tracing):   http://localhost:16686"
    echo "  Kibana (Logs):      http://localhost:5601"
    echo "  Elasticsearch:      http://localhost:9200"
    echo ""
    echo "🔧 Development Tools (use 'start-tools' to enable):"
    echo "  pgAdmin:            http://localhost:5050 (admin@agentcare.local/admin)"
    echo "  Redis Commander:    http://localhost:8081 (admin/admin)"
    echo "  Mailhog:            http://localhost:8025"
    echo ""
    echo "💾 Storage (use '--profile storage' to enable):"
    echo "  MinIO Console:      http://localhost:9001 (agentcare/agentcare123)"
    echo "  MinIO API:          http://localhost:9000"
    echo ""
    echo "🔧 Development Ports:"
    echo "  Backend Metrics:    http://localhost:9091"
    echo "  Node.js Debug:      localhost:9229"
    echo "  Vite HMR:           localhost:24678"
    echo "  Nginx (Prod):       http://localhost:8080"
}

# Main script logic
check_requirements

case "${1:-}" in
    "start")
        start_all
        ;;
    "dev")
        start_dev
        ;;
    "start-backend")
        start_backend
        ;;
    "start-frontend")
        start_frontend
        ;;
    "start-observability")
        start_observability
        ;;
    "start-tools")
        start_tools
        ;;
    "start-monitoring")
        start_monitoring
        ;;
    "start-storage")
        start_storage
        ;;
    "prod-test")
        start_prod_test
        ;;
    "stop")
        stop_all
        ;;
    "restart")
        restart_all
        ;;
    "build")
        build_all
        ;;
    "logs")
        show_logs "$2"
        ;;
    "shell")
        open_shell "$2"
        ;;
    "status")
        show_status
        ;;
    "ps")
        show_ps
        ;;
    "clean")
        clean_all
        ;;
    "reset")
        reset_all
        ;;
    "health")
        check_health
        ;;
    "env")
        show_env
        ;;
    "help"|"-h"|"--help")
        show_usage
        ;;
    *)
        if [ -z "${1:-}" ]; then
            show_usage
        else
            print_error "Unknown command: $1"
            echo ""
            show_usage
            exit 1
        fi
        ;;
esac 