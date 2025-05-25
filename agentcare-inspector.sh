#!/bin/bash

# AgentCare System Inspector
# Comprehensive health check for multi-agent healthcare scheduling system
# Checks: Backend, Frontend, PostgreSQL+pgvector, Redis, Ollama, Agents, Docker

# Don't exit on first error for health checks
set +e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/.env"
COMPOSE_FILE="${SCRIPT_DIR}/docker-compose.yml"

# Service endpoints
BACKEND_URL="http://localhost:3000"
FRONTEND_URL="http://localhost:3001"
OLLAMA_URL="http://localhost:11434"
POSTGRES_HOST="localhost"
POSTGRES_PORT="5432"
REDIS_HOST="localhost"
REDIS_PORT="6379"

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
WARNING_TESTS=0

# Issue tracking
declare -a CRITICAL_ISSUES=()
declare -a WARNING_ISSUES=()
declare -a SUGGESTIONS=()

print_banner() {
    echo -e "${CYAN}"
    echo "  ╔══════════════════════════════════════════════════════════════════╗"
    echo "  ║                    🩺 AgentCare System Inspector 🔍             ║"
    echo "  ║              Multi-Agent Healthcare System Diagnostics          ║"
    echo "  ║                     Health Check & Troubleshooting              ║"
    echo "  ╚══════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo -e "${WHITE}Starting comprehensive system inspection...${NC}\n"
}

print_section() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}🔍 $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

test_status() {
    ((TOTAL_TESTS++))
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
        ((PASSED_TESTS++))
    else
        echo -e "${RED}❌ $2${NC}"
        ((FAILED_TESTS++))
        if [ -n "$3" ]; then
            CRITICAL_ISSUES+=("$2: $3")
        else
            CRITICAL_ISSUES+=("$2")
        fi
    fi
}

test_warning() {
    ((TOTAL_TESTS++))
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((WARNING_TESTS++))
    WARNING_ISSUES+=("$1")
}

test_info() {
    echo -e "${PURPLE}ℹ️  $1${NC}"
}

add_suggestion() {
    SUGGESTIONS+=("$1")
}

# 1. Environment and Configuration Check
check_environment() {
    print_section "Environment & Configuration"
    
    # Check if .env file exists
    if [ -f "$ENV_FILE" ]; then
        test_status 0 "Environment file (.env) exists"
        
        # Check critical environment variables
        source "$ENV_FILE" 2>/dev/null || true
        
        if [ -n "$DATABASE_URL" ]; then
            test_status 0 "DATABASE_URL is configured"
        else
            test_status 1 "DATABASE_URL is missing" "Set DATABASE_URL in .env file"
        fi
        
        if [ -n "$OLLAMA_BASE_URL" ]; then
            test_status 0 "OLLAMA_BASE_URL is configured ($OLLAMA_BASE_URL)"
        else
            test_status 1 "OLLAMA_BASE_URL is missing" "Set OLLAMA_BASE_URL in .env file"
        fi
        
        if [ -n "$REDIS_URL" ]; then
            test_status 0 "REDIS_URL is configured"
        else
            test_status 1 "REDIS_URL is missing" "Set REDIS_URL in .env file"
        fi
        
        if [ "$ENABLE_OLLAMA_LLM" = "true" ]; then
            test_status 0 "Ollama LLM is enabled"
        else
            test_warning "Ollama LLM is disabled - AI agents may not work"
        fi
        
        if [ "$ENABLE_RAG_SYSTEM" = "true" ]; then
            test_status 0 "RAG system is enabled"
        else
            test_warning "RAG system is disabled - conversational context may be limited"
        fi
        
    else
        test_status 1 "Environment file (.env) not found" "Copy env.example to .env and configure"
        add_suggestion "Run: cp env.example .env && edit .env with your configuration"
    fi
    
    # Check Docker Compose file
    if [ -f "$COMPOSE_FILE" ]; then
        test_status 0 "Docker Compose configuration exists"
    else
        test_status 1 "docker-compose.yml not found" "Ensure you're in the AgentCare root directory"
    fi
}

