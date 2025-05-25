<div align="center">
  <img src="assets/images/agentcare-logo-square.svg" alt="AgentCare Logo" width="80" height="80">
  
  # 📚 AgentCare Documentation
</div>

Welcome to the comprehensive documentation for AgentCare - the AI-powered healthcare scheduling platform. This documentation provides everything you need to understand, deploy, and develop with AgentCare.

## 🚀 Quick Navigation

### 🏃‍♂️ Getting Started
- **[🚀 Quick Start Guide](/agentcare/docs/setup/QUICK_START.html)** - Get up and running in minutes
- **[🐳 Docker Setup](/agentcare/docs/setup/DOCKER_SETUP.html)** - Complete containerized development environment
- **[⚙️ Environment Configuration](/agentcare/docs/setup/ENVIRONMENT_SETUP.html)** - Configuration and environment variables

### 🏗️ Architecture & Design
- **[📊 System Architecture](/agentcare/docs/architecture/diagrams/SYSTEM_ARCHITECTURE.html)** - Visual system diagrams
- **[🏛️ Architecture Guide](/agentcare/docs/architecture/ARCHITECTURE_GUIDE.html)** - Detailed system design
- **[🏢 Multi-Tenancy](/agentcare/docs/architecture/MULTI_TENANCY_GUIDE.html)** - Tenant isolation and management
- **[🔄 12-Factor App](/agentcare/docs/architecture/TWELVE_FACTOR_GUIDE.html)** - 12-Factor methodology compliance

### 📁 Project Organization
- **[📂 Project Structure](/agentcare/docs/PROJECT_STRUCTURE.html)** - Complete codebase organization
- **[📋 Documentation Organization](/agentcare/docs/DOCUMENTATION_ORGANIZATION.html)** - How docs are structured

### 🔧 API & Development
- **[📖 API Reference](/agentcare/docs/api-reference.html)** - Complete REST API documentation
- **[🧪 Testing Guide](/agentcare/docs/testing.html)** - Comprehensive testing strategies
- **[🎯 Features Guide](/agentcare/docs/features.html)** - Platform features overview

### 🚀 Enterprise Features
- **[🏥 Enterprise Guide](/agentcare/docs/enterprise.html)** - Enterprise features and capabilities
- **[🔒 Security & Compliance](/agentcare/docs/operations/SECURITY.html)** - Security best practices

## 🎯 Quick Reference

### 🔗 Essential Links
- **[GitHub Repository](https://github.com/vishalm/agentcare)** - Source code and issues
- **[Live Demo](https://vishalm.github.io/agentcare/)** - Interactive frontend demo
- **[CI/CD Pipeline](https://github.com/vishalm/agentcare/actions)** - Build and deployment status

### ⚡ Quick Commands
```bash
# Quick start
npm run setup                 # Complete setup
npm run dev                   # Start development
npm run build                 # Build for production
npm run test                  # Run all tests

# Docker commands
docker-compose up             # Start all services
npm run docker:build         # Build containers

# Database operations
npm run db:setup             # Initialize database
npm run db:seed              # Add demo data
```

### 🏥 Demo Credentials
All demo accounts use password: **`AgentCare2024!`**
- **Admin**: `admin@agentcare.dev`
- **Doctor**: `doctor@agentcare.dev` 
- **Patient**: `patient@agentcare.dev`

### 🌐 Service Endpoints (Development)
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **API Docs**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/health

## 📊 System Overview

<div class="mermaid">
graph TB
    subgraph "Frontend Layer"
        React[React Application]
        UI[Material-UI Components]
    end
    
    subgraph "API Layer"
        Express[Express Server]
        Auth[JWT Authentication]
    end
    
    subgraph "Multi-Agent System"
        Supervisor[Supervisor Agent]
        Availability[Availability Agent]
        Booking[Booking Agent]
        FAQ[FAQ Agent]
    end
    
    subgraph "Data Layer"
        Postgres[(PostgreSQL)]
        Redis[(Redis Cache)]
    end
    
    subgraph "AI/LLM Layer"
        Ollama[Ollama LLM Service]
        RAG[RAG System]
    end
    
    React --> Express
    Express --> Supervisor
    Supervisor --> Availability
    Supervisor --> Booking
    Supervisor --> FAQ
    Supervisor --> Ollama
    Express --> Postgres
    Express --> Redis
</div>

## 🤝 Contributing to Documentation

### How to Contribute
1. **Find areas for improvement** in existing docs
2. **Add missing documentation** for new features
3. **Update outdated information** as system evolves
4. **Improve clarity and examples** for better understanding

### Documentation Standards
- **Markdown format** for all documentation
- **Mermaid diagrams** for visual representations
- **Code examples** with proper syntax highlighting
- **Cross-references** to related documentation

## 📞 Support & Resources

### Getting Help
- **[GitHub Issues](https://github.com/vishalm/agentcare/issues)** - Bug reports and feature requests
- **[Documentation Issues](https://github.com/vishalm/agentcare/issues/new?labels=documentation)** - Documentation improvements

### Additional Resources
- **[Contributing Guide](/agentcare/CONTRIBUTING.html)** - How to contribute to the project
- **[License](/agentcare/LICENSE.html)** - MIT license details

---

<div align="center">

**📚 Comprehensive documentation for a comprehensive platform**

[🏠 Home](/agentcare/) • [🚀 Quick Start](/agentcare/docs/setup/QUICK_START.html) • [🏗️ Architecture](/agentcare/docs/architecture/ARCHITECTURE_GUIDE.html) • [🔧 API](/agentcare/docs/api-reference.html)

</div> 