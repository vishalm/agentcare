# 📚 AgentCare Documentation

**Comprehensive documentation for the AgentCare multi-agent healthcare scheduling system**

Welcome to the complete documentation for AgentCare - an enterprise-grade healthcare scheduling platform with AI agent coordination, HIPAA compliance, and multi-tenant architecture.

## 🚀 Quick Navigation

### **🎯 Getting Started**
- **[🚀 Setup Guide](setup/SETUP_GUIDE.md)** - Complete installation and configuration
- **[⚡ Quick Reference](setup/QUICK_REFERENCE.md)** - Essential commands and shortcuts
- **[🎯 Demo Guide](setup/DEMO_GUIDE.md)** - Complete walkthrough with all personas
- **[⚙️ Platform Setup](setup/PLATFORM_SETUP_GUIDE.md)** - Environment configuration

### **🛠️ Operations & Deployment**
- **[🩺 System Inspector](operations/INSPECTOR_GUIDE.md)** - Health check and diagnostics
- **[📋 Inspector Summary](operations/INSPECTOR_SUMMARY.md)** - Inspector capabilities overview
- **[🐳 Docker Guide](operations/DOCKER_GUIDE.md)** - Container deployment and management
- **[🚀 DevOps Guide](operations/DEVOPS_GUIDE.md)** - CI/CD and deployment strategies

### **🏗️ Architecture & Design**
- **[🏥 Architecture Guide](architecture/ARCHITECTURE_GUIDE.md)** - System design and patterns
- **[🔧 Implementation Summary](architecture/IMPLEMENTATION_SUMMARY.md)** - Technical implementation details
- **[🏢 Multi-Tenancy Guide](architecture/MULTI_TENANCY_GUIDE.md)** - Healthcare data isolation
- **[📋 Twelve Factor Guide](architecture/TWELVE_FACTOR_GUIDE.md)** - Cloud-native best practices

### **🧪 Testing & Quality**
- **[🧪 Test Summary](testing/TEST_SUMMARY.md)** - Comprehensive testing framework
- **[🔒 Multi-Tenant Testing](testing/MULTI_TENANT_TESTING.md)** - Healthcare-specific test strategies

### **📖 Reference & Guides**
- **[👥 Healthcare Users](guides/HEALTHCARE_SAAS_USERS.md)** - 24+ user roles and workflows
- **[📊 Project Status](guides/PROJECT_STATUS.md)** - Current features and roadmap
- **[📄 File Summary](guides/IGNORE_FILES_SUMMARY.md)** - Project structure reference
- **[🔌 Swagger Implementation](guides/SWAGGER_IMPLEMENTATION_SUMMARY.md)** - API documentation

## 🏥 System Overview

AgentCare is a comprehensive healthcare scheduling platform featuring:

### **🤖 Multi-Agent AI System**
- **Supervisor Agent** - Intelligent routing and coordination
- **Availability Agent** - Schedule management and optimization  
- **Booking Agent** - Appointment creation and confirmation
- **FAQ Agent** - Healthcare information and support

### **🏥 Healthcare Platform**
- **Multi-Tenant Architecture** - Support for multiple healthcare organizations
- **HIPAA Compliance** - Built-in audit trails and data protection
- **24+ User Types** - Complete healthcare ecosystem support
- **PostgreSQL + pgvector** - Vector database for RAG/AI conversations

### **🔧 Production Ready**
- **Docker Containerization** - One-command deployment
- **System Inspector** - Comprehensive health monitoring
- **3,115+ Lines of Tests** - Enterprise-grade testing coverage
- **Cloud-Native** - Kubernetes-ready infrastructure

## 📋 Documentation Categories

### **Setup & Configuration**
Get AgentCare running in your environment with comprehensive setup guides covering Docker deployment, local development, and production configuration.

**Key Documents:**
- [Setup Guide](setup/SETUP_GUIDE.md) - Step-by-step installation
- [Platform Setup](setup/PLATFORM_SETUP_GUIDE.md) - Environment configuration
- [Quick Reference](setup/QUICK_REFERENCE.md) - Command cheat sheet

### **Operations & Monitoring**
Monitor, maintain, and troubleshoot your AgentCare deployment with operational guides and diagnostic tools.

**Key Documents:**
- [System Inspector](operations/INSPECTOR_GUIDE.md) - Health monitoring tool
- [Docker Guide](operations/DOCKER_GUIDE.md) - Container management
- [DevOps Guide](operations/DEVOPS_GUIDE.md) - Deployment automation

### **Architecture & Development**
Understand the system design, multi-tenant architecture, and development patterns used in AgentCare.

**Key Documents:**
- [Architecture Guide](architecture/ARCHITECTURE_GUIDE.md) - System design
- [Multi-Tenancy Guide](architecture/MULTI_TENANCY_GUIDE.md) - Data isolation
- [Implementation Summary](architecture/IMPLEMENTATION_SUMMARY.md) - Technical details

