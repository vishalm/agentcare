# 🐳 AgentCare Docker Guide

## Multi-Agent Healthcare Scheduling System with Ollama LLM Integration

This guide covers the complete Docker setup for AgentCare, including development, production deployment, monitoring, and troubleshooting.

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [System Requirements](#-system-requirements)
- [Services Overview](#-services-overview)
- [Environment Configuration](#-environment-configuration)
- [Development Setup](#-development-setup)
- [Production Deployment](#-production-deployment)
- [Monitoring & Observability](#-monitoring--observability)
- [Troubleshooting](#-troubleshooting)
- [Advanced Configuration](#-advanced-configuration)

## 🚀 Quick Start

### Automated Setup (Recommended)
```bash
# One-command setup with all services
./docker-quick-start.sh

# Custom options
./docker-quick-start.sh --clean      # Clean restart
./docker-quick-start.sh --production # Production mode
./docker-quick-start.sh --status     # Check status
./docker-quick-start.sh --help       # Show all options
```

### Manual Setup
```bash
# Clone and setup environment
git clone <repository-url>
cd agentcare
cp env.example .env

# Start all services
docker-compose up -d

# Check status
docker-compose ps
```

## 💻 System Requirements

### Minimum Requirements
- **Docker**: 20.10+ with Docker Compose v2
- **Memory**: 8GB RAM (4GB minimum)
- **Storage**: 20GB free disk space
- **Network**: Ports 3000, 3001, 5432, 6379, 11434 available

### Recommended for Ollama
- **Memory**: 16GB+ RAM for optimal LLM performance
- **CPU**: 4+ cores (x86_64 or ARM64)
- **GPU**: NVIDIA GPU with CUDA support (optional, for acceleration)

### Platform Support
- ✅ Linux (Ubuntu 20.04+, CentOS 8+)
- ✅ macOS (Intel/Apple Silicon)
- ✅ Windows (WSL2 required)

## 🏗️ Services Overview

### Core Services

| Service | Container | Port | Description |
|---------|-----------|------|-------------|
| **Ollama** | `agentcare-ollama` | 11434 | LLM inference engine with Qwen2.5 |
| **Backend** | `agentcare-backend` | 3000 | Node.js API with multi-agent system |
| **Frontend** | `agentcare-frontend` | 3001 | React TypeScript UI |
| **PostgreSQL** | `agentcare-postgres` | 5432 | Primary database |
| **Redis** | `agentcare-redis` | 6379 | Cache and session store |

### Optional Services

| Service | Container | Port | Description |
|---------|-----------|------|-------------|
| **Nginx** | `agentcare-nginx` | 80/443 | Reverse proxy and load balancer |
| **pgAdmin** | `agentcare-pgadmin` | 5050 | Database management UI |
| **Prometheus** | `agentcare-prometheus` | 9091 | Metrics collection |
| **Grafana** | `agentcare-grafana` | 3002 | Metrics visualization |

## ⚙️ Environment Configuration

### Core Environment Variables

```bash
# Application
NODE_ENV=development
API_PORT=3000
LOG_LEVEL=debug

# Database
POSTGRES_DB=agentcare_dev
POSTGRES_USER=agentcare
POSTGRES_PASSWORD=secure_password_here
DATABASE_URL=postgresql://agentcare:password@postgres:5432/agentcare_dev

# Redis
REDIS_PASSWORD=secure_redis_password
REDIS_URL=redis://:password@redis:6379/0

# Ollama LLM
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_MODEL=qwen2.5:latest
ENABLE_OLLAMA_LLM=true
OLLAMA_NUM_PARALLEL=2
OLLAMA_MAX_LOADED_MODELS=1

# Security
JWT_SECRET=your-super-secure-jwt-secret
SESSION_SECRET=your-session-secret
PASSWORD_SALT_ROUNDS=12

# Multi-Agent System
ENABLE_RAG_SYSTEM=true
ENABLE_USER_REGISTRATION=true
ENABLE_RATE_LIMITING=true
API_RATE_LIMIT=100
API_RATE_WINDOW=900000

# HIPAA Compliance
HIPAA_LOGGING=true
AUDIT_LOG_RETENTION_DAYS=2555
```

### Frontend Environment Variables

```bash
# Frontend Configuration
VITE_API_BASE_URL=http://localhost:3000
VITE_ENABLE_MOCK_API=false
VITE_APP_TITLE=AgentCare - AI Healthcare Scheduling
VITE_APP_VERSION=2.0.0
```

## 🛠️ Development Setup

### Starting Development Environment

```bash
# Start all development services
docker-compose up -d

# Or start specific services
docker-compose up -d ollama postgres redis  # Core services
docker-compose up -d backend frontend       # Application services
```

### Development Workflow

```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f ollama

# Restart specific service
docker-compose restart backend

# Rebuild and restart
docker-compose up -d --build backend

# Access containers
docker-compose exec backend bash
docker-compose exec postgres psql -U agentcare agentcare_dev
```

### Hot Reloading

Development containers support hot reloading:
- **Backend**: TypeScript files watched via `tsx`
- **Frontend**: Vite dev server with HMR
- **Volumes**: Source code mounted for real-time updates

## 🚀 Production Deployment

### Production Docker Compose

```bash
# Use production configuration
docker-compose -f docker-compose.prod.yml up -d

# Or use the script
./docker-quick-start.sh --production
```

### Production Environment Setup

```bash
# Create production environment file
cp env.example .env.prod

# Set production values
NODE_ENV=production
ENABLE_SWAGGER_UI=false
LOG_LEVEL=info
ENABLE_USER_REGISTRATION=false
API_RATE_LIMIT=50

# Use strong passwords
POSTGRES_PASSWORD=$(openssl rand -hex 32)
REDIS_PASSWORD=$(openssl rand -hex 32)
JWT_SECRET=$(openssl rand -hex 64)
SESSION_SECRET=$(openssl rand -hex 64)
```

### SSL/TLS Configuration

```bash
# Generate SSL certificates
mkdir -p ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/agentcare.key -out ssl/agentcare.crt

# Update nginx configuration
docker-compose --profile proxy up -d nginx
```

### Resource Limits

Production containers include resource limits:

```yaml
# Example resource configuration
deploy:
  resources:
    limits:
      memory: 8G      # Ollama
      cpus: '4'
    reservations:
      memory: 4G
      cpus: '2'
```

## 📊 Monitoring & Observability

### Enable Monitoring Stack

```bash
# Start monitoring services
docker-compose --profile monitoring up -d prometheus grafana

# Access monitoring
open http://localhost:9091  # Prometheus
open http://localhost:3002  # Grafana (admin/admin)
```

### Health Checks

All services include health checks:

```bash
# Check service health
docker-compose ps
curl http://localhost:3000/health
curl http://localhost:11434/api/tags
curl http://localhost:3001/health
```

### Log Management

```bash
# View aggregated logs
docker-compose logs -f

# Filter by service
docker-compose logs -f backend | grep ERROR
docker-compose logs -f ollama | grep "model loaded"

# Log rotation (production)
# Configured in docker-compose.prod.yml with JSON driver
```

### Metrics Collection

Key metrics monitored:
- **Agent Performance**: Response times, success rates
- **Ollama Usage**: Model loading, inference time
- **Database**: Connection pool, query performance
- **System**: CPU, memory, disk usage

## 🔧 Troubleshooting

### Common Issues

#### Ollama Not Starting
```bash
# Check Ollama logs
docker-compose logs ollama

# Common solutions
docker-compose restart ollama
docker system prune -f
docker volume prune -f

# Verify model download
docker-compose exec ollama ollama list
```

#### Backend Connection Issues
```bash
# Check database connection
docker-compose exec postgres pg_isready -U agentcare

# Check Redis connection
docker-compose exec redis redis-cli ping

# Test Ollama connection
curl http://localhost:11434/api/tags
```

#### Frontend Build Issues
```bash
# Rebuild frontend
docker-compose build --no-cache frontend

# Check Vite configuration
docker-compose exec frontend npm run build

# Verify environment variables
docker-compose exec frontend env | grep VITE
```

### Performance Optimization

#### Ollama Performance
```bash
# Increase parallel processing
OLLAMA_NUM_PARALLEL=4
OLLAMA_MAX_LOADED_MODELS=2

# Enable GPU support (if available)
docker-compose -f docker-compose.gpu.yml up -d ollama
```

#### Database Performance
```bash
# Tune PostgreSQL
# Edit docker-compose.yml postgres command section
-c shared_buffers=512MB
-c effective_cache_size=1536MB
-c maintenance_work_mem=128MB
```

### Debug Mode

```bash
# Enable debug logging
LOG_LEVEL=debug
DEBUG=agentcare:*

# Start with debug port
docker-compose up -d backend
# Attach debugger to port 9229
```

## 🔐 Security Considerations

### Network Security
- Services communicate via internal Docker network
- Only necessary ports exposed to host
- Production services bind to localhost only

### Data Protection
- PostgreSQL with row-level security (RLS)
- Redis authentication enabled
- Environment variables for secrets
- Volume encryption recommended for production

### HIPAA Compliance
- Audit logging enabled by default
- Data retention policies configured
- Access controls via JWT authentication
- Secure communication between services

## 🔄 Backup & Recovery

### Database Backup
```bash
# Enable backup service
docker-compose --profile backup up -d backup

# Manual backup
docker-compose exec postgres pg_dump -U agentcare agentcare_dev > backup.sql

# Restore from backup
docker-compose exec -T postgres psql -U agentcare agentcare_dev < backup.sql
```

### Volume Management
```bash
# List volumes
docker volume ls | grep agentcare

# Backup volumes
docker run --rm -v agentcare-postgres-data:/data -v $(pwd):/backup \
  alpine tar czf /backup/postgres-backup.tar.gz -C /data .

# Restore volumes
docker run --rm -v agentcare-postgres-data:/data -v $(pwd):/backup \
  alpine tar xzf /backup/postgres-backup.tar.gz -C /data
```

## ⚡ Advanced Configuration

### Custom Ollama Models

```bash
# Add custom model to Ollama
docker-compose exec ollama ollama pull custom-model:latest

# Update environment
OLLAMA_MODEL=custom-model:latest
```

### Multi-Node Deployment

```bash
# Use Docker Swarm for multi-node
docker swarm init
docker stack deploy -c docker-compose.prod.yml agentcare
```

### CI/CD Integration

```yaml
# Example GitHub Actions workflow
name: Deploy AgentCare
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy with Docker Compose
        run: |
          docker-compose -f docker-compose.prod.yml up -d
          ./docker-quick-start.sh --status
```

## 📞 Support

### Getting Help
- **Documentation**: Check other guides in `/docs`
- **Logs**: Always check service logs first
- **Health Checks**: Use built-in health endpoints
- **Community**: See project README for community links

### Reporting Issues
Include this information when reporting issues:
```bash
# System information
docker version
docker-compose version
./docker-quick-start.sh --status

# Service logs
docker-compose logs backend > logs.txt
```

---

## 🎯 Quick Commands Reference

```bash
# Setup
./docker-quick-start.sh              # Full setup
./docker-quick-start.sh --clean      # Clean restart
./docker-quick-start.sh --production # Production mode

# Management
docker-compose up -d                 # Start all services
docker-compose down                  # Stop all services
docker-compose restart backend       # Restart service
docker-compose logs -f backend       # View logs

# Development
docker-compose exec backend bash     # Access backend container
docker-compose exec postgres psql -U agentcare agentcare_dev
docker-compose exec ollama ollama list

# Monitoring
curl http://localhost:3000/health    # Backend health
curl http://localhost:11434/api/tags # Ollama status
docker-compose ps                    # Service status

# Cleanup
docker-compose down -v --remove-orphans  # Full cleanup
docker system prune -a                   # Remove unused images
```

Happy containerizing! 🐳🏥 