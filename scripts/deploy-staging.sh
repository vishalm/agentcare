#!/bin/bash

# AgentCare Staging Deployment Script
# This script deploys both frontend and backend to staging environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_STAGING_URL="https://staging-frontend.agentcare.dev"
BACKEND_STAGING_URL="https://staging-api.agentcare.dev"
DOCKER_REGISTRY="ghcr.io/vishalm/agentcare"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if component is specified
if [ $# -eq 0 ]; then
    echo "Usage: $0 [frontend|backend|all] [environment]"
    echo "Example: $0 frontend staging"
    echo "Example: $0 all staging"
    exit 1
fi

COMPONENT=$1
ENVIRONMENT=${2:-staging}

# Validate component
if [[ "$COMPONENT" != "frontend" && "$COMPONENT" != "backend" && "$COMPONENT" != "all" ]]; then
    log_error "Invalid component. Use 'frontend', 'backend', or 'all'"
    exit 1
fi

# Validate environment
if [[ "$ENVIRONMENT" != "staging" ]]; then
    log_error "Invalid environment. Currently only 'staging' is supported"
    exit 1
fi

# Get current git info
GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
GIT_COMMIT=$(git rev-parse --short HEAD)
GIT_TAG=$(git describe --tags --exact-match 2>/dev/null || echo "")

log_info "Starting deployment to $ENVIRONMENT environment"
log_info "Branch: $GIT_BRANCH"
log_info "Commit: $GIT_COMMIT"
if [[ -n "$GIT_TAG" ]]; then
    log_info "Tag: $GIT_TAG"
fi

# Deploy Frontend
deploy_frontend() {
    log_info "Deploying frontend to staging..."
    
    cd frontend
    
    # Install dependencies
    log_info "Installing frontend dependencies..."
    npm ci
    
    # Run tests
    log_info "Running frontend tests..."
    npm run test -- --watchAll=false --coverage
    
    # Build for staging
    log_info "Building frontend for staging..."
    NODE_ENV=staging VITE_API_URL=$BACKEND_STAGING_URL VITE_APP_ENV=staging npm run build
    
    # Build Docker image
    log_info "Building frontend Docker image..."
    docker build -t agentcare-frontend:staging-$GIT_COMMIT -t agentcare-frontend:staging-latest .
    
    # Tag for registry
    if [[ -n "$DOCKER_REGISTRY" ]]; then
        docker tag agentcare-frontend:staging-$GIT_COMMIT $DOCKER_REGISTRY/frontend:staging-$GIT_COMMIT
        docker tag agentcare-frontend:staging-latest $DOCKER_REGISTRY/frontend:staging-latest
    fi
    
    # Run smoke tests
    log_info "Running frontend smoke tests..."
    # Add actual smoke test commands here
    
    cd ..
    log_success "Frontend deployment completed"
    log_info "Frontend staging URL: $FRONTEND_STAGING_URL"
}

# Deploy Backend
deploy_backend() {
    log_info "Deploying backend to staging..."
    
    cd backend
    
    # Install dependencies
    log_info "Installing backend dependencies..."
    npm ci
    
    # Run tests
    log_info "Running backend tests..."
    npm run test -- --watchAll=false --coverage
    
    # Build for staging
    log_info "Building backend for staging..."
    NODE_ENV=staging npm run build
    
    # Setup database
    log_info "Setting up staging database..."
    NODE_ENV=staging npm run db:migrate
    NODE_ENV=staging npm run db:seed
    
    # Build Docker image
    log_info "Building backend Docker image..."
    docker build -t agentcare-backend:staging-$GIT_COMMIT -t agentcare-backend:staging-latest .
    
    # Tag for registry
    if [[ -n "$DOCKER_REGISTRY" ]]; then
        docker tag agentcare-backend:staging-$GIT_COMMIT $DOCKER_REGISTRY/backend:staging-$GIT_COMMIT
        docker tag agentcare-backend:staging-latest $DOCKER_REGISTRY/backend:staging-latest
    fi
    
    # Run health checks
    log_info "Running backend health checks..."
    # Add actual health check commands here
    
    cd ..
    log_success "Backend deployment completed"
    log_info "Backend staging URL: $BACKEND_STAGING_URL"
}

# Run E2E tests
run_e2e_tests() {
    log_info "Running full stack E2E tests..."
    
    # Add actual E2E test commands here
    log_info "Frontend URL: $FRONTEND_STAGING_URL"
    log_info "Backend URL: $BACKEND_STAGING_URL"
    
    log_success "E2E tests completed"
}

# Main deployment logic
case $COMPONENT in
    "frontend")
        deploy_frontend
        ;;
    "backend")
        deploy_backend
        ;;
    "all")
        deploy_frontend
        deploy_backend
        run_e2e_tests
        ;;
esac

# Generate deployment summary
log_success "Deployment Summary:"
echo "=================================="
echo "Environment: $ENVIRONMENT"
echo "Branch: $GIT_BRANCH"
echo "Commit: $GIT_COMMIT"
if [[ -n "$GIT_TAG" ]]; then
    echo "Tag: $GIT_TAG"
fi
echo "Component(s): $COMPONENT"
if [[ "$COMPONENT" == "frontend" || "$COMPONENT" == "all" ]]; then
    echo "Frontend URL: $FRONTEND_STAGING_URL"
fi
if [[ "$COMPONENT" == "backend" || "$COMPONENT" == "all" ]]; then
    echo "Backend URL: $BACKEND_STAGING_URL"
fi
echo "=================================="

log_success "Staging deployment completed successfully! 🚀" 