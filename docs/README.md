# AgentCare Documentation

🏥 **Enhanced Multi-Agent Healthcare Scheduling System**

## Quick Navigation

### 🚀 Getting Started
- [Setup Guide](../SETUP_GUIDE.md) - Complete installation and setup
- [Frontend Demo Guide](../frontend/demo.md) - UI themes and features
- [Demo Credentials](#demo-credentials) - Test accounts for all personas

### 📖 Core Documentation
- [Architecture Guide](../ARCHITECTURE_GUIDE.md) - System design and components
- [Implementation Summary](../IMPLEMENTATION_SUMMARY.md) - Technical details
- [Multi-Tenancy Guide](../MULTI_TENANCY_GUIDE.md) - Multi-organization support
- [Healthcare SaaS Users](../HEALTHCARE_SAAS_USERS.md) - User roles and permissions

### 🛠️ Development
- [DevOps Guide](../DEVOPS_GUIDE.md) - Deployment and operations
- [Twelve Factor Guide](../TWELVE_FACTOR_GUIDE.md) - 12-Factor methodology
- [Testing Guide](../TEST_SUMMARY.md) - Testing strategies
- [Platform Setup](../PLATFORM_SETUP_GUIDE.md) - Environment configuration

### 🎨 Frontend
- [UI Components](../frontend/src/components/) - React components
- [Theming System](../frontend/src/theme/) - Persona-based themes
- [State Management](../frontend/src/store/) - Application state

### 🗄️ Database
- [Schema](../database/schema/) - Database structure
- [Migrations](../database/migrations/) - Schema changes
- [Seeds](../database/seeds/) - Demo data

## Demo Credentials

### 🔴 Administrator
- **Email**: `admin@agentcare.dev`
- **Password**: `AgentCare2024!`
- **Role**: System Administrator
- **Features**: User management, system settings, analytics
- **Theme**: Dark blue with orange accents

### 🔵 Doctor/Physician
- **Email**: `doctor@agentcare.dev`
- **Password**: `AgentCare2024!`
- **Role**: Healthcare Provider
- **Features**: Patient records, appointments, medical notes
- **Theme**: Professional blue with teal accents

### 🟢 Nurse
- **Email**: `nurse@agentcare.dev`
- **Password**: `AgentCare2024!`
- **Role**: Nursing Staff
- **Features**: Patient care, basic records, shift management
- **Theme**: Warm teal with cyan accents

### 🟣 Patient
- **Email**: `patient@agentcare.dev`
- **Password**: `AgentCare2024!`
- **Role**: Healthcare Consumer
- **Features**: Personal health, appointment booking, AI chat
- **Theme**: Friendly purple with blue accents

### 🟡 Receptionist
- **Email**: `receptionist@agentcare.dev`
- **Password**: `AgentCare2024!`
- **Role**: Front Desk Staff
- **Features**: Appointment scheduling, patient check-in
- **Theme**: Welcoming green with blue accents

### 🟠 Specialist
- **Email**: `specialist@agentcare.dev`
- **Password**: `AgentCare2024!`
- **Role**: Medical Specialist
- **Features**: Specialized consultations, referrals
- **Theme**: Professional blue variant

## System Features

### 🤖 AI-Powered Agents
- **Supervisor Agent**: Orchestrates multi-agent conversations
- **Booking Agent**: Handles appointment scheduling
- **Availability Agent**: Manages provider schedules
- **FAQ Agent**: Answers common questions

### 🎨 Persona-Based UI Themes
- Automatic theme selection based on user role
- Manual theme override capability
- Consistent branding across all components
- Responsive design for all devices

### 🔐 Security & Compliance
- HIPAA-compliant data handling
- JWT-based authentication
- Role-based access control
- Audit logging for all operations

### 🏢 Multi-Tenancy
- Organization-based data isolation
- Configurable features per tenant
- Scalable architecture

## Quick Start Commands

```bash
# Setup with demo data
npm run setup:demo

# Start development servers
npm run dev

# Seed database with demo users
npm run db:seed:demo

# Reset and reseed database
npm run db:reset:demo

# View frontend with themes
open http://localhost:3001

# Check backend API
curl http://localhost:3000/api/v1/health
```

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   React + MUI   │◄──►│   Node.js       │◄──►│   PostgreSQL    │
│   Port 3001     │    │   Port 3000     │    │   Port 5432     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └─────────────►│   Ollama LLM    │              │
                        │   Port 11434    │              │
                        └─────────────────┘              │
                                 │                       │
                        ┌─────────────────┐              │
                        │   Redis Cache   │◄─────────────┘
                        │   Port 6379     │
                        └─────────────────┘
```

## Support

- 📧 **Email**: support@agentcare.dev
- 🐛 **Issues**: [GitHub Issues](../../issues)
- 📚 **Wiki**: [Project Wiki](../../wiki)
- 💬 **Discussions**: [GitHub Discussions](../../discussions)

---

**Built with ❤️ for Healthcare Innovation** 