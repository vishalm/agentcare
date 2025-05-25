# AgentCare Quick Reference

**🏥 Enterprise Healthcare Platform - Developer Quick Start**

## 🚀 One-Command Setup

```bash
# Complete demo setup
./scripts/init-demo.sh

# Start development
npm run dev

# Access frontend: http://localhost:3001
# Access backend: http://localhost:3000
```

## 🔑 Demo Credentials

**Password for all accounts:** `AgentCare2024!`

| Role | Email | Features |
|------|-------|----------|
| 🔴 **Admin** | `admin@agentcare.dev` | User management, system settings, analytics |
| 🔵 **Doctor** | `doctor@agentcare.dev` | Patient records, appointments, medical notes |
| 🟢 **Nurse** | `nurse@agentcare.dev` | Patient care, medication, vital signs |
| 🟣 **Patient** | `patient@agentcare.dev` | Health records, appointments, AI chat |
| 🟡 **Receptionist** | `receptionist@agentcare.dev` | Scheduling, check-in, coordination |
| 🟠 **Specialist** | `specialist@agentcare.dev` | Consultations, referrals, research |
| 🔷 **Nurse Practitioner** | `np@agentcare.dev` | Primary care, prescriptions, diagnosis |
| 🔸 **Physician Assistant** | `pa@agentcare.dev` | Assessments, treatments, procedures |

## 📋 Essential Commands

### Development
```bash
npm run dev                 # Start both frontend & backend
npm run dev:frontend        # Frontend only (port 3001)
npm run dev:backend         # Backend only (port 3000)
npm run build              # Build for production
```

### Database Operations
```bash
npm run db:setup           # Initial database setup
npm run db:seed:demo       # Seed with demo data
npm run db:reset:demo      # Reset & reseed demo data
npm run db:status          # View database statistics
npm run db:setup:force     # Force recreate database
```

### Setup & Installation
```bash
./scripts/init-demo.sh     # Complete first-time setup
npm run setup:demo         # Standard demo setup
npm run setup:fresh        # Clean install with demo data
npm run setup:production   # Production setup (no demo)
```

### Testing
```bash
npm test                   # Run all tests (3,115+ tests)
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests
npm run test:e2e           # End-to-end tests
npm run test:coverage      # Coverage report
```

### System Health
```bash
npm run health             # System health check
npm run status             # AI agent status
npm run metrics            # System metrics
npm run logs               # View logs
```

## 🎨 Theme System

### Automatic Theme Selection
- **Admin**: Dark blue with orange accents
- **Doctor**: Professional blue with teal
- **Nurse**: Warm teal with cyan
- **Patient**: Friendly purple with blue
- **Receptionist**: Welcoming green with blue

### Manual Theme Override
Users can manually select any theme from the settings menu.

## 🤖 AI Agent System

### Available Agents
- **Supervisor Agent**: Orchestrates conversations
- **Booking Agent**: Handles appointments
- **Availability Agent**: Manages schedules
- **FAQ Agent**: Answers questions

### Demo Conversations
```
"Schedule an appointment with Dr. Johnson"
"What are the symptoms of hypertension?"
"Who are the available doctors?"
"What are your office hours?"
```

## 🗄️ Database Structure

### Core Tables
- `users` - All user accounts with roles
- `providers` - Healthcare provider details
- `appointments` - Appointment scheduling
- `conversations` - AI chat history
- `system_config` - Configuration settings

### Demo Data
- **10 Demo Users** across all personas
- **4 Healthcare Providers** with schedules
- **Sample Appointments** past and future
- **Realistic Profiles** with medical data

## 🔧 Development Tools

### File Structure
```
agentcare/
├── frontend/           # React + Vite + MUI
├── backend/           # Node.js + Express + TypeScript
├── database/          # Schema, migrations, seeds
├── scripts/           # Setup and utility scripts
├── tests/            # Comprehensive test suite
└── docs/             # Documentation hub
```

### Environment Variables
```bash
# Essential .env variables
NODE_ENV=development
API_PORT=3000
DB_NAME=agentcare
DB_USER=agentcare_user
DB_PASSWORD=agentcare_pass
DEMO_MODE=true
```

### API Endpoints
- `GET /api/v1/health` - System health
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/agents/status` - AI agent status
- `POST /api/v1/agents/process` - AI chat
- `GET /api/v1/admin/users` - User management

## 🧪 Testing Overview

### Test Coverage
- **3,115+ Lines of Test Code**
- **81 Test Scenarios**
- **Unit, Integration, E2E Tests**
- **Security & HIPAA Compliance Tests**

### Test Commands
```bash
npm test                           # All tests
npm run test:watch                # Watch mode
npm run test:unit                 # Unit tests
npm run test:integration          # API tests
npm run test:security            # Security tests
npm run test:coverage            # Coverage report
```

## 🔒 Security & Compliance

### HIPAA Features
- **Data Encryption** at rest and in transit
- **Audit Logging** for all operations
- **Access Controls** role-based permissions
- **Data Isolation** between organizations

### Authentication
- **JWT Tokens** for API access
- **Session Management** with expiration
- **Role-based Access** granular permissions
- **Multi-factor Support** ready for implementation

## 🏥 Healthcare Features

### Multi-Organization Support
- Hospitals & Health Systems
- Clinics & Medical Groups
- Urgent Care Centers
- Telehealth Providers
- Specialty Centers

### User Management
- 24+ Healthcare user types
- Department-based organization
- License and credential tracking
- Emergency contact management

## 📊 Monitoring & Analytics

### System Metrics
- User registration statistics
- Appointment booking analytics
- Provider utilization rates
- System performance metrics

### Health Dashboards
- Organization-level KPIs
- User engagement tracking
- System uptime monitoring
- Security incident alerts

## 🚨 Troubleshooting

### Common Issues

**Database Connection Error:**
```bash
brew services start postgresql
npm run db:reset:demo
```

**Frontend Not Loading:**
```bash
cd frontend && npm install && npm run dev
```

**Login Issues:**
- Verify password: `AgentCare2024!`
- Clear browser localStorage
- Check console for errors

**API Errors:**
```bash
npm run logs                   # Check backend logs
npm run health                # System health check
npm run dev:backend           # Restart backend
```

### Reset Everything
```bash
npm run setup:fresh           # Complete system reset
./scripts/init-demo.sh        # Fresh demo setup
```

## 📚 Documentation Links

- **[🚀 Demo Guide](DEMO_GUIDE.md)** - Complete demo walkthrough
- **[📖 Documentation Hub](docs/README.md)** - Central docs
- **[🏥 Architecture](ARCHITECTURE_GUIDE.md)** - System design
- **[👥 User Types](HEALTHCARE_SAAS_USERS.md)** - All user roles
- **[🛠️ DevOps](DEVOPS_GUIDE.md)** - Deployment guide
- **[🧪 Testing](TEST_SUMMARY.md)** - Testing strategies

## 🎯 Key Features Demo Checklist

### Admin Features ✅
- [ ] Create new users
- [ ] View system analytics
- [ ] Manage user roles
- [ ] Reset demo data

### Healthcare Provider Features ✅
- [ ] View patient records
- [ ] Schedule appointments
- [ ] Access medical notes
- [ ] Use AI assistant

### Patient Features ✅
- [ ] Book appointments
- [ ] Chat with AI assistant
- [ ] View health records
- [ ] Manage profile

### Multi-Tenant Features ✅
- [ ] Organization isolation
- [ ] Role-based access
- [ ] Data segregation
- [ ] HIPAA compliance

---

**Built with ❤️ for Healthcare Innovation** | [GitHub](https://github.com/yourusername/agentcare) | [Issues](../../issues) | [Wiki](../../wiki) 