# 2. Docker Services Check
check_docker_services() {
    print_section "Docker Services Status"
    
    # Check if Docker is running
    if docker info >/dev/null 2>&1; then
        test_status 0 "Docker daemon is running"
    else
        test_status 1 "Docker daemon is not running" "Start Docker Desktop or systemctl start docker"
        return
    fi
    
    # Check if docker-compose is available
    if command -v docker-compose >/dev/null 2>&1 || docker compose version >/dev/null 2>&1; then
        test_status 0 "Docker Compose is available"
    else
        test_status 1 "Docker Compose not found" "Install Docker Compose"
        return
    fi
    
    # Check running containers
    if command -v docker-compose >/dev/null 2>&1; then
        COMPOSE_CMD="docker-compose"
    else
        COMPOSE_CMD="docker compose"
    fi
    
    # Get container status
    local containers_output
    containers_output=$($COMPOSE_CMD ps 2>/dev/null || echo "")
    
    if [ -n "$containers_output" ]; then
        test_info "Checking individual container status..."
        
        # Check specific containers
        check_container_status "agentcare-ollama" "Ollama LLM Service"
        check_container_status "agentcare-postgres" "PostgreSQL Database" 
        check_container_status "agentcare-redis" "Redis Cache"
        check_container_status "agentcare-backend" "Backend API"
        check_container_status "agentcare-frontend" "Frontend Application"
    else
        test_status 1 "No containers are running" "Run: docker-compose up -d"
        add_suggestion "Start all services: ./docker-quick-start.sh"
    fi
}

check_container_status() {
    local container_name=$1
    local service_name=$2
    
    if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "$container_name.*Up"; then
        local uptime=$(docker ps --format "table {{.Names}}\t{{.Status}}" | grep "$container_name" | awk '{print $2" "$3}')
        test_status 0 "$service_name container is running ($uptime)"
    else
        if docker ps -a --format "table {{.Names}}\t{{.Status}}" | grep -q "$container_name"; then
            local status=$(docker ps -a --format "table {{.Names}}\t{{.Status}}" | grep "$container_name" | awk '{$1=""; print $0}')
            test_status 1 "$service_name container exists but not running" "Status: $status"
            add_suggestion "Restart container: docker-compose restart ${container_name#agentcare-}"
        else
            test_status 1 "$service_name container not found" "Run: docker-compose up -d"
        fi
    fi
}

# 3. PostgreSQL Database Check
check_postgresql() {
    print_section "PostgreSQL Database"
    
    # Check if PostgreSQL is accessible
    if pg_isready -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" >/dev/null 2>&1; then
        test_status 0 "PostgreSQL server is accessible"
    else
        test_status 1 "PostgreSQL server not accessible" "Check if postgres container is running"
        return
    fi
    
    # Check database connection with credentials from env
    source "$ENV_FILE" 2>/dev/null || true
    
    if [ -n "$POSTGRES_USER" ] && [ -n "$POSTGRES_PASSWORD" ] && [ -n "$POSTGRES_DB" ]; then
        if PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "\l" >/dev/null 2>&1; then
            test_status 0 "Database connection successful"
            
            # Check for pgvector extension
            if PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT 1 FROM pg_extension WHERE extname='vector';" | grep -q "1"; then
                test_status 0 "pgvector extension is installed (RAG support)"
            else
                test_status 1 "pgvector extension not found" "Required for RAG/vector similarity search"
                add_suggestion "Install pgvector: CREATE EXTENSION vector;"
            fi
            
            # Check key tables exist
            check_table_exists "organizations" "Organizations table"
            check_table_exists "users" "Users table" 
            check_table_exists "appointments" "Appointments table"
            check_table_exists "conversation_messages" "Conversation messages table (RAG)"
            
            # Check database performance
            check_db_performance
            
        else
            test_status 1 "Database connection failed" "Check credentials in .env file"
        fi
    else
        test_status 1 "Database credentials not configured" "Set POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB in .env"
    fi
}

check_table_exists() {
    local table_name=$1
    local description=$2
    
    if PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "\dt" | grep -q "$table_name"; then
        test_status 0 "$description exists"
    else
        test_status 1 "$description missing" "Run database migrations"
        add_suggestion "Apply schema: psql -d $POSTGRES_DB -f database/enhanced-multi-tenant-schema.sql"
    fi
}