### **Testing & Quality Assurance**
Comprehensive testing strategies for healthcare systems with HIPAA compliance validation.

**Key Documents:**
- [Test Summary](testing/TEST_SUMMARY.md) - Testing framework overview
- [Multi-Tenant Testing](testing/MULTI_TENANT_TESTING.md) - Healthcare-specific tests

### **Reference & User Guides**
User management, healthcare workflows, and system reference information.

**Key Documents:**
- [Healthcare Users](guides/HEALTHCARE_SAAS_USERS.md) - User roles and permissions
- [Project Status](guides/PROJECT_STATUS.md) - Feature roadmap

## 🎯 Quick Start Paths

### **👨‍💻 For Developers**
1. **[Setup Guide](setup/SETUP_GUIDE.md)** - Get development environment running
2. **[Architecture Guide](architecture/ARCHITECTURE_GUIDE.md)** - Understand the system
3. **[Test Summary](testing/TEST_SUMMARY.md)** - Run and understand tests
4. **[Quick Reference](setup/QUICK_REFERENCE.md)** - Daily development commands

### **🔧 For DevOps Engineers**
1. **[Docker Guide](operations/DOCKER_GUIDE.md)** - Container deployment
2. **[DevOps Guide](operations/DEVOPS_GUIDE.md)** - CI/CD setup
3. **[System Inspector](operations/INSPECTOR_GUIDE.md)** - Monitoring and diagnostics
4. **[Multi-Tenancy Guide](architecture/MULTI_TENANCY_GUIDE.md)** - Security and isolation

### **🏥 For Healthcare IT**
1. **[Demo Guide](setup/DEMO_GUIDE.md)** - Explore healthcare features
2. **[Healthcare Users](guides/HEALTHCARE_SAAS_USERS.md)** - User management
3. **[HIPAA Compliance](architecture/MULTI_TENANCY_GUIDE.md)** - Security features
4. **[System Inspector](operations/INSPECTOR_GUIDE.md)** - Health monitoring

### **🎯 For Project Managers**
1. **[Project Status](guides/PROJECT_STATUS.md)** - Current features and roadmap
2. **[Demo Guide](setup/DEMO_GUIDE.md)** - System demonstration
3. **[Architecture Guide](architecture/ARCHITECTURE_GUIDE.md)** - System overview
4. **[Healthcare Users](guides/HEALTHCARE_SAAS_USERS.md)** - User ecosystem

## 🔧 Essential Commands

```bash
# Quick Setup
./docker-quick-start.sh              # Full system deployment
./agentcare-inspector.sh             # System health check

# Development
docker-compose up -d                 # Start all services
docker-compose logs -f backend       # View backend logs
docker-compose exec backend bash     # Access backend container

# Monitoring
curl http://localhost:3000/health    # Backend health
curl http://localhost:11434/api/tags # Ollama status
```

## 🏥 Healthcare Features

### **Multi-Tenant Organizations**
- **Hospitals & Health Systems** - Large multi-department facilities
- **Clinics & Medical Groups** - Primary care and specialty practices
- **Urgent Care Centers** - Walk-in and emergency services
- **Specialty Centers** - Focused medical specialties
- **Telehealth Platforms** - Virtual care delivery

### **User Management**
- **24+ Healthcare User Types** - Complete ecosystem support
- **Role-Based Access Control** - Granular permissions
- **HIPAA Compliance** - Built-in data protection
- **Multi-Factor Authentication** - Enhanced security

### **AI Agent System**
- **Natural Language Processing** - Ollama LLM integration
- **Conversational AI** - RAG with vector database
- **Intelligent Routing** - Context-aware agent delegation
- **Real-Time Responses** - Sub-second processing

## 🤝 Contributing

We welcome contributions to AgentCare! Here's how to get involved:

### **Documentation**
- Found an error? Submit a pull request
- Missing information? Create an issue
- Want to improve clarity? We appreciate it!

### **Development**
- Review the [Architecture Guide](architecture/ARCHITECTURE_GUIDE.md)
- Check [Test Summary](testing/TEST_SUMMARY.md) for testing standards
- Follow the [Implementation Summary](architecture/IMPLEMENTATION_SUMMARY.md)

## 📞 Support

### **Getting Help**
- **📖 Documentation** - Start here with these guides
- **🐛 Issues** - Use GitHub issues for bug reports
- **💡 Discussions** - Feature requests and questions
- **🔍 System Inspector** - Built-in diagnostic tool

### **Common Questions**
- **Setup Issues** - See [Setup Guide](setup/SETUP_GUIDE.md)
- **Docker Problems** - Check [Docker Guide](operations/DOCKER_GUIDE.md)
- **Health Checks** - Use [System Inspector](operations/INSPECTOR_GUIDE.md)
- **Architecture Questions** - Review [Architecture Guide](architecture/ARCHITECTURE_GUIDE.md)

---

**🏥 AgentCare Documentation**  
*Comprehensive guides for enterprise healthcare scheduling with AI agent coordination*

**🚀 [Back to Main README](../README.md)** 