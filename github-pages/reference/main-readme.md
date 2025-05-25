---
layout: page
title: Main README Reference
description: Complete reference of the main AgentCare README for the knowledge base
---

# 🏥 AgentCare - AI Healthcare Scheduling System

**Enterprise-grade multi-agent healthcare scheduling platform with HIPAA compliance and Ollama LLM integration**

[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Version](https://img.shields.io/badge/Version-3.0.0--beta-orange.svg)]()
[![HIPAA](https://img.shields.io/badge/HIPAA-Compliant-green.svg)]()
[![Multi-Tenant](https://img.shields.io/badge/Multi--Tenant-Healthcare-blue.svg)]()

## 🚀 Quick Start

### One-Command Setup
```bash
# Full system with AI agents and Ollama LLM
./docker-quick-start.sh

# System health check and diagnostics
./agentcare-inspector.sh
```

### Access Points
- **🖥️ Frontend**: http://localhost:3001
- **🔧 Backend API**: http://localhost:3000  
- **🤖 Ollama LLM**: http://localhost:11434
- **🩺 Health Check**: Run `./agentcare-inspector.sh`

### Demo Credentials
All demo accounts use password: **`AgentCare2024!`**
- **Admin**: `admin@agentcare.dev`
- **Doctor**: `doctor@agentcare.dev` 
- **Patient**: `patient@agentcare.dev`

## 🏗️ What You Get

**Multi-Agent AI System**
- 🤖 **Supervisor Agent** - Intelligent routing and coordination
- 📅 **Availability Agent** - Schedule management and optimization  
- 📝 **Booking Agent** - Appointment creation and confirmation
- ❓ **FAQ Agent** - Healthcare information and support

**Healthcare Platform**
- 🏥 **Multi-Tenant Architecture** - Support for multiple healthcare organizations
- 🔒 **HIPAA Compliance** - Built-in audit trails and data protection
- 👥 **24+ User Types** - Complete healthcare ecosystem support
- 📊 **PostgreSQL + pgvector** - Vector database for RAG/AI conversations

**Production Ready**
- 🐳 **Docker Containerization** - One-command deployment
- 🩺 **System Inspector** - Comprehensive health monitoring
- 🧪 **3,115 Lines of Tests** - Enterprise-grade testing coverage
- ☸️ **Cloud-Native** - Kubernetes-ready infrastructure

## 📚 Documentation

**📖 [Complete Documentation →](../)**

### Quick Access
- **[🚀 Setup Guide](../setup/setup-guide/)** - Installation and configuration
- **[🩺 System Inspector](../operations/inspector-guide/)** - Health check and diagnostics  
- **[🐳 Docker Guide](../operations/docker-guide/)** - Container deployment
- **[⚡ Quick Reference](../setup/quick-reference/)** - Commands and shortcuts
- **[🎯 Demo Guide](../setup/demo-guide/)** - Complete walkthrough

### Architecture & Development
- **[🏗️ Architecture](../architecture/architecture-guide/)** - System design and patterns
- **[🏢 Multi-Tenancy](../architecture/multi-tenancy-guide/)** - Healthcare data isolation
- **[🧪 Testing Guide](../testing/test-summary/)** - Comprehensive testing framework
- **[👥 Healthcare Users](../guides/healthcare-users/)** - 24+ user roles and workflows

## ⚡ Essential Commands

```bash
# Setup & Health Check
./docker-quick-start.sh              # Full system setup
./docker-quick-start.sh --clean      # Clean restart
./agentcare-inspector.sh             # System diagnostics
./agentcare-inspector.sh --quiet     # Show errors only

# Service Management  
docker-compose up -d                 # Start all services
docker-compose down                  # Stop all services
docker-compose logs -f backend       # View logs
docker-compose restart backend       # Restart service

# Development
docker-compose exec backend bash     # Access backend
docker-compose exec postgres psql -U agentcare agentcare_dev
docker-compose exec ollama ollama list

# Monitoring
curl http://localhost:3000/health    # Backend health
curl http://localhost:11434/api/tags # Ollama status
docker-compose ps                    # Container status
```

## 🏥 Key Features

### Healthcare-Specific
- **🏥 Multi-Organization Support** - Hospitals, clinics, specialty centers
- **👨‍⚕️ Provider Management** - Licensing, credentialing, specialties
- **📅 Intelligent Scheduling** - AI-powered appointment optimization
- **🔐 Data Isolation** - Complete tenant separation and security
- **📋 HIPAA Compliance** - Healthcare data protection by design

### AI & Technology
- **🤖 Multi-Agent Coordination** - Intelligent task distribution
- **🧠 Ollama LLM Integration** - Local AI inference with Qwen2.5
- **📚 RAG System** - Conversational context and knowledge base
- **🗄️ Vector Database** - PostgreSQL with pgvector for AI search
- **⚡ Real-Time Processing** - Sub-second agent responses

## 🛠️ System Requirements

**Minimum**
- Docker & Docker Compose
- 8GB RAM (16GB recommended for Ollama)
- 20GB free disk space
- Ports: 3000, 3001, 5432, 6379, 11434

**Development**
- Node.js 18+
- PostgreSQL 14+
- Redis 7+

## 📞 Support & Contributing

- **📖 [Full Documentation](../)** - Comprehensive guides
- **🐛 Issues** - Use GitHub issues for bug reports
- **💡 Discussions** - Feature requests and questions
- **🤝 Contributing** - See contribution guidelines in docs

## 📜 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**🏥 Built for Healthcare Providers**  
*Empowering healthcare organizations with intelligent, secure, and scalable AI technology.*

**🚀 [Get Started →](../)** 