check_db_performance() {
    local connections
    connections=$(PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';" 2>/dev/null || echo "0")
    
    if [ "$connections" -lt 10 ]; then
        test_status 0 "Database connection count is healthy ($connections active)"
    else
        test_warning "High number of database connections ($connections active)"
    fi
}

# 4. Redis Cache Check  
check_redis() {
    print_section "Redis Cache"
    
    # Check if Redis is accessible
    if redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" ping >/dev/null 2>&1; then
        test_status 0 "Redis server is accessible"
        
        # Check Redis info
        local redis_version
        redis_version=$(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" info server | grep "redis_version" | cut -d: -f2 | tr -d '\r')
        test_info "Redis version: $redis_version"
        
        # Check memory usage
        local used_memory
        used_memory=$(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" info memory | grep "used_memory_human" | cut -d: -f2 | tr -d '\r')
        test_info "Redis memory usage: $used_memory"
        
        # Test basic operations
        if redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" set agentcare:health_check "$(date)" >/dev/null 2>&1; then
            test_status 0 "Redis write operations working"
            redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" del agentcare:health_check >/dev/null 2>&1
        else
            test_status 1 "Redis write operations failed" "Check Redis configuration"
        fi
        
    else
        test_status 1 "Redis server not accessible" "Check if redis container is running"
        add_suggestion "Restart Redis: docker-compose restart redis"
    fi
}

# 5. Ollama LLM Service Check
check_ollama() {
    print_section "Ollama LLM Service"
    
    # Check if Ollama API is accessible
    if curl -s -f "$OLLAMA_URL/api/tags" >/dev/null 2>&1; then
        test_status 0 "Ollama API is accessible"
        
        # Check available models
        local models_response
        models_response=$(curl -s "$OLLAMA_URL/api/tags" 2>/dev/null)
        
        if echo "$models_response" | jq -e '.models' >/dev/null 2>&1; then
            local model_count
            model_count=$(echo "$models_response" | jq '.models | length')
            test_status 0 "Ollama models loaded ($model_count models available)"
            
            # List models
            test_info "Available models:"
            echo "$models_response" | jq -r '.models[].name' | while read -r model; do
                echo -e "  ${CYAN}  • $model${NC}"
            done
            
            # Check for required model
            source "$ENV_FILE" 2>/dev/null || true
            if [ -n "$OLLAMA_MODEL" ]; then
                if echo "$models_response" | jq -r '.models[].name' | grep -q "$OLLAMA_MODEL"; then
                    test_status 0 "Required model ($OLLAMA_MODEL) is available"
                else
                    test_status 1 "Required model ($OLLAMA_MODEL) not found" "Pull the model"
                    add_suggestion "Pull model: docker-compose exec ollama ollama pull $OLLAMA_MODEL"
                fi
            fi
            
        else
            test_status 1 "No models loaded in Ollama" "Pull required models"
            add_suggestion "Pull models: docker-compose exec ollama ollama pull qwen2.5:latest"
        fi
        
        # Test Ollama inference
        test_ollama_inference
        
    else
        test_status 1 "Ollama API not accessible" "Check if ollama container is running"
        add_suggestion "Restart Ollama: docker-compose restart ollama"
    fi
}

test_ollama_inference() {
    test_info "Testing Ollama inference..."
    
    local test_response
    test_response=$(curl -s -X POST "$OLLAMA_URL/api/generate" \
        -H "Content-Type: application/json" \
        -d '{"model":"qwen2.5:latest","prompt":"Hello","stream":false}' 2>/dev/null)
    
    if echo "$test_response" | jq -e '.response' >/dev/null 2>&1; then
        test_status 0 "Ollama inference is working"
    else
        test_status 1 "Ollama inference failed" "Check model availability and container resources"
    fi
}

# 6. Backend API Check
check_backend() {
    print_section "Backend API"
    
    # Check if backend is accessible
    if curl -s -f "$BACKEND_URL/health" >/dev/null 2>&1; then
        test_status 0 "Backend API is accessible"
        
        # Get health check details
        local health_response
        health_response=$(curl -s "$BACKEND_URL/health" 2>/dev/null)
        
        if echo "$health_response" | jq -e '.status' >/dev/null 2>&1; then
            local status
            status=$(echo "$health_response" | jq -r '.status')
            
            if [ "$status" = "healthy" ]; then
                test_status 0 "Backend health status: $status"
            else
                test_warning "Backend health status: $status"
            fi
            
            # Check service availability
            check_backend_services "$health_response"
            
            # Check API endpoints
            check_api_endpoints
            
        else
            test_status 1 "Backend health check returned invalid response" "Check backend logs"
        fi
        
    else
        test_status 1 "Backend API not accessible" "Check if backend container is running"
        add_suggestion "Restart backend: docker-compose restart backend"
    fi
}

check_backend_services() {
    local health_response=$1
    
    test_info "Checking backend services..."
    
    # Check if services are reported in health check
    if echo "$health_response" | jq -e '.services' >/dev/null 2>&1; then
        local services
        services=$(echo "$health_response" | jq -r '.services | to_entries[] | "\(.key):\(.value)"')
        
        while IFS= read -r service; do
            local service_name=${service%:*}
            local service_status=${service#*:}
            
            if [ "$service_status" = "true" ]; then
                test_status 0 "Service $service_name is available"
            else
                test_status 1 "Service $service_name is not available" "Check service configuration"
            fi
        done <<< "$services"
    fi
}

check_api_endpoints() {
    test_info "Testing API endpoints..."
    
    # Test Ollama integration endpoint
    local ollama_status
    ollama_status=$(curl -s "$BACKEND_URL/api/v1/ollama/status" 2>/dev/null)
    
    if echo "$ollama_status" | jq -e '.status' >/dev/null 2>&1; then
        local status
        status=$(echo "$ollama_status" | jq -r '.status')
        test_status 0 "Ollama integration endpoint working (status: $status)"
    else
        test_status 1 "Ollama integration endpoint failed" "Check Ollama connection in backend"
    fi
    
    # Test agent processing endpoint
    test_agent_processing
}

test_agent_processing() {
    test_info "Testing agent processing..."
    
    local agent_response
    agent_response=$(curl -s -X POST "$BACKEND_URL/api/v1/agents/process" \
        -H "Content-Type: application/json" \
        -d '{"message":"health check test"}' 2>/dev/null)
    
    if echo "$agent_response" | jq -e '.response' >/dev/null 2>&1; then
        test_status 0 "Agent processing endpoint is working"
        
        # Check response quality
        local response_text
        response_text=$(echo "$agent_response" | jq -r '.response')
        
        if [ ${#response_text} -gt 10 ]; then
            test_status 0 "Agent is generating meaningful responses"
        else
            test_warning "Agent responses seem too short (possible fallback mode)"
        fi
    else
        test_status 1 "Agent processing endpoint failed" "Check agent configuration and Ollama connection"
    fi
}

# 7. Frontend Application Check
check_frontend() {
    print_section "Frontend Application"
    
    # Check if frontend is accessible
    if curl -s -f "$FRONTEND_URL" >/dev/null 2>&1; then
        test_status 0 "Frontend application is accessible"
        
        # Check if it's serving HTML
        local response
        response=$(curl -s "$FRONTEND_URL" 2>/dev/null)
        
        if echo "$response" | grep -q "<html"; then
            test_status 0 "Frontend is serving HTML content"
        else
            test_status 1 "Frontend not serving HTML" "Check Vite dev server or nginx configuration"
        fi
        
        # Check for React app indicators
        if echo "$response" | grep -q "react\|vite\|AgentCare"; then
            test_status 0 "Frontend appears to be the React application"
        else
            test_warning "Frontend content may not be the expected React app"
        fi
        
        # Test frontend health endpoint
        if curl -s -f "$FRONTEND_URL/health" >/dev/null 2>&1; then
            test_status 0 "Frontend health endpoint accessible"
        else
            test_info "Frontend health endpoint not configured (optional)"
        fi
        
    else
        test_status 1 "Frontend application not accessible" "Check if frontend container is running"
        add_suggestion "Restart frontend: docker-compose restart frontend"
    fi
}

# 8. Network Connectivity Check
check_network_connectivity() {
    print_section "Network Connectivity"
    
    # Check internal network connectivity
    test_info "Testing internal service connectivity..."
    
    # Test backend to Ollama
    if docker exec agentcare-backend curl -s -f "http://ollama:11434/api/tags" >/dev/null 2>&1; then
        test_status 0 "Backend can reach Ollama service"
    else
        test_status 1 "Backend cannot reach Ollama service" "Check Docker network configuration"
    fi
    
    # Test backend to PostgreSQL
    if docker exec agentcare-backend pg_isready -h postgres -p 5432 >/dev/null 2>&1; then
        test_status 0 "Backend can reach PostgreSQL service"
    else
        test_status 1 "Backend cannot reach PostgreSQL service" "Check Docker network configuration"
    fi
    
    # Test backend to Redis
    if docker exec agentcare-backend redis-cli -h redis -p 6379 ping >/dev/null 2>&1; then
        test_status 0 "Backend can reach Redis service"
    else
        test_status 1 "Backend cannot reach Redis service" "Check Docker network configuration"
    fi
}

# 9. Performance and Resource Check
check_performance() {
    print_section "Performance & Resources"
    
    # Check system resources
    check_system_resources
    
    # Check Docker resource usage
    check_docker_resources
    
    # Check response times
    check_response_times
}

check_system_resources() {
    test_info "Checking system resources..."
    
    # Memory check
    if command -v free >/dev/null 2>&1; then
        local available_memory
        available_memory=$(free -m | awk 'NR==2{printf "%.0f", $7}')
        
        if [ "$available_memory" -gt 4096 ]; then
            test_status 0 "Sufficient memory available (${available_memory}MB)"
        elif [ "$available_memory" -gt 2048 ]; then
            test_warning "Memory is getting low (${available_memory}MB available)"
        else
            test_status 1 "Low memory available (${available_memory}MB)" "Consider increasing system memory"
        fi
    fi
    
    # Disk space check
    local disk_usage
    disk_usage=$(df . | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ "$disk_usage" -lt 80 ]; then
        test_status 0 "Disk usage is healthy (${disk_usage}%)"
    elif [ "$disk_usage" -lt 90 ]; then
        test_warning "Disk usage is high (${disk_usage}%)"
    else
        test_status 1 "Disk usage is critical (${disk_usage}%)" "Free up disk space"
    fi
}

check_docker_resources() {
    test_info "Checking Docker container resources..."
    
    # Get container stats
    local stats_output
    stats_output=$(docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" 2>/dev/null | tail -n +2)
    
    if [ -n "$stats_output" ]; then
        echo "$stats_output" | while IFS=$'\t' read -r container cpu memory; do
            if [[ "$container" == agentcare-* ]]; then
                test_info "  $container: CPU $cpu, Memory $memory"
            fi
        done
    fi
}

check_response_times() {
    test_info "Checking response times..."
    
    # Test backend response time
    local backend_time
    backend_time=$(curl -w "%{time_total}" -s -o /dev/null "$BACKEND_URL/health" 2>/dev/null || echo "999")
    
    if (( $(echo "$backend_time < 1.0" | bc -l) )); then
        test_status 0 "Backend response time is good (${backend_time}s)"
    elif (( $(echo "$backend_time < 3.0" | bc -l) )); then
        test_warning "Backend response time is slow (${backend_time}s)"
    else
        test_status 1 "Backend response time is very slow (${backend_time}s)" "Check backend performance"
    fi
    
    # Test Ollama response time
    local ollama_time
    ollama_time=$(curl -w "%{time_total}" -s -o /dev/null "$OLLAMA_URL/api/tags" 2>/dev/null || echo "999")
    
    if (( $(echo "$ollama_time < 2.0" | bc -l) )); then
        test_status 0 "Ollama response time is good (${ollama_time}s)"
    elif (( $(echo "$ollama_time < 5.0" | bc -l) )); then
        test_warning "Ollama response time is slow (${ollama_time}s)"
    else
        test_status 1 "Ollama response time is very slow (${ollama_time}s)" "Check Ollama performance or model size"
    fi
}

# 10. Security Check
check_security() {
    print_section "Security Configuration"
    
    # Check environment security
    source "$ENV_FILE" 2>/dev/null || true
    
    # Check for default/weak passwords
    if [ "$JWT_SECRET" = "development-secret-key-change-in-production" ]; then
        test_status 1 "Default JWT secret detected" "Change JWT_SECRET to a secure random value"
        add_suggestion "Generate new JWT secret: openssl rand -hex 64"
    else
        test_status 0 "JWT secret is configured"
    fi
    
    # Check HIPAA logging
    if [ "$HIPAA_LOGGING" = "true" ]; then
        test_status 0 "HIPAA logging is enabled"
    else
        test_warning "HIPAA logging is disabled"
    fi
    
    # Check if running in development mode in production
    if [ "$NODE_ENV" = "production" ]; then
        test_status 0 "Running in production mode"
        
        if [ "$ENABLE_SWAGGER_UI" = "true" ]; then
            test_warning "Swagger UI is enabled in production"
        fi
    else
        test_info "Running in development mode"
    fi
}

# Generate Summary Report
generate_summary() {
    echo -e "\n${WHITE}╔════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${WHITE}║                           INSPECTION SUMMARY                          ║${NC}"
    echo -e "${WHITE}╚════════════════════════════════════════════════════════════════════╝${NC}"
    
    echo -e "\n${CYAN}📊 Test Results:${NC}"
    echo -e "  ${GREEN}✅ Passed: $PASSED_TESTS${NC}"
    echo -e "  ${RED}❌ Failed: $FAILED_TESTS${NC}"
    echo -e "  ${YELLOW}⚠️  Warnings: $WARNING_TESTS${NC}"
    echo -e "  📝 Total Tests: $TOTAL_TESTS"
    
    # Calculate health score
    local health_score
    health_score=$(( (PASSED_TESTS * 100) / TOTAL_TESTS ))
    
    echo -e "\n${CYAN}🏥 System Health Score: ${NC}"
    if [ $health_score -ge 90 ]; then
        echo -e "  ${GREEN}$health_score% - Excellent${NC}"
    elif [ $health_score -ge 75 ]; then
        echo -e "  ${YELLOW}$health_score% - Good${NC}"
    elif [ $health_score -ge 50 ]; then
        echo -e "  ${YELLOW}$health_score% - Fair${NC}"
    else
        echo -e "  ${RED}$health_score% - Poor${NC}"
    fi
    
    # Show critical issues
    if [ ${#CRITICAL_ISSUES[@]} -gt 0 ]; then
        echo -e "\n${RED}🚨 Critical Issues:${NC}"
        printf '%s\n' "${CRITICAL_ISSUES[@]}" | while read -r issue; do
            echo -e "  ${RED}• $issue${NC}"
        done
    fi
    
    # Show warnings
    if [ ${#WARNING_ISSUES[@]} -gt 0 ]; then
        echo -e "\n${YELLOW}⚠️  Warnings:${NC}"
        printf '%s\n' "${WARNING_ISSUES[@]}" | while read -r warning; do
            echo -e "  ${YELLOW}• $warning${NC}"
        done
    fi
    
    # Show suggestions
    if [ ${#SUGGESTIONS[@]} -gt 0 ]; then
        echo -e "\n${PURPLE}💡 Suggestions:${NC}"
        printf '%s\n' "${SUGGESTIONS[@]}" | while read -r suggestion; do
            echo -e "  ${PURPLE}• $suggestion${NC}"
        done
    fi
    
    # Show quick fix commands
    echo -e "\n${CYAN}🔧 Quick Fix Commands:${NC}"
    echo -e "  ${CYAN}• Restart all services:${NC} docker-compose restart"
    echo -e "  ${CYAN}• View logs:${NC} docker-compose logs -f"
    echo -e "  ${CYAN}• Clean restart:${NC} ./docker-quick-start.sh --clean"
    echo -e "  ${CYAN}• Status check:${NC} ./docker-quick-start.sh --status"
    echo -e "  ${CYAN}• Documentation:${NC} See docs/ folder for comprehensive guides"
    
    # Final status
    echo -e "\n${WHITE}═══════════════════════════════════════════════════════════════════════${NC}"
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "${GREEN}🎉 AgentCare system is running successfully!${NC}"
    else
        echo -e "${RED}⚠️  AgentCare system has issues that need attention.${NC}"
    fi
    echo -e "${WHITE}═══════════════════════════════════════════════════════════════════════${NC}\n"
}

# Main execution
main() {
    print_banner
    
    check_environment
    check_docker_services
    check_postgresql
    check_redis
    check_ollama
    check_backend
    check_frontend
    check_network_connectivity
    check_performance
    check_security
    
    generate_summary
}

# Command line options
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "AgentCare System Inspector - Comprehensive health check"
        echo ""
        echo "OPTIONS:"
        echo "  --help, -h          Show this help message"
        echo "  --quiet, -q         Minimal output (errors only)"
        echo "  --verbose, -v       Detailed output"
        echo "  --json              Output results in JSON format"
        echo ""
        echo "Examples:"
        echo "  $0                  Run full inspection"
        echo "  $0 --quiet          Show only errors"
        echo "  $0 --json           JSON output for automation"
        exit 0
        ;;
    --quiet|-q)
        # Run quietly - could implement filtering here
        main
        ;;
    --verbose|-v)
        # Run with extra verbosity - could implement here
        main
        ;;
    --json)
        # JSON output - could implement structured output here
        echo "JSON output not yet implemented"
        exit 1
        ;;
    "")
        # Default: full inspection
        main
        ;;
    *)
        echo "Unknown option: $1"
        echo "Use --help for usage information"
        exit 1
        ;;
esac 