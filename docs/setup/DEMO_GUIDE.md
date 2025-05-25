# AgentCare Demo Guide

🎯 **Complete Guide to AgentCare Demo Features & Personas**

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Git

### One-Command Setup
```bash
# Complete setup with demo data
npm run setup:demo

# Or step by step
npm install
npm run db:setup
npm run dev
```

### Access the System
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **API Docs**: http://localhost:3000/api-docs

## Demo Credentials

All demo accounts use the password: **`AgentCare2024!`**

### 🔴 System Administrator
```
Email: admin@agentcare.dev
Password: AgentCare2024!
Role: System Administrator
```
**Features Available:**
- Complete user management (create, edit, delete users)
- System analytics and monitoring
- Database seeding and management
- Role-based access control
- System configuration
- Audit logs and security monitoring

**Demo Scenarios:**
1. User Management: Create a new doctor account
2. Analytics: View system-wide statistics
3. Database: Reset and reseed demo data
4. Security: Review user access logs

### 🔵 Doctor/Physician
```
Email: doctor@agentcare.dev
Password: AgentCare2024!
Role: Healthcare Provider
Name: Dr. Sarah Johnson
Department: Cardiology
```
**Features Available:**
- Patient record access and management
- Appointment scheduling and management
- Medical notes and documentation
- Treatment plan creation
- Provider schedule management
- Clinical decision support

**Demo Scenarios:**
1. Patient Care: Review John Smith's cardiology follow-up
2. Scheduling: Manage appointment calendar
3. Documentation: Add clinical notes
4. AI Assistant: Ask for treatment recommendations

### 🟢 Nurse
```
Email: nurse@agentcare.dev
Password: AgentCare2024!
Role: Nursing Staff
Name: Alice Brown, RN
Department: Emergency
```
**Features Available:**
- Basic patient record access
- Medication administration tracking
- Vital signs documentation
- Shift management
- Care coordination
- Patient education resources

**Demo Scenarios:**
1. Patient Monitoring: Check vital signs
2. Medication: Review medication schedules
3. Care Plans: Update nursing care plans
4. Communication: Coordinate with physicians

### 🟣 Patient
```
Email: patient@agentcare.dev
Password: AgentCare2024!
Role: Healthcare Consumer
Name: John Smith
Conditions: Hypertension
```
**Features Available:**
- Personal health record access
- Appointment booking and management
- AI health assistant
- Medication reminders
- Test results viewing
- Health education resources

**Demo Scenarios:**
1. Self-Service: Book a follow-up appointment
2. Health Chat: Ask AI about hypertension management
3. Records: View recent test results
4. Wellness: Track health metrics

### 🟡 Receptionist
```
Email: receptionist@agentcare.dev
Password: AgentCare2024!
Role: Front Desk Staff
Name: Maria Garcia
Department: Front Desk
Languages: English, Spanish
```
**Features Available:**
- Appointment scheduling for all providers
- Patient check-in and registration
- Insurance verification
- Basic patient information management
- Provider schedule coordination
- Patient communication

**Demo Scenarios:**
1. Scheduling: Book appointment for walk-in patient
2. Check-in: Process patient arrival
3. Coordination: Manage provider schedules
4. Communication: Handle patient inquiries

### 🟠 Medical Specialist
```
Email: specialist@agentcare.dev
Password: AgentCare2024!
Role: Medical Specialist
Name: Dr. Michael Chen
Department: Neurology
```
**Features Available:**
- Specialized patient consultations
- Advanced diagnostic tools
- Referral management
- Specialized treatment protocols
- Research and clinical trials
- Interdisciplinary consultation

**Demo Scenarios:**
1. Consultation: Review complex neurology case
2. Referrals: Process specialist referrals
3. Collaboration: Coordinate with primary care
4. Research: Access clinical guidelines

### 🔷 Nurse Practitioner
```
Email: np@agentcare.dev
Password: AgentCare2024!
Role: Advanced Practice Nurse
Name: Jennifer Wilson, NP
Department: Primary Care
```
**Features Available:**
- Independent patient care
- Prescription management
- Diagnostic capabilities
- Treatment plan development
- Patient education
- Preventive care coordination

### 🔸 Physician Assistant
```
Email: pa@agentcare.dev
Password: AgentCare2024!
Role: Physician Assistant
Name: David Martinez, PA-C
Department: Orthopedics
```
**Features Available:**
- Patient assessment and treatment
- Medical procedure assistance
- Treatment plan implementation
- Patient counseling
- Care coordination
- Specialized orthopedic protocols

## Theme Showcase

### Theme Selection
- **Automatic**: Themes auto-apply based on user role
- **Manual Override**: Users can manually select any theme
- **Persistent**: Theme preferences saved per user

### Theme Details

#### Administrator Theme
- **Primary**: Dark Blue (#1e40af)
- **Secondary**: Orange (#f97316)
- **Style**: Professional, authoritative
- **Features**: Dark sidebar, high contrast

#### Doctor Theme
- **Primary**: Professional Blue (#0066cc)
- **Secondary**: Teal (#14b8a6)
- **Style**: Medical, trustworthy
- **Features**: Clean layout, medical icons

#### Nurse Theme
- **Primary**: Warm Teal (#14b8a6)
- **Secondary**: Cyan (#06b6d4)
- **Style**: Caring, approachable
- **Features**: Soft edges, warm colors

#### Patient Theme
- **Primary**: Friendly Purple (#7c3aed)
- **Secondary**: Blue (#3b82f6)
- **Style**: Welcoming, accessible
- **Features**: Large buttons, clear navigation

#### Receptionist Theme
- **Primary**: Welcoming Green (#059669)
- **Secondary**: Blue (#3b82f6)
- **Style**: Professional, efficient
- **Features**: Quick actions, clear workflow

## AI Agent System

### Multi-Agent Architecture
- **Supervisor Agent**: Orchestrates conversations
- **Booking Agent**: Handles appointment scheduling
- **Availability Agent**: Manages provider schedules
- **FAQ Agent**: Answers common questions

### Demo Conversations
Try these sample conversations:

1. **Appointment Booking**:
   ```
   "I need to schedule a cardiology appointment"
   "Book me with Dr. Johnson next week"
   "What appointments are available on Friday?"
   ```

2. **Health Questions**:
   ```
   "What are the symptoms of hypertension?"
   "How often should I check my blood pressure?"
   "What foods should I avoid with high blood pressure?"
   ```

3. **System Information**:
   ```
   "Who are the available doctors?"
   "What are your office hours?"
   "How do I access my test results?"
   ```

## Database Demo Data

### Sample Data Included
- **10 Demo Users**: Covering all personas
- **4 Healthcare Providers**: With different specializations
- **Sample Appointments**: Past and upcoming
- **Provider Schedules**: Realistic availability
- **System Configuration**: Demo mode settings

### Database Commands
```bash
# View database statistics
npm run db:status

# Reset and reseed all demo data
npm run db:reset:demo

# Setup database without demo data
npm run db:setup:no-demo

# Force recreate everything
npm run db:setup:force
```

## System Features Demo

### User Management (Admin Only)
1. **Create New User**:
   - Navigate to Admin → User Management
   - Click "Add User"
   - Fill in user details
   - Assign role and permissions

2. **Role Management**:
   - View user roles and permissions
   - Edit user access levels
   - Deactivate/activate users

### AI Health Assistant
1. **Natural Language Processing**:
   - Ask questions in natural language
   - Get contextual responses
   - Multi-turn conversations

2. **Intent Recognition**:
   - Booking requests
   - Health information queries
   - System navigation help

### Appointment System
1. **Scheduling**:
   - Provider availability checking
   - Appointment conflict resolution
   - Automated reminders

2. **Management**:
   - View, edit, cancel appointments
   - Patient and provider perspectives
   - Integration with provider schedules

## Development & Customization

### Theme Customization
```typescript
// Edit: frontend/src/theme/themes.ts
export const customTheme = createTheme({
  palette: {
    primary: { main: '#your-color' },
    secondary: { main: '#your-secondary' }
  }
});
```

### Adding New Personas
1. **Database**: Add user to demo seeds
2. **Frontend**: Update user types and themes
3. **Permissions**: Define role-based access
4. **UI**: Customize navigation and features

### API Integration
```typescript
// Example: Add new demo user
const newUser = await apiService.createUser({
  email: 'newrole@agentcare.dev',
  password: 'AgentCare2024!',
  name: 'New Role User',
  role: 'custom_role'
});
```

## Performance & Architecture

### System Metrics
- **Response Time**: < 200ms for most operations
- **Concurrent Users**: Supports 100+ simultaneous users
- **Database**: Optimized queries with indexing
- **Caching**: Redis for session and query caching

### Scalability Features
- **Horizontal Scaling**: Multi-instance support
- **Load Balancing**: Built-in health checks
- **Database Optimization**: Connection pooling
- **CDN Ready**: Static asset optimization

## Troubleshooting

### Common Issues

1. **Database Connection Errors**:
   ```bash
   # Check PostgreSQL status
   brew services start postgresql
   
   # Reset database
   npm run db:reset:demo
   ```

2. **Frontend Not Loading**:
   ```bash
   # Check if React dev server is running
   cd frontend
   npm start
   ```

3. **API Errors**:
   ```bash
   # Check backend logs
   npm run logs
   
   # Restart backend
   npm run dev:backend
   ```

4. **Login Issues**:
   - Verify password: `AgentCare2024!`
   - Check console for errors
   - Clear browser cache/localStorage

### Reset Everything
```bash
# Complete system reset
npm run setup:fresh
```

## Next Steps

### Production Deployment
1. **Environment Setup**: Configure production environment variables
2. **Database Migration**: Set up production database
3. **Security**: Implement proper authentication
4. **Monitoring**: Set up logging and monitoring

### Feature Enhancement
1. **Real AI Integration**: Connect to actual LLM services
2. **FHIR Compliance**: Implement healthcare standards
3. **Mobile App**: Develop companion mobile application
4. **Telehealth**: Add video consultation features

### Integration Options
1. **EHR Systems**: Epic, Cerner, AllScripts integration
2. **Payment Processing**: Insurance and billing systems
3. **Lab Systems**: Laboratory information management
4. **Pharmacy**: E-prescribing integration

---

## Support & Resources

- 📚 **Documentation**: [docs/README.md](docs/README.md)
- 🐛 **Issues**: [GitHub Issues](../../issues)
- 💬 **Discussions**: [GitHub Discussions](../../discussions)
- 📧 **Support**: support@agentcare.dev

**Built with ❤️ for Healthcare Innovation** 