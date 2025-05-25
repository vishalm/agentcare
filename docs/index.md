<div align="center">
  <img src="assets/images/agentcare-logo-square.svg" alt="AgentCare Logo" width="80" height="80">
</div>

# 📚 AgentCare Documentation
Welcome to the comprehensive documentation for AgentCare - the AI-powered healthcare scheduling platform. This documentation provides everything you need to understand, deploy, and develop with AgentCare.

## 🚀 Quick Navigation

### 🏃‍♂️ Getting Started
- **[🚀 Quick Start Guide](/agentcare/docs/setup/QUICK_START.html)** - Get up and running in minutes
- **[🐳 Docker Setup](/agentcare/docs/setup/DOCKER_SETUP.html)** - Complete containerized development environment
- **[⚙️ Environment Configuration](/agentcare/docs/setup/PLATFORM_SETUP_GUIDE.html)** - Configuration and environment variables

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
- **[🔒 Security & Compliance](/agentcare/docs/architecture/ARCHITECTURE_GUIDE.html#security)** - Security best practices

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

<footer class="docs-footer">
  <div class="footer-content">
    <div class="footer-logo">
      <img src="assets/images/agentcare-logo-square.svg" alt="AgentCare" width="32" height="32">
      <span class="footer-title">AgentCare Documentation</span>
    </div>
    
    <div class="footer-description">
      <p>Comprehensive documentation for a comprehensive healthcare platform</p>
    </div>
    
    <nav class="footer-nav">
      <a href="/agentcare/" class="footer-link">
        <span class="link-icon">🏠</span>
        <span class="link-text">Home</span>
      </a>
      <a href="/agentcare/PROJECT_STRUCTURE/" class="footer-link">
        <span class="link-icon">🚀</span>
        <span class="link-text">Quick Start</span>
      </a>
      <a href="/agentcare/architecture/" class="footer-link">
        <span class="link-icon">🏗️</span>
        <span class="link-text">Architecture</span>
      </a>
      <a href="/agentcare/api-reference/" class="footer-link">
        <span class="link-icon">🔧</span>
        <span class="link-text">API</span>
      </a>
    </nav>
    
    <div class="footer-bottom">
      <p>&copy; 2024 AgentCare. Built with ❤️ for healthcare.</p>
    </div>
  </div>
</footer>

<style>
.docs-footer {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-top: 1px solid #cbd5e0;
  margin-top: 4rem;
  padding: 3rem 0 2rem;
  text-align: center;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.footer-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.footer-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
}

.footer-description {
  margin-bottom: 2rem;
}

.footer-description p {
  color: #718096;
  font-size: 1rem;
  margin: 0;
  font-style: italic;
}

.footer-nav {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.footer-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: #4a5568;
  transition: all 0.3s ease;
  padding: 1rem;
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(203, 213, 224, 0.5);
  min-width: 100px;
}

.footer-link:hover {
  color: #2b6cb0;
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(43, 108, 176, 0.15);
  border-color: #2b6cb0;
}

.link-icon {
  font-size: 1.5rem;
  display: block;
}

.link-text {
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.footer-bottom {
  border-top: 1px solid #e2e8f0;
  padding-top: 1.5rem;
  margin-top: 2rem;
}

.footer-bottom p {
  color: #a0aec0;
  font-size: 0.875rem;
  margin: 0;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .footer-nav {
    gap: 1rem;
  }
  
  .footer-link {
    min-width: 80px;
    padding: 0.75rem;
  }
  
  .link-icon {
    font-size: 1.25rem;
  }
  
  .link-text {
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .footer-nav {
    grid-template-columns: repeat(2, 1fr);
    display: grid;
    gap: 1rem;
    max-width: 300px;
    margin: 0 auto 2rem;
  }
  
  .footer-content {
    padding: 0 1rem;
  }
}
</style> 