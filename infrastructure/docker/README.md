# 🐳 AgentCare Docker Infrastructure

**Containerized deployment for AgentCare healthcare scheduling platform with separate frontend and backend services**

## 📁 File Structure

```
infrastructure/docker/
├── README.md                    # This file
├── Dockerfile                   # Main monorepo Dockerfile (multi-stage)
├── Dockerfile.backend          # Backend-specific Dockerfile  
├── Dockerfile.frontend         # Frontend-specific Dockerfile
├── docker-compose.yml          # Development services
├── docker-compose.prod.yml     # Production services
├── docker-compose.override.yml # Local overrides
├── nginx.conf                  # Nginx configuration for frontend
├── redis.conf                  # Redis configuration
├── .dockerignore               # Main Docker ignore
├── .dockerignore.backend       # Backend-specific ignores
└── .dockerignore.frontend      # Frontend-specific ignores
```

## 🚀 Quick Start

### Development Environment

```bash
# From project root
npm run docker:compose

# Or from this directory
docker-compose up --build
```

### Production Environment

```bash
# From project root
npm run docker:prod

# Or from this directory
docker-compose -f docker-compose.prod.yml up --build
```

## 🏗️ Architecture Overview

### Monorepo Structure
- **Frontend**: React + Vite application
- **Backend**: Node.js + Express API with multi-agent system
- **Shared**: Database, scripts, and configuration files

### Container Services
- **🤖 Ollama**: LLM service (Qwen2.5, DeepSeek-R1)
- **🗄️ PostgreSQL**: Primary database with pgvector
- **⚡ Redis**: Caching and session storage
- **🔧 Backend**: AgentCare API service
- **🖥️ Frontend**: React UI served by Nginx
- **🔧 pgAdmin**: Database management (dev only)
- **📊 Redis Commander**: Redis management (dev only)

## 📦 Dockerfile Architecture

### 1. Main Dockerfile (`Dockerfile`)
Multi-stage build supporting both frontend and backend:

```dockerfile
# Build stages
FROM node:18-alpine AS base              # Common base
FROM base AS backend-build               # Backend build
FROM base AS frontend-build              # Frontend build

# Production stages  
FROM node:18-alpine AS backend-production   # Backend runtime
FROM nginx:alpine AS frontend-production   # Frontend with Nginx

# Development stage
FROM base AS development                 # Development mode
```

### 2. Backend Dockerfile (`Dockerfile.backend`)
Dedicated backend container:

```dockerfile
FROM node:18-alpine AS build            # Build stage
FROM node:18-alpine AS production       # Production runtime
FROM node:18-alpine AS development      # Development mode
```

**Features:**
- Multi-stage build optimization
- Non-root user security
- Health checks
- Signal handling with tini
- Production and development targets

### 3. Frontend Dockerfile (`Dockerfile.frontend`)
Dedicated frontend container:

```dockerfile
FROM node:18-alpine AS build            # Build React app
FROM nginx:alpine AS production         # Serve with Nginx
FROM node:18-alpine AS development      # Vite dev server
FROM node:18-alpine AS static-server    # Alternative to Nginx
```

**Features:**
- Nginx production serving
- Vite development server
- Static file serving option
- Security hardening
- Health checks

## 🛠️ Build Commands

### Individual Service Builds

```bash
# Backend only
npm run docker:build:backend
docker run -p 3000:3000 --env-file .env agentcare-backend:latest

# Frontend only  
npm run docker:build:frontend
docker run -p 3001:80 agentcare-frontend:latest

# Full monorepo
npm run docker:build
docker run -p 3000:3000 --env-file .env agentcare:latest
```

### Development vs Production

```bash
# Development (with hot reload)
docker build -f Dockerfile.backend --target development -t agentcare-backend:dev .
docker build -f Dockerfile.frontend --target development -t agentcare-frontend:dev .

# Production (optimized)
docker build -f Dockerfile.backend --target production -t agentcare-backend:prod .
docker build -f Dockerfile.frontend --target production -t agentcare-frontend:prod .
```

## 🔧 Docker Compose Services

### Core Services

```yaml
services:
  # AI/LLM Services
  ollama:           # Ollama LLM (port 11434)
  
  # Data Services  
  postgres:         # PostgreSQL + pgvector (port 5432)
  redis:           # Redis cache (port 6379)
  
  # Application Services
  backend:         # Node.js API (port 3000)
  frontend:        # React UI (port 3001)
  
  # Development Tools (profile: tools)
  pgadmin:         # Database admin (port 5050)
  redis-commander: # Redis admin (port 8081)
```

### Service Dependencies

<div class="mermaid">
graph TD
    Frontend[🖥️ Frontend<br/>React UI]
    Backend[🔧 Backend<br/>API Server]
    Postgres[(🗄️ PostgreSQL<br/>Database)]
    Redis[(⚡ Redis<br/>Cache)]
    Ollama[🤖 Ollama<br/>LLM Service]
    
    Frontend --> Backend
    Backend --> Postgres
    Backend --> Redis  
    Backend --> Ollama
    
    classDef frontend fill:#61dafb,stroke:#000,color:#000
    classDef backend fill:#339933,stroke:#000,color:#fff
    classDef database fill:#336791,stroke:#000,color:#fff
    classDef cache fill:#dc382d,stroke:#000,color:#fff
    classDef ai fill:#ff6b6b,stroke:#000,color:#fff
    
    class Frontend frontend
    class Backend backend
    class Postgres database
    class Redis cache
    class Ollama ai
</div>

## 🌐 Network & Ports

### Port Mapping
- **3000**: Backend API
- **3001**: Frontend UI  
- **5432**: PostgreSQL
- **6379**: Redis
- **11434**: Ollama LLM
- **5050**: pgAdmin (dev)
- **8081**: Redis Commander (dev)
- **9090**: Metrics (backend)
- **9229**: Debug port (backend dev)

### Health Checks
All services include health checks:

```bash
# Check individual service health
curl http://localhost:3000/health     # Backend
curl http://localhost:3001/           # Frontend
curl http://localhost:11434/api/tags  # Ollama
```

## 📊 Environment Configuration

### Backend Environment
```bash
NODE_ENV=development
DATABASE_URL=postgresql://agentcare:agentcare_dev@postgres:5432/agentcare_dev
REDIS_URL=redis://:agentcare_redis_dev@redis:6379/0
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_MODEL=qwen2.5:latest
ENABLE_OLLAMA_LLM=true
ENABLE_RAG_SYSTEM=true
```

### Frontend Environment
```bash
NODE_ENV=development
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_TITLE=AgentCare - AI Healthcare Scheduling
VITE_APP_VERSION=3.0.0
```

## 🔒 Security Features

### Non-Root Containers
All production containers run as non-root user `agentcare:1001`

### Image Security
- Minimal Alpine Linux base images
- No unnecessary packages
- Regular security updates
- Multi-stage builds to reduce attack surface

### Network Security
- Internal Docker network (`agentcare-network`)
- Only necessary ports exposed
- Environment-based secrets

## 📈 Production Deployment

### Production Docker Compose

```bash
# Production deployment
docker-compose -f docker-compose.prod.yml up -d

# With scaling
docker-compose -f docker-compose.prod.yml up -d --scale backend=3 --scale frontend=2
```

### Health Monitoring

```bash
# Check all services
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Resource usage
docker stats
```

## 🧪 Development Workflow

### Development Commands

```bash
# Start development environment
npm run docker:dev

# View logs
docker-compose logs -f

# Rebuild specific service
docker-compose up --build backend
docker-compose up --build frontend

# Shell access
docker-compose exec backend sh
docker-compose exec frontend sh
```

### Volume Mounts (Development)
- Source code mounted for hot reload
- Node modules in named volumes for performance
- Logs and data persisted

## 🔧 Troubleshooting

### Common Issues

**Build Failures:**
```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

**Port Conflicts:**
```bash
# Check port usage
lsof -i :3000
lsof -i :3001

# Kill conflicting processes
npm run kill-port
```

**Volume Issues:**
```bash
# Reset volumes
docker-compose down -v
docker volume prune
```

### Debug Commands

```bash
# Service status
docker-compose ps

# Container inspection
docker inspect agentcare-backend
docker inspect agentcare-frontend

# Network inspection
docker network ls
docker network inspect docker_agentcare-network
```

## 📚 Additional Resources

- [Docker Best Practices](../../docs/operations/docker-guide.md)
- [AgentCare Architecture](../../docs/architecture/architecture-guide.md)
- [Development Setup](../../docs/setup/setup-guide.md)
- [Production Deployment](../../docs/operations/devops-guide.md)

---

**🐳 Enterprise Docker Infrastructure**  
*Scalable, secure, and production-ready containerization for healthcare AI systems* 