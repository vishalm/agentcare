#!/bin/bash

# AgentCare Docker Quick Start Script
# This script sets up and runs the entire AgentCare system with Docker Compose

set -e

echo "🚀 AgentCare Docker Quick Start"
echo "==============================="

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create logs directory
mkdir -p logs
mkdir -p models

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cat > .env << EOL
# AgentCare Docker Environment Configuration
NODE_ENV=production
API_PORT=3000
LOG_LEVEL=info

# Security Configuration
JWT_SECRET=docker-agentcare-jwt-secret-$(date +%s)
SESSION_SECRET=docker-agentcare-session-secret-$(date +%s)
PASSWORD_SALT_ROUNDS=12

# Database Configuration
DATABASE_URL=postgresql://agentcare_user:agentcare_secure_password@postgres:5432/agentcare
POSTGRES_DB=agentcare
POSTGRES_USER=agentcare_user
POSTGRES_PASSWORD=agentcare_secure_password

# Redis Configuration
REDIS_URL=redis://redis:6379

# Ollama LLM Configuration
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_MODEL=qwen2.5:latest
ENABLE_OLLAMA_LLM=true

# RAG System Configuration
ENABLE_RAG_SYSTEM=true

# Feature Flags
ENABLE_USER_REGISTRATION=true
ENABLE_APPOINTMENT_REMINDERS=true
ENABLE_AUDIT_LOGGING=true
ENABLE_RATE_LIMITING=true

# Healthcare Compliance
HIPAA_LOGGING=true
AUDIT_LOG_RETENTION_DAYS=2555

# Rate Limiting
API_RATE_LIMIT=100
API_RATE_WINDOW=900000
EOL
    echo "✅ Created .env file with default configuration"
else
    echo "✅ Using existing .env file"
fi

# Function to check if a command was successful
check_status() {
    if [ $? -eq 0 ]; then
        echo "✅ $1"
    else
        echo "❌ $1 failed"
        exit 1
    fi
}

# Build and start the services
echo ""
echo "🔨 Building Docker images..."
docker-compose build --no-cache
check_status "Docker images built successfully"

echo ""
echo "🎯 Starting AgentCare services..."
echo "This may take a few minutes on first run..."

# Start services in the correct order
echo "📦 Starting database and Redis..."
docker-compose up -d postgres redis
sleep 10

echo "🤖 Starting Ollama LLM service..."
docker-compose up -d ollama
sleep 20

echo "🏥 Starting AgentCare application..."
docker-compose up -d agentcare

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 30

# Health checks
echo ""
echo "🔍 Checking service health..."

# Check if containers are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Containers are running"
else
    echo "❌ Some containers failed to start"
    docker-compose logs
    exit 1
fi

# Check AgentCare health endpoint
echo "🏥 Checking AgentCare health..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    if curl -f -s http://localhost:3000/health > /dev/null 2>&1; then
        echo "✅ AgentCare is healthy and ready!"
        break
    else
        echo "⏳ Waiting for AgentCare to be ready... (attempt $attempt/$max_attempts)"
        sleep 10
        ((attempt++))
    fi
done

if [ $attempt -gt $max_attempts ]; then
    echo "❌ AgentCare failed to start properly"
    echo "📋 Here are the logs:"
    docker-compose logs agentcare
    exit 1
fi

# Display service information
echo ""
echo "🎉 AgentCare is now running!"
echo "=========================="
echo "🌐 Application: http://localhost:3000"
echo "🔍 Health Check: http://localhost:3000/health"
echo "📊 API Status: http://localhost:3000/api/v1/agents/status"
echo "🤖 Ollama API: http://localhost:11434"
echo "💾 Redis: localhost:6379"
echo "🐘 PostgreSQL: localhost:5432"
echo ""
echo "📱 Try these endpoints:"
echo "  - Chat: http://localhost:3000/"
echo "  - Health: http://localhost:3000/health"
echo "  - Metrics: http://localhost:3000/api/v1/metrics"
echo ""
echo "🔧 Management commands:"
echo "  - View logs: docker-compose logs -f"
echo "  - Stop all: docker-compose down"
echo "  - Restart: docker-compose restart"
echo "  - Full cleanup: docker-compose down -v"
echo ""
echo "📁 Data volumes:"
echo "  - Database: agentcare_postgres_data"
echo "  - Redis: agentcare_redis_data"
echo "  - Ollama Models: agentcare_ollama_data"
echo ""

# Optional: Start monitoring stack
read -p "🔍 Do you want to start the monitoring stack (Prometheus + Grafana)? [y/N]: " start_monitoring

if [[ $start_monitoring =~ ^[Yy]$ ]]; then
    echo "📊 Starting monitoring services..."
    docker-compose --profile monitoring up -d prometheus grafana
    sleep 10
    echo "📊 Monitoring services started!"
    echo "  - Prometheus: http://localhost:9090"
    echo "  - Grafana: http://localhost:3001 (admin/admin123)"
fi

# Optional: Start nginx reverse proxy
read -p "🌐 Do you want to start the Nginx reverse proxy? [y/N]: " start_nginx

if [[ $start_nginx =~ ^[Yy]$ ]]; then
    echo "🌐 Starting Nginx reverse proxy..."
    docker-compose --profile production up -d nginx
    sleep 5
    echo "🌐 Nginx started!"
    echo "  - HTTPS: https://localhost"
    echo "  - HTTP: http://localhost (redirects to HTTPS)"
fi

echo ""
echo "🚀 AgentCare setup complete!"
echo "Happy healthcare scheduling! 🏥" 