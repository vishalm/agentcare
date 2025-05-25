# AgentCare Platform Setup Guide

**Complete guide to set up and run the multi-tenant healthcare SaaS platform**

This comprehensive guide will walk you through setting up AgentCare from development to production deployment, covering all prerequisites, configurations, and troubleshooting steps.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start (5 Minutes)](#quick-start-5-minutes)
3. [Development Setup](#development-setup)
4. [Database Configuration](#database-configuration)
5. [Environment Configuration](#environment-configuration)
6. [Running the Platform](#running-the-platform)
7. [API Documentation](#api-documentation)
8. [Testing Guide](#testing-guide)
9. [Production Deployment](#production-deployment)
10. [Troubleshooting](#troubleshooting)
11. [Monitoring & Maintenance](#monitoring--maintenance)

## 🚀 Prerequisites

### System Requirements

**Minimum Requirements:**
- **OS**: macOS 10.15+, Ubuntu 18.04+, Windows 10 (WSL2)
- **RAM**: 8GB (16GB recommended for development)
- **Storage**: 20GB available space
- **CPU**: 2 cores (4+ cores recommended)

**Required Software:**

```bash
# Core Requirements
- Node.js 18.x or higher
- npm 9.x or higher
- PostgreSQL 14.x or higher
- Git 2.30+
- Docker 20.10+ (optional but recommended)
- Docker Compose 2.0+ (optional)

# Development Tools (recommended)
- VS Code or preferred IDE
- Postman or Insomnia (API testing)
- pgAdmin or TablePlus (database management)
```

### Installation Commands

**macOS (using Homebrew):**
```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install required software
brew install node@18 postgresql@14 git docker
brew install --cask docker
```

**Ubuntu/Debian:**
```bash
# Update package list
sudo apt update

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL 14
sudo apt install postgresql-14 postgresql-client-14

# Install Git and Docker
sudo apt install git docker.io docker-compose
```

**Windows (WSL2):**
```bash
# Install WSL2 first, then use Ubuntu commands above
# Or use Windows package managers like Chocolatey
choco install nodejs postgresql git docker-desktop
```

### Verify Installation

```bash
# Check versions
node --version          # Should be v18.x.x or higher
npm --version           # Should be 9.x.x or higher
psql --version          # Should be 14.x or higher
git --version           # Should be 2.30+ 
docker --version        # Should be 20.10+
docker-compose --version # Should be 2.0+
```

## ⚡ Quick Start (5 Minutes)

Get AgentCare running quickly with Docker:

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/agentcare.git
cd agentcare

# 2. Start services with Docker
docker-compose up -d

# 3. Wait for services to be ready (30-60 seconds)
docker-compose logs -f

# 4. Access the platform
open http://localhost:3000
```

**Default Access:**
- **API Documentation**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/health
- **Database**: localhost:5432 (user: agentcare, password: agentcare_dev)

## 🛠️ Development Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/yourusername/agentcare.git
cd agentcare

# Install dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies (if exists)
cd frontend && npm install && cd ..
```

### 2. Database Setup

**Option A: Using Docker (Recommended)**
```bash
# Start PostgreSQL with Docker
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
docker-compose logs -f postgres
```

**Option B: Local PostgreSQL Installation**
```bash
# Start PostgreSQL service
# macOS
brew services start postgresql@14

# Ubuntu/Linux
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
```

**SQL Setup Commands:**
```sql
-- Create database and user
CREATE DATABASE agentcare_dev;
CREATE USER agentcare WITH PASSWORD 'agentcare_dev';
GRANT ALL PRIVILEGES ON DATABASE agentcare_dev TO agentcare;

-- Create test database
CREATE DATABASE agentcare_test;
GRANT ALL PRIVILEGES ON DATABASE agentcare_test TO agentcare;

-- Exit psql
\q
```

### 3. Apply Database Schema

```bash
# Apply the multi-tenant schema
psql -h localhost -U agentcare -d agentcare_dev -f database/enhanced-multi-tenant-schema.sql

# Apply test schema
psql -h localhost -U agentcare -d agentcare_test -f database/enhanced-multi-tenant-schema.sql

# Verify schema
psql -h localhost -U agentcare -d agentcare_dev -c "\dt"
```

## ⚙️ Environment Configuration

### 1. Create Environment Files

```bash
# Copy example environment files
cp env.example .env
cp env.example .env.development
cp env.example .env.test
cp env.example .env.production
```

### 2. Development Environment (.env.development)

```bash
# Application Settings
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database Configuration
DATABASE_URL=postgresql://agentcare:agentcare_dev@localhost:5432/agentcare_dev
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=agentcare_dev
DATABASE_USER=agentcare
DATABASE_PASSWORD=agentcare_dev
DATABASE_SSL=false
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# Test Database
TEST_DATABASE_URL=postgresql://agentcare:agentcare_dev@localhost:5432/agentcare_test

# Redis Configuration (optional)
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Security Configuration
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
CORS_CREDENTIALS=true

# Logging Configuration
LOG_LEVEL=debug
LOG_FORMAT=combined
LOG_FILE_ENABLED=true
LOG_FILE_PATH=./logs/agentcare.log

# Email Configuration (optional)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_mailtrap_user
SMTP_PASSWORD=your_mailtrap_password
EMAIL_FROM=noreply@agentcare.local

# AWS Configuration (optional)
AWS_REGION=us-west-2
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
S3_BUCKET=agentcare-dev-uploads

# Monitoring Configuration
ENABLE_METRICS=true
METRICS_PORT=9090
ENABLE_HEALTH_CHECKS=true

# Multi-tenant Configuration
DEFAULT_TENANT_SLUG=demo-hospital
TENANT_ISOLATION_STRICT=true
TENANT_CACHE_TTL=3600

# AI/LLM Configuration (optional)
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
AI_MODEL_PROVIDER=openai
AI_DEFAULT_MODEL=gpt-4

# Feature Flags
ENABLE_SWAGGER_UI=true
ENABLE_API_RATE_LIMITING=true
ENABLE_AUDIT_LOGGING=true
ENABLE_BULK_OPERATIONS=true
```

### 3. Production Environment (.env.production)

```bash
# Application Settings
NODE_ENV=production
PORT=3000
API_VERSION=v1

# Database Configuration (use production values)
DATABASE_URL=postgresql://username:password@prod-db-host:5432/agentcare_prod
DATABASE_SSL=true
DATABASE_POOL_MIN=5
DATABASE_POOL_MAX=50

# Security (use strong values)
JWT_SECRET=your-super-strong-production-jwt-secret-256-chars-long
BCRYPT_ROUNDS=14

# CORS (restrict to your domains)
CORS_ORIGIN=https://yourdomain.com,https://api.yourdomain.com
CORS_CREDENTIALS=true

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
LOG_FILE_ENABLED=true
LOG_FILE_PATH=/var/log/agentcare/agentcare.log

# Production email service
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_api_key
EMAIL_FROM=noreply@yourdomain.com

# Production AWS
AWS_REGION=us-west-2
S3_BUCKET=yourdomain-agentcare-prod

# Production monitoring
ENABLE_METRICS=true
METRICS_PORT=9090
SENTRY_DSN=your_sentry_dsn_for_error_tracking

# Disable dev features
ENABLE_SWAGGER_UI=false
LOG_SQL_QUERIES=false
```

## 🏃‍♂️ Running the Platform

### Development Mode

```bash
# Method 1: NPM Scripts
npm run dev              # Start development server with hot reload
npm run dev:backend      # Start only backend
npm run dev:frontend     # Start only frontend (if exists)

# Method 2: Direct Node.js
cd backend
npm run dev

# Method 3: Docker Development
docker-compose -f docker-compose.dev.yml up
```

### Production Mode

```bash
# Build the application
npm run build

# Start production server
npm run start

# Or with PM2 (recommended)
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Docker Production

```bash
# Build production image
docker build -t agentcare:latest .

# Run with docker-compose
docker-compose -f docker-compose.prod.yml up -d

# Or run individual container
docker run -d \
  --name agentcare-api \
  -p 3000:3000 \
  --env-file .env.production \
  agentcare:latest
```

### Service Management

```bash
# Check service status
npm run status

# View logs
npm run logs
npm run logs:backend
npm run logs:frontend

# Restart services
npm run restart

# Stop services
npm run stop
```

## 📚 API Documentation

### Accessing Swagger UI

Once the platform is running, access the comprehensive API documentation:

```bash
# Development
http://localhost:3000/api/docs

# Production
https://yourdomain.com/api/docs
```

### API Endpoints Overview

**Authentication:**
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh` - Refresh JWT token

**Organizations:**
- `POST /api/v1/organizations` - Create organization
- `GET /api/v1/organizations/{id}` - Get organization details
- `GET /api/v1/organizations/{id}/stats` - Get organization statistics

**Healthcare Providers:**
- `POST /api/v1/organizations/{id}/providers` - Register provider
- `GET /api/v1/organizations/{id}/providers` - List providers
- `POST /api/v1/organizations/{id}/bulk/providers` - Bulk register providers

**Patients:**
- `POST /api/v1/organizations/{id}/patients` - Register patient
- `GET /api/v1/organizations/{id}/patients` - List patients
- `POST /api/v1/organizations/{id}/patients/{id}/caregivers` - Add caregiver

**Appointments:**
- `POST /api/v1/organizations/{id}/appointments` - Create appointment
- `GET /api/v1/organizations/{id}/appointments` - List appointments
- `GET /api/v1/organizations/{id}/providers/{id}/availability` - Check availability

### Testing API with curl

```bash
# Health check
curl http://localhost:3000/health

# Create organization
curl -X POST http://localhost:3000/api/v1/organizations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Hospital",
    "type": "hospital",
    "address": {
      "street": "123 Test St",
      "city": "Test City",
      "state": "CA",
      "zip": "90210",
      "country": "USA"
    },
    "contactInfo": {
      "phone": "+1-555-0100",
      "email": "admin@test.com"
    },
    "adminUser": {
      "email": "admin@test.com",
      "name": "Test Admin"
    }
  }'
```

## 🧪 Testing Guide

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit               # Unit tests
npm run test:integration        # Integration tests
npm run test:security          # Security tests
npm run test:e2e               # End-to-end tests

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- --testPathPattern="OrganizationService"
```

### Test Database Setup

```bash
# Create test database
createdb agentcare_test

# Apply test schema
psql -d agentcare_test -f database/enhanced-multi-tenant-schema.sql

# Verify test database
npm run test:db
```

### Running Healthcare-Specific Tests

```bash
# HIPAA compliance tests
npm run test:hipaa

# Multi-tenant isolation tests
npm run test:isolation

# Performance tests
npm run test:performance

# Medical workflow tests
npm run test:workflows
```

## 🚀 Production Deployment

### Docker Production Deployment

```bash
# 1. Build production image
docker build -t agentcare:latest .

# 2. Create production docker-compose.yml
cat > docker-compose.prod.yml << EOF
version: '3.8'
services:
  app:
    image: agentcare:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: agentcare_prod
      POSTGRES_USER: agentcare
      POSTGRES_PASSWORD: \${DATABASE_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/enhanced-multi-tenant-schema.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass \${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
EOF

# 3. Deploy
docker-compose -f docker-compose.prod.yml up -d
```

### Kubernetes Deployment

```bash
# 1. Create namespace
kubectl create namespace agentcare

# 2. Apply configurations
kubectl apply -f k8s/

# 3. Check deployment
kubectl get pods -n agentcare
kubectl get services -n agentcare
```

### Cloud Provider Deployment

**AWS (using ECS):**
```bash
# Deploy to AWS ECS
aws ecs create-cluster --cluster-name agentcare-prod
aws ecs create-service --cli-input-json file://aws-ecs-service.json
```

**Google Cloud (using Cloud Run):**
```bash
# Deploy to Google Cloud Run
gcloud run deploy agentcare --image gcr.io/project-id/agentcare:latest --platform managed
```

**Azure (using Container Instances):**
```bash
# Deploy to Azure Container Instances
az container create --resource-group agentcare-rg --name agentcare --image agentcare:latest
```

### SSL/TLS Configuration

```bash
# 1. Generate SSL certificates (Let's Encrypt)
sudo apt install certbot
sudo certbot certonly --standalone -d yourdomain.com

# 2. Configure Nginx
cat > nginx.conf << EOF
server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    location / {
        proxy_pass http://app:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF
```

## 🐛 Troubleshooting

### Common Issues

**1. Database Connection Issues**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check database connectivity
psql -h localhost -U agentcare -d agentcare_dev -c "SELECT 1;"

# Check database logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

**2. Port Already in Use**
```bash
# Find process using port 3000
lsof -i :3000
netstat -tulpn | grep :3000

# Kill process
kill -9 <PID>

# Use different port
PORT=3001 npm run dev
```

**3. Node.js Version Issues**
```bash
# Check Node.js version
node --version

# Use Node Version Manager (nvm)
nvm install 18
nvm use 18
nvm alias default 18
```

**4. Permission Issues**
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Fix Docker permissions
sudo usermod -aG docker $USER
newgrp docker
```

**5. Memory Issues**
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max_old_space_size=4096"

# Check memory usage
free -h
top -p $(pgrep node)
```

### Debug Mode

```bash
# Enable debug logging
DEBUG=agentcare:* npm run dev

# Enable SQL query logging
LOG_SQL_QUERIES=true npm run dev

# Enable verbose error logging
LOG_LEVEL=debug npm run dev
```

### Health Checks

```bash
# Application health
curl http://localhost:3000/health

# Database health
curl http://localhost:3000/health/db

# Comprehensive system check
npm run health:check
```

### Log Analysis

```bash
# View application logs
tail -f logs/agentcare.log

# View error logs
tail -f logs/error.log

# Search logs for specific errors
grep "ERROR" logs/agentcare.log | tail -20

# Analyze API response times
grep "response_time" logs/agentcare.log | awk '{print $NF}' | sort -n
```

## 📊 Monitoring & Maintenance

### Application Monitoring

**1. Health Monitoring**
```bash
# Setup monitoring script
cat > scripts/health-monitor.sh << EOF
#!/bin/bash
while true; do
    if ! curl -f http://localhost:3000/health > /dev/null 2>&1; then
        echo "$(date): AgentCare is down" >> /var/log/agentcare-monitor.log
        # Restart application
        pm2 restart agentcare
    fi
    sleep 30
done
EOF

chmod +x scripts/health-monitor.sh
nohup ./scripts/health-monitor.sh &
```

**2. Performance Monitoring**
```bash
# Setup Prometheus metrics
curl http://localhost:9090/metrics

# Setup Grafana dashboard
docker run -d -p 3001:3000 grafana/grafana
```

### Database Maintenance

```bash
# Database backups
pg_dump -h localhost -U agentcare agentcare_dev > backup_$(date +%Y%m%d).sql

# Restore database
psql -h localhost -U agentcare agentcare_dev < backup_20240115.sql

# Vacuum and analyze
psql -h localhost -U agentcare -d agentcare_dev -c "VACUUM ANALYZE;"

# Check database size
psql -h localhost -U agentcare -d agentcare_dev -c "
SELECT pg_size_pretty(pg_database_size('agentcare_dev'));"
```

### Log Rotation

```bash
# Setup logrotate
sudo cat > /etc/logrotate.d/agentcare << EOF
/var/log/agentcare/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 agentcare agentcare
    postrotate
        pm2 reload agentcare
    endscript
}
EOF
```

### Security Updates

```bash
# Update dependencies
npm audit
npm audit fix

# Update Docker images
docker pull postgres:14
docker pull redis:7-alpine
docker-compose up -d

# Security scan
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image agentcare:latest
```

### Performance Optimization

```bash
# Database optimization
psql -h localhost -U agentcare -d agentcare_dev << EOF
-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM users WHERE organization_id = 'uuid';

-- Update statistics
ANALYZE;

-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
EOF

# Application optimization
# Enable clustering
pm2 start ecosystem.config.js --instances max

# Memory profiling
node --inspect backend/src/index.js
```

## 🎯 Production Checklist

### Pre-Deployment Checklist

- [ ] **Environment Variables**
  - [ ] All production environment variables set
  - [ ] Secrets properly configured
  - [ ] Database URLs updated
  - [ ] SSL certificates installed

- [ ] **Security Configuration**
  - [ ] CORS properly configured
  - [ ] Rate limiting enabled
  - [ ] JWT secrets updated
  - [ ] SQL injection protection verified

- [ ] **Database Setup**
  - [ ] Production database created
  - [ ] Schema applied
  - [ ] Backups configured
  - [ ] Connection pooling configured

- [ ] **Monitoring & Logging**
  - [ ] Log aggregation setup
  - [ ] Error tracking (Sentry) configured
  - [ ] Performance monitoring enabled
  - [ ] Health checks implemented

- [ ] **Testing**
  - [ ] All tests passing
  - [ ] Security tests validated
  - [ ] Load testing completed
  - [ ] HIPAA compliance verified

### Post-Deployment Checklist

- [ ] **Verification**
  - [ ] Application accessible
  - [ ] API endpoints responding
  - [ ] Database connectivity verified
  - [ ] SSL certificates working

- [ ] **Monitoring**
  - [ ] Logs being generated
  - [ ] Metrics being collected
  - [ ] Alerts configured
  - [ ] Health checks working

- [ ] **Documentation**
  - [ ] Deployment documented
  - [ ] Runbook updated
  - [ ] Team notified
  - [ ] Rollback plan ready

## 🆘 Support & Resources

### Getting Help

- **Documentation**: [https://docs.agentcare.com](https://docs.agentcare.com)
- **GitHub Issues**: [https://github.com/yourusername/agentcare/issues](https://github.com/yourusername/agentcare/issues)
- **Community Forum**: [https://community.agentcare.com](https://community.agentcare.com)
- **Email Support**: support@agentcare.com

### Useful Commands Reference

```bash
# Quick start
docker-compose up -d

# Development
npm run dev

# Testing
npm test

# Production build
npm run build && npm start

# Health check
curl http://localhost:3000/health

# View logs
docker-compose logs -f

# Database backup
pg_dump agentcare_dev > backup.sql

# Reset database
npm run db:reset

# Run migrations
npm run db:migrate

# Generate API key
npm run generate:api-key
```

---

**🏥 AgentCare Platform Setup Complete!**

*You're now ready to deploy and manage a world-class healthcare SaaS platform with enterprise-grade security and HIPAA compliance.*

For additional support or custom deployment assistance, please contact our team at support@agentcare.com. 