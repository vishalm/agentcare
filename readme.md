# 🏥 AgentCare - Multi-Agent Healthcare Scheduling System

**Enterprise-grade multi-agent healthcare scheduling platform with AI-powered coordination, full observability stack, and production-ready Docker infrastructure**

[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Version](https://img.shields.io/badge/Version-3.0.0--beta-orange.svg)]()
[![HIPAA](https://img.shields.io/badge/HIPAA-Compliant-green.svg)]()
[![Multi-Tenant](https://img.shields.io/badge/Multi--Tenant-Healthcare-blue.svg)]()
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)]()
[![Observability](https://img.shields.io/badge/Observability-Complete-green.svg)]()
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live%20Demo-blue.svg)](https://vishalm.github.io/agentcare/)

## 🚀 One-Command Setup

```bash
# Complete development environment with full observability stack
chmod +x docker-dev.sh && ./docker-dev.sh start
```

### 🌐 Access Points (Development)
- **🖥️ Frontend**: http://localhost:3001 (React/TypeScript with HMR)
- **🔧 Backend API**: http://localhost:3000 (Node.js/Express with live reload)
- **📚 API Documentation**: http://localhost:3000/api/v1 (Swagger UI)
- **🤖 Ollama LLM**: http://localhost:11434 (Local AI inference)

### 📊 Observability & Monitoring
- **📈 Grafana**: http://localhost:3002 (admin/admin) - Metrics visualization
- **🔍 Prometheus**: http://localhost:9090 - Metrics collection
- **🔎 Jaeger**: http://localhost:16686 - Distributed tracing
- **📋 Kibana**: http://localhost:5601 - Log analysis
- **🔧 Elasticsearch**: http://localhost:9200 - Search engine

### 🛠️ Development Tools
- **🗄️ pgAdmin**: http://localhost:5050 (admin@agentcare.local/admin)
- **💾 Redis Commander**: http://localhost:8081 (admin/admin)
- **📧 Mailhog**: http://localhost:8025 - Email testing
- **📦 MinIO Console**: http://localhost:9001 (agentcare/agentcare123) - S3 storage

### Demo Credentials
All demo accounts use password: **`AgentCare2024!`**
- **Admin**: `admin@agentcare.dev`
- **Doctor**: `doctor@agentcare.dev` 
- **Patient**: `patient@agentcare.dev`

## 🏗️ Modern Architecture

### Multi-Agent AI System
**AgentCare implements a sophisticated coordination architecture:**

- **🧠 Supervisor Agent** - Intelligent routing and task orchestration
- **📅 Availability Agent** - Schedule optimization and conflict resolution  
- **📝 Booking Agent** - Appointment creation and confirmation workflows
- **❓ FAQ Agent** - Healthcare knowledge base and patient support
- **🔄 Planner Layer** - Multi-agent coordination and finish processing
- **🛠️ Tooling Layer** - Specialized tools for each agent with activation tracking

### Backend Architecture (Modernized)
**Transitioned from monolithic to modular design:**
- **`app.ts`** - Express application configuration
- **`server.ts`** - Server initialization and lifecycle
- **Middleware Stack** - JWT auth, CORS, security, rate limiting
- **Agent Coordination** - Promise-based multi-agent processing
- **Health Monitoring** - Comprehensive system diagnostics

### Infrastructure Stack
```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   React/TS      │  │  Node.js/TS     │  │   PostgreSQL    │
│   Frontend      │  │   Backend       │  │   + pgvector    │
│   (Port 3001)   │  │  (Port 3000)    │  │   (Port 5432)   │
└─────────────────┘  └─────────────────┘  └─────────────────┘
        │                      │                      │
        │              ┌───────┴───────┐             │
        │              │     Redis     │             │
        │              │     Cache     │             │
        │              │  (Port 6379)  │             │
        │              └───────────────┘             │
        │                                            │
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│     Ollama      │  │   Prometheus    │  │    Grafana      │
│   LLM Service   │  │    Metrics      │  │   Dashboards    │
│  (Port 11434)   │  │  (Port 9090)    │  │  (Port 3002)    │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

## 🎯 Key Features

### Healthcare-Specific
- **🏥 Multi-Organization Support** - Hospitals, clinics, specialty centers
- **👨‍⚕️ Provider Management** - Licensing, credentialing, specialties  
- **📅 AI-Powered Scheduling** - Intelligent appointment optimization
- **🔐 Data Isolation** - Complete tenant separation and security
- **📋 HIPAA Compliance** - Healthcare data protection by design
- **👥 24+ User Types** - Complete healthcare ecosystem support

### AI & Technology
- **🤖 Multi-Agent Coordination** - Intelligent task distribution
- **🧠 Ollama LLM Integration** - Local Qwen2.5 model with retry mechanisms
- **📚 RAG System** - Conversational context and knowledge base
- **🗄️ Vector Database** - PostgreSQL with pgvector for AI search
- **⚡ Real-Time Processing** - Sub-second agent responses
- **🔄 Retry Logic** - Exponential backoff for service reliability

### Production-Ready Infrastructure
- **🐳 Docker Containerization** - Complete development environment
- **📊 Full Observability** - Metrics, logs, traces, and monitoring
- **🔍 Health Monitoring** - Comprehensive system diagnostics
- **🧪 Testing Framework** - 3,115+ lines of comprehensive tests
- **☸️ Cloud-Native** - Kubernetes-ready infrastructure
- **💾 Storage Solutions** - S3-compatible MinIO integration

## 🏥 What You Get

### Core Healthcare Platform
- **Multi-Tenant Architecture** - Support for multiple healthcare organizations
- **Intelligent Agent Coordination** - AI-powered appointment scheduling
- **HIPAA Compliance** - Built-in audit trails and data protection
- **Complete User Ecosystem** - 24+ healthcare user types supported
- **Vector-Powered Search** - AI-enhanced patient and provider matching

### Development Environment
- **🔄 Live Reloading** - Frontend HMR and backend auto-restart
- **📊 Full Observability** - Prometheus + Grafana + Jaeger + ELK stack
- **🛠️ Developer Tools** - pgAdmin, Redis Commander, email testing
- **💾 Persistent Storage** - S3-compatible object storage with MinIO
- **🗄️ Vector Database** - PostgreSQL with pgvector for AI operations

### Observability & Monitoring
- **📈 Metrics Collection** - Application, database, and system metrics
- **📋 Structured Logging** - JSON logs with request tracing
- **🔍 Distributed Tracing** - Cross-service request tracking
- **🚨 Health Checks** - Automated service monitoring
- **📊 Pre-built Dashboards** - Performance and business metrics

## ⚡ Development Commands

### Environment Management
```bash
# Quick start development environment
./docker-dev.sh dev                    # Core services only
./docker-dev.sh start                  # All services + observability

# Service management
./docker-dev.sh start-backend          # Backend services only
./docker-dev.sh start-frontend         # Frontend service only
./docker-dev.sh start-observability    # Monitoring stack
./docker-dev.sh start-tools            # Development tools

# Utilities
./docker-dev.sh logs [service]         # View logs
./docker-dev.sh shell [service]        # Container shell access
./docker-dev.sh health                 # System health check
./docker-dev.sh status                 # Service status
```

### Traditional Docker Commands
```bash
# Core operations
docker-compose -f docker-compose.dev.yml up -d    # Start all
docker-compose -f docker-compose.dev.yml down     # Stop all
docker-compose -f docker-compose.dev.yml logs -f  # Follow logs

# Service management
docker-compose restart backend          # Restart backend
docker-compose exec backend bash        # Backend shell
docker-compose exec postgres psql -U agentcare agentcare_dev

# Health monitoring
curl http://localhost:3000/health       # Backend health
curl http://localhost:11434/api/tags    # Ollama status
```

## 🛠️ System Requirements

### Minimum Development Setup
- **Docker & Docker Compose** - Container orchestration
- **8GB RAM** (16GB recommended for Ollama LLM)
- **20GB free disk space** - For containers and volumes
- **Available ports**: 3000, 3001, 5432, 6379, 9090, 11434, and others

### Production Deployment
- **Node.js 18+** - Backend runtime
- **PostgreSQL 14+** - Database with pgvector extension
- **Redis 7+** - Cache and session storage
- **SSL/TLS certificates** - HTTPS encryption
- **Reverse proxy** - Load balancing and security

## 📚 Documentation

**📖 [Complete Documentation →](docs/README.md)**

### Quick Access Guides
- **[🚀 Setup Guide](docs/setup/SETUP_GUIDE.md)** - Installation and configuration
- **[🐳 Docker Guide](DOCKER_SETUP.md)** - Complete development environment
- **[🩺 System Inspector](docs/operations/INSPECTOR_GUIDE.md)** - Health monitoring
- **[⚡ Quick Reference](docs/setup/QUICK_REFERENCE.md)** - Command shortcuts
- **[🎯 Demo Guide](docs/setup/DEMO_GUIDE.md)** - Complete walkthrough

### 🌐 GitHub Pages & Live Demo

**🔗 [Live Demo](https://vishalm.github.io/agentcare/)** - Production deployment on GitHub Pages

AgentCare is deployed automatically via GitHub Pages for demonstration and testing purposes.

#### Features Available on GitHub Pages:
- **📱 Responsive Frontend** - Full React/TypeScript application
- **🤖 Demo AI Agents** - Simulated multi-agent coordination
- **📋 Interactive Documentation** - Complete API reference
- **🎯 Healthcare Scenarios** - Pre-loaded demo data
- **📊 Live Dashboards** - Real-time metrics visualization

#### Deployment Pipeline:
```bash
# Automatic deployment on main branch push
✅ Build Process     → React production build
✅ Asset Optimization → Minified CSS/JS bundles  
✅ GitHub Actions    → CI/CD pipeline execution
✅ Pages Deployment  → Automatic site update
✅ CDN Distribution  → Global edge caching
```

#### Repository Settings for GitHub Pages:
1. **Source**: Deploy from `gh-pages` branch
2. **Custom Domain**: `agentcare.dev` (optional)
3. **HTTPS**: Enforced for security
4. **Build Process**: GitHub Actions workflow

#### Local GitHub Pages Testing:
```bash
# Build production version locally
npm run build

# Serve production build
npx serve -s build -l 4000

# Test GitHub Pages deployment
npm run deploy:pages
```

#### GitHub Pages Configuration Files:
- **`.github/workflows/pages.yml`** - Deployment automation
- **`package.json`** - Build and deployment scripts  
- **`public/CNAME`** - Custom domain configuration
- **`public/404.html`** - SPA routing fallback

### Architecture Documentation
- **[🏗️ System Architecture](docs/architecture/ARCHITECTURE_GUIDE.md)** - Design patterns
- **[🤖 Multi-Agent System](docs/architecture/AGENTS.md)** - AI coordination
- **[🏢 Multi-Tenancy](docs/architecture/MULTI_TENANCY_GUIDE.md)** - Data isolation
- **[👥 Healthcare Users](docs/guides/HEALTHCARE_SAAS_USERS.md)** - 24+ user roles

### Development & Testing
- **[🧪 Testing Framework](docs/testing/TEST_SUMMARY.md)** - Comprehensive testing
- **[📊 Observability](docs/operations/OBSERVABILITY.md)** - Monitoring setup
- **[🔧 API Reference](http://localhost:3000/api/v1)** - Interactive documentation

## 🏥 Healthcare Features

### Multi-Organization Support
- **Hospital Systems** - Large healthcare networks
- **Specialty Clinics** - Focused medical practices
- **Urgent Care Centers** - Walk-in medical services
- **Telehealth Platforms** - Remote consultation support

### Provider Management
- **Licensing & Credentialing** - Professional verification
- **Specialty Tracking** - Medical specialization management
- **Schedule Optimization** - AI-powered availability matching
- **Performance Analytics** - Provider efficiency metrics

### Patient Experience
- **Intelligent Booking** - AI-assisted appointment scheduling
- **Real-time Availability** - Up-to-date provider schedules
- **Automated Reminders** - Multi-channel notifications
- **FAQ Support** - AI-powered question answering

## 🚨 Troubleshooting

### Common Issues

#### Docker Memory Issues
```bash
# Increase Docker memory to 8GB+
# Check system resources
./docker-dev.sh health
```

#### Port Conflicts
```bash
# Check for conflicting services
lsof -i :3000  # Backend API
lsof -i :3001  # Frontend dev server
lsof -i :5432  # PostgreSQL
```

#### Ollama Connection Issues
```bash
# Check Ollama service
curl http://localhost:11434/api/tags
./docker-dev.sh logs ollama

# Verify model download
docker-compose exec ollama ollama list
```

#### Elasticsearch Setup
```bash
# Increase virtual memory
sudo sysctl -w vm.max_map_count=262144

# Make permanent
echo 'vm.max_map_count=262144' | sudo tee -a /etc/sysctl.conf
```

## 🔒 Security & Compliance

### HIPAA Compliance Features
- **Data Encryption** - At rest and in transit
- **Audit Logging** - Complete access trails
- **Access Controls** - Role-based permissions
- **Data Isolation** - Multi-tenant security
- **Backup & Recovery** - Data protection protocols

### Development Security
- **Environment Variables** - No hardcoded secrets
- **JWT Authentication** - Secure session management
- **Rate Limiting** - API abuse prevention
- **CORS Configuration** - Cross-origin security
- **Input Validation** - SQL injection prevention

## 📊 Performance & Monitoring

### Metrics Collection
- **Application Performance** - Response times, throughput
- **Database Metrics** - Query performance, connections
- **Cache Performance** - Redis hit rates, memory usage
- **System Resources** - CPU, memory, disk utilization
- **AI/LLM Operations** - Model inference times, accuracy

### Observability Stack
- **Prometheus** - Metrics scraping and storage
- **Grafana** - Visualization and alerting
- **Jaeger** - Distributed request tracing  
- **ELK Stack** - Centralized log management
- **Health Checks** - Automated service monitoring

## 🤝 Contributing

### Development Workflow
1. **Fork and clone** the repository
2. **Set up environment** using `./docker-dev.sh dev`
3. **Create feature branch** following semantic naming
4. **Write tests** before implementing features
5. **Submit pull request** with comprehensive description

### Code Standards
- **TypeScript** for all new development
- **Functional programming** patterns for agents
- **Comprehensive error handling** with logging
- **JSDoc comments** for public methods
- **Semantic commit messages** (feat:, fix:, docs:)

### Testing Requirements
- **Minimum 80% coverage** for new code
- **Unit tests** for agent classes
- **Integration tests** for API endpoints
- **E2E tests** for critical workflows
- **Mock external dependencies** in tests

## 📜 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**🏥 Built for Healthcare Providers**  
*Empowering healthcare organizations with intelligent, secure, and scalable AI technology.*

**🚀 Ready to Get Started?**
```bash
chmod +x docker-dev.sh && ./docker-dev.sh start
```

Access your complete development environment at:
- **Frontend**: http://localhost:3001
- **Backend**: http://localhost:3000
- **Grafana**: http://localhost:3002
- **Full service map**: [DOCKER_SETUP.md](DOCKER_SETUP.md) 