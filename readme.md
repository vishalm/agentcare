<div align="center">
  <img src="docs/assets/images/agentcare-logo-square.svg" alt="AgentCare Logo" width="120" height="120">
  
  # 🏥 AgentCare - AI-Powered Healthcare Scheduling Platform
</div>



[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live%20Demo-blue?logo=github)](https://vishalm.github.io/agentcare/)
[![CI/CD Status](https://github.com/vishalm/agentcare/workflows/AgentCare%20Testing%20CI%2FCD/badge.svg)](https://github.com/vishalm/agentcare/actions)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=vishalm_agentcare&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=vishalm_agentcare)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)](https://hub.docker.com/r/agentcare/platform)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Enterprise-grade multi-agent healthcare scheduling platform with AI coordination, HIPAA compliance, and real-time appointment management.**

## 🌟 Live Demo & Documentation

- **🚀 [Live Demo](https://vishalm.github.io/agentcare/)** - Interactive frontend demo
- **📚 [Documentation](https://vishalm.github.io/agentcare/docs/)** - Complete technical docs
- **🏗️ [Architecture Guide](docs/architecture/SYSTEM_ARCHITECTURE.md)** - System diagrams
- **🔧 [API Documentation](docs/api-reference.md)** - RESTful API reference

## 🎯 Key Features

### 🤖 Multi-Agent AI System
- **Supervisor Agent** - Orchestrates and coordinates all agent activities
- **Booking Agent** - Handles appointment scheduling and modifications
- **Availability Agent** - Manages provider schedules and time slots
- **FAQ Agent** - Provides intelligent responses using RAG system

### 🏥 Healthcare-Specific Features
- **HIPAA Compliance** - Secure handling of protected health information
- **Provider Management** - Comprehensive healthcare provider profiles
- **Appointment Scheduling** - Real-time availability and booking
- **Patient Portal** - User-friendly interface for patients

### 🧠 AI & LLM Integration
- **Ollama Integration** - Local LLM processing with Qwen 2.5 and DeepSeek R1
- **RAG System** - Vector-based conversation memory and knowledge retrieval
- **Natural Language Processing** - Intelligent understanding of user requests
- **Context Awareness** - Maintains conversation context across interactions

### 🛡️ Enterprise Security
- **JWT Authentication** - Secure token-based authentication
- **Role-Based Access Control** - Granular permission management
- **Rate Limiting** - API protection against abuse
- **Audit Logging** - Comprehensive activity tracking

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm 8+
- **Docker** and Docker Compose
- **PostgreSQL** 14+
- **Redis** 7+
- **Ollama** for AI features

### 1. Clone and Setup
```bash
git clone https://github.com/vishalm/agentcare.git
cd agentcare
npm run setup
```

### 2. Environment Configuration
```bash
cp env.example .env
# Edit .env with your configuration
```

### 3. Start Development Environment
```bash
# Start all services with Docker Compose
docker-compose up

# Or start services individually
npm run dev:backend  # Backend API (port 3000)
npm run dev:frontend # Frontend UI (port 3001)
```

### 4. Initialize Database
```bash
npm run db:setup
npm run db:seed  # Optional: add demo data
```

### 5. Start Ollama (for AI features)
```bash
ollama serve
ollama pull qwen2.5:latest
```

## 📁 Project Structure

```
agentcare/
├── 📱 frontend/              # React + TypeScript + Vite
│   ├── src/components/       # React components
│   ├── src/pages/           # Page components
│   ├── src/store/           # State management
│   └── public/              # Static assets
├── 🔧 backend/               # Node.js + Express + TypeScript
│   ├── src/agents/          # AI agents
│   ├── src/controllers/     # API controllers
│   ├── src/services/        # Business logic
│   └── src/tools/           # Agent tools
├── 🗄️ database/              # PostgreSQL schemas
├── 🏗️ infrastructure/        # Docker, K8s, CI/CD
├── 📚 docs/                  # Documentation
├── 🧪 tests/                 # Test suites
└── 📜 scripts/               # Automation scripts
```

👉 **[Complete Project Structure Guide](docs/PROJECT_STRUCTURE.md)**

## 🏗️ Architecture Overview

<div class="mermaid">
graph TB
    subgraph "Frontend Layer"
        React[React App]
        UI[Material-UI]
        Store[Zustand Store]
    end
    
    subgraph "API Layer"
        Express[Express Server]
        Auth[JWT Auth]
        Rate[Rate Limiting]
    end
    
    subgraph "Multi-Agent System"
        Supervisor[Supervisor Agent]
        Booking[Booking Agent]
        Availability[Availability Agent]
        FAQ[FAQ Agent]
    end
    
    subgraph "AI/LLM Layer"
        Ollama[Ollama LLM]
        RAG[RAG System]
        Knowledge[Knowledge Base]
    end
    
    subgraph "Data Layer"
        Postgres[(PostgreSQL)]
        Redis[(Redis Cache)]
    end
    
    React --> Express
    Express --> Supervisor
    Supervisor --> Booking
    Supervisor --> Availability
    Supervisor --> FAQ
    Supervisor --> Ollama
    Express --> Postgres
    Express --> Redis
</div>

👉 **[Detailed Architecture Diagrams](docs/architecture/diagrams/SYSTEM_ARCHITECTURE.md)**

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev                   # Start full development stack
npm run dev:backend          # Backend only
npm run dev:frontend         # Frontend only

# Building
npm run build                # Build both frontend and backend
npm run build:backend        # Build backend only
npm run build:frontend       # Build frontend only

# Testing
npm run test                 # Run all tests
npm run test:unit           # Unit tests
npm run test:integration    # Integration tests
npm run test:ui             # E2E tests with Playwright

# Docker
npm run docker:build        # Build all Docker images
npm run docker:compose      # Start with Docker Compose
npm run docker:build:backend-standalone  # Backend container
npm run docker:build:frontend-standalone # Frontend container

# Quality
npm run lint                # ESLint
npm run type-check          # TypeScript
npm run format             # Prettier
npm run security:scan      # Security audit
```

### Technology Stack

#### Frontend
- **React 18** with TypeScript
- **Material-UI** for components
- **Zustand** for state management
- **React Query** for API calls
- **Vite** for fast development

#### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **PostgreSQL** database
- **Redis** for caching
- **JWT** authentication
- **Ollama** for AI/LLM

#### Infrastructure
- **Docker** containerization
- **Kubernetes** orchestration
- **GitHub Actions** CI/CD
- **SonarCloud** code quality
- **Prometheus** monitoring

## 🚀 Deployment

### Docker Deployment
```bash
# Quick start with Docker Compose
docker-compose up -d

# Production deployment
npm run docker:prod
```

### Kubernetes Deployment
```bash
# Deploy to Kubernetes
kubectl apply -f infrastructure/kubernetes/

# Or use Helm
helm install agentcare infrastructure/helm/agentcare
```

### GitHub Pages (Frontend Only)
The frontend is automatically deployed to GitHub Pages on every push to main:
- **URL**: https://vishalm.github.io/agentcare/
- **Auto-deployment**: Via GitHub Actions
- **Manual deployment**: `npm run deploy:pages`

👉 **[Detailed Deployment Guide](docs/operations/DEPLOYMENT_GUIDE.md)**

## 🧪 Testing

Comprehensive testing strategy with multiple test types:

- **Unit Tests**: Jest for component and function testing
- **Integration Tests**: API and database integration
- **Contract Tests**: API contract validation
- **E2E Tests**: Playwright for user journey testing
- **Performance Tests**: Load and stress testing

```bash
npm run test:all              # Run all test suites
npm run test:coverage         # Generate coverage report
npm run test:ci              # CI-optimized test run
```

## 📊 Monitoring & Observability

- **Health Checks**: `/health` endpoint for service monitoring
- **Metrics**: Prometheus metrics at `/metrics`
- **Logging**: Structured JSON logging with Winston
- **Tracing**: Request tracing for debugging
- **Alerts**: Configurable alerting rules

## 🔒 Security & Compliance

### HIPAA Compliance
- **Data Encryption**: At rest and in transit
- **Access Controls**: Role-based permissions
- **Audit Logging**: Complete activity tracking
- **Data Retention**: Configurable retention policies

### Security Features
- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: API protection
- **Input Validation**: Comprehensive data validation
- **CORS Configuration**: Secure cross-origin requests
- **Container Security**: Non-root containers with minimal attack surface

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow [TypeScript best practices](docs/guides/TYPESCRIPT_GUIDE.md)
- Write tests for new features
- Update documentation
- Follow [commit conventions](docs/guides/COMMIT_CONVENTIONS.md)

## 📚 Documentation

- **[Project Structure](docs/PROJECT_STRUCTURE.md)** - Complete codebase organization
- **[Architecture Guide](docs/architecture/ARCHITECTURE_GUIDE.md)** - System design and patterns
- **[API Reference](docs/api-reference.md)** - RESTful API documentation
- **[Setup Guide](docs/setup/QUICK_START.md)** - Detailed installation instructions
- **[Docker Guide](docs/setup/DOCKER_SETUP.md)** - Container deployment
- **[Testing Guide](docs/testing.md)** - Testing strategies and best practices

## 🏆 Features Roadmap

### Current Version (v3.0.0-beta)
- ✅ Multi-agent AI system
- ✅ Real-time appointment booking
- ✅ HIPAA-compliant architecture
- ✅ Docker containerization
- ✅ GitHub Actions CI/CD

### Planned Features
- 🔄 Advanced AI scheduling optimization
- 🔄 Mobile application (React Native)
- 🔄 Provider calendar integration
- 🔄 Telemedicine support
- 🔄 Analytics dashboard
- 🔄 Multi-language support

## 📈 Performance

- **Response Time**: < 100ms average API response
- **Availability**: 99.9% uptime target
- **Scalability**: Horizontal scaling with Kubernetes
- **Throughput**: 1000+ concurrent users supported
- **Database**: Optimized queries with connection pooling

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Ollama** - Local LLM processing
- **Material-UI** - React component library  
- **PostgreSQL** - Robust database system
- **Docker** - Containerization platform
- **GitHub Actions** - CI/CD automation

---

## 📞 Support & Contact

- **GitHub Issues**: [Report bugs or request features](https://github.com/vishalm/agentcare/issues)
- **Documentation**: [Complete documentation site](https://vishalm.github.io/agentcare/)
- **Email**: vishal@agentcare.dev

---

<div align="center">

**🏥 Built with ❤️ for healthcare providers and patients**

[Live Demo](https://vishalm.github.io/agentcare/) • [Documentation](docs/) • [API Reference](docs/api-reference.md) • [Contributing](CONTRIBUTING.md)

</div>

**[🏠 Home](https://vishalm.github.io/agentcare/) • [🚀 Quick Start](https://vishalm.github.io/agentcare/docs/setup/QUICK_START.html) • [🏗️ Architecture](https://vishalm.github.io/agentcare/docs/architecture/ARCHITECTURE_GUIDE.html) • [🔧 API](https://vishalm.github.io/agentcare/docs/api-reference.html)** 