---
layout: page
title: Mermaid Diagrams Guide
description: How to create beautiful diagrams in AgentCare documentation using Mermaid
---

# 📊 Mermaid Diagrams Guide

This guide shows how to create beautiful, interactive diagrams in AgentCare documentation using Mermaid syntax.

## 🚀 Quick Start

Mermaid diagrams are written in code blocks with `mermaid` as the language:

````markdown
```mermaid
graph TD
    A[Start] --> B[Process]
    B --> C[End]
```
````

## 📋 Supported Diagram Types

### 1. Flowcharts - System Architecture

Perfect for showing AgentCare's multi-agent architecture:

```mermaid
graph TB
    subgraph "🏥 Healthcare Organization"
        Patient[👤 Patient]
        Doctor[👨‍⚕️ Doctor]
        Admin[👔 Administrator]
    end
    
    subgraph "🤖 AgentCare System"
        API[🔧 Backend API]
        Frontend[🖥️ React Frontend]
        
        subgraph "AI Agents"
            Supervisor[🧠 Supervisor]
            Booking[📅 Booking]
            FAQ[❓ FAQ]
        end
        
        Database[(🗄️ PostgreSQL)]
        LLM[🤖 Ollama LLM]
    end
    
    Patient --> Frontend
    Doctor --> Frontend
    Admin --> Frontend
    
    Frontend --> API
    API --> Supervisor
    Supervisor --> Booking
    Supervisor --> FAQ
    
    Booking --> Database
    FAQ --> Database
    Supervisor --> LLM
    
    classDef healthcare fill:#2c5aa0,stroke:#1e3a5f,color:#fff
    classDef system fill:#4a90c2,stroke:#2c5aa0,color:#fff
    classDef ai fill:#fd7e14,stroke:#e85d04,color:#fff
    classDef data fill:#28a745,stroke:#1e7e34,color:#fff
    
    class Patient,Doctor,Admin healthcare
    class API,Frontend system
    class Supervisor,Booking,FAQ ai
    class Database,LLM data
```

### 2. Sequence Diagrams - API Interactions

Show how components interact over time:

```mermaid
sequenceDiagram
    participant U as 👤 User
    participant F as 🖥️ Frontend
    participant S as 🤖 Supervisor Agent
    participant A as 📅 Availability Agent
    participant D as 🗄️ Database
    participant L as 🧠 Ollama LLM
    
    U->>F: "Book appointment with cardiologist"
    F->>S: POST /api/v1/agents/process
    
    S->>L: Analyze intent
    L-->>S: Intent: "booking", Entity: "cardiologist"
    
    S->>A: Delegate to Availability Agent
    A->>D: Query available cardiologists
    D-->>A: Return available slots
    
    A->>L: Generate response with options
    L-->>A: Formatted availability response
    
    A-->>S: Available appointments
    S-->>F: JSON response with options
    F-->>U: Display available appointments
    
    Note over U,L: Multi-agent coordination with<br/>natural language processing
```

### 3. Entity Relationship Diagrams - Database Schema

Visualize database relationships:

```mermaid
erDiagram
    ORGANIZATIONS {
        uuid id PK
        string name
        string type
        jsonb address
        timestamp created_at
    }
    
    USERS {
        uuid id PK
        uuid organization_id FK
        string email
        string name
        string role
        jsonb profile_data
        timestamp created_at
    }
    
    APPOINTMENTS {
        uuid id PK
        uuid organization_id FK
        uuid patient_id FK
        uuid provider_id FK
        timestamp appointment_time
        string status
        text notes
    }
    
    CONVERSATION_MESSAGES {
        uuid id PK
        uuid user_id FK
        string session_id
        text message
        vector embedding
        string role
        timestamp created_at
    }
    
    ORGANIZATIONS ||--o{ USERS : "has"
    ORGANIZATIONS ||--o{ APPOINTMENTS : "manages"
    USERS ||--o{ APPOINTMENTS : "patient_appointments"
    USERS ||--o{ APPOINTMENTS : "provider_appointments"
    USERS ||--o{ CONVERSATION_MESSAGES : "converses"
```

### 4. State Diagrams - Appointment Workflow

Show state transitions in healthcare workflows:

```mermaid
stateDiagram-v2
    [*] --> Requested : Patient requests appointment
    
    Requested --> Available : Check availability
    Available --> Scheduled : Slot confirmed
    Available --> Waitlisted : No immediate slots
    
    Scheduled --> Confirmed : Provider confirms
    Scheduled --> Rescheduled : Time change needed
    
    Confirmed --> InProgress : Patient arrives
    Confirmed --> NoShow : Patient doesn't arrive
    Confirmed --> Cancelled : Cancellation requested
    
    InProgress --> Completed : Appointment finished
    Completed --> FollowUp : Follow-up needed
    FollowUp --> [*]
    
    Waitlisted --> Scheduled : Slot becomes available
    Rescheduled --> Scheduled : New time confirmed
    NoShow --> [*]
    Cancelled --> [*]
    
    note right of Confirmed
        Automated reminders sent
        24 hours before appointment
    end note
```

### 5. Gantt Charts - Project Timeline

Track development and deployment phases:

```mermaid
gantt
    title AgentCare Development Timeline
    dateFormat  YYYY-MM-DD
    section Phase 1: Core System
    Multi-Agent Framework    :done, framework, 2024-01-01, 2024-02-15
    Database Schema         :done, database, 2024-01-15, 2024-02-28
    API Development         :done, api, 2024-02-01, 2024-03-15
    
    section Phase 2: AI Integration
    Ollama LLM Setup        :done, llm, 2024-02-15, 2024-03-01
    Agent Development       :done, agents, 2024-03-01, 2024-04-15
    RAG Implementation      :done, rag, 2024-03-15, 2024-04-30
    
    section Phase 3: Healthcare Features
    Multi-Tenancy          :done, tenancy, 2024-04-01, 2024-05-15
    HIPAA Compliance       :done, hipaa, 2024-04-15, 2024-05-30
    User Management        :done, users, 2024-05-01, 2024-06-15
    
    section Phase 4: Production
    Testing & QA           :active, testing, 2024-05-15, 2024-06-30
    Documentation          :active, docs, 2024-06-01, 2024-06-30
    Deployment             :deploy, 2024-06-15, 2024-07-15
```

### 6. Class Diagrams - Agent Architecture

Show object-oriented design:

```mermaid
classDiagram
    class SupervisorAgent {
        +String agentId
        +ConversationContext context
        +process(message: String) Promise~AgentResponse~
        +delegateToAgent(intent: Intent) Promise~AgentResponse~
        +analyzeIntent(message: String) Intent
        -validateRequest(message: String) Boolean
    }
    
    class AvailabilityAgent {
        +AvailabilityTools tools
        +process(request: AvailabilityRequest) Promise~AvailabilityResponse~
        +checkDoctorAvailability(doctorId: String) AvailableSlot[]
        +filterBySpecialization(specialty: String) Doctor[]
    }
    
    class BookingAgent {
        +BookingTools tools
        +process(request: BookingRequest) Promise~BookingResponse~
        +createAppointment(details: AppointmentDetails) Appointment
        +confirmBooking(appointmentId: String) Boolean
    }
    
    class FAQAgent {
        +FAQTools tools
        +knowledgeBase: FAQDatabase
        +process(request: FAQRequest) Promise~FAQResponse~
        +searchFAQ(query: String) FAQEntry[]
    }
    
    class OllamaService {
        +String baseUrl
        +String model
        +generateResponse(prompt: String) Promise~String~
        +embedText(text: String) Promise~Vector~
    }
    
    SupervisorAgent --> AvailabilityAgent : delegates
    SupervisorAgent --> BookingAgent : delegates
    SupervisorAgent --> FAQAgent : delegates
    SupervisorAgent --> OllamaService : uses
    AvailabilityAgent --> OllamaService : uses
    BookingAgent --> OllamaService : uses
    FAQAgent --> OllamaService : uses
```

## 🎨 Healthcare Theme Colors

Our Mermaid setup includes healthcare-themed colors:

- **Primary Blue**: `#2c5aa0` - Main healthcare branding
- **Agent Blue**: `#4a90c2` - AI agents and systems
- **Success Green**: `#28a745` - Database and successful states
- **Warning Orange**: `#fd7e14` - AI/LLM components
- **Info Purple**: `#6f42c1` - User interactions

### Using Custom Classes

Add healthcare-specific styling to your diagrams:

```mermaid
graph LR
    A[Healthcare Provider]:::healthcare
    B[AgentCare System]:::system
    C[AI Agent]:::ai
    D[Database]:::database
    
    A --> B
    B --> C
    C --> D
    
    classDef healthcare fill:#2c5aa0,stroke:#1e3a5f,color:#fff
    classDef system fill:#4a90c2,stroke:#2c5aa0,color:#fff
    classDef ai fill:#fd7e14,stroke:#e85d04,color:#fff
    classDef database fill:#28a745,stroke:#1e7e34,color:#fff
```

## 📱 Responsive Design

All diagrams are automatically responsive and include:
- Mobile-friendly scaling
- Touch-friendly interactions
- Dark mode support
- Accessibility features

## 🔧 Advanced Features

### Subgraphs for Organization

Use subgraphs to group related components:

```mermaid
graph TB
    subgraph "Frontend Layer"
        UI[React Components]
        State[Redux Store]
    end
    
    subgraph "Backend Layer"
        API[Express API]
        Auth[JWT Auth]
    end
    
    subgraph "Data Layer"
        DB[(PostgreSQL)]
        Cache[(Redis)]
    end
    
    UI --> State
    UI --> API
    API --> Auth
    API --> DB
    DB --> Cache
```

### Interactive Elements

Mermaid diagrams support click events and tooltips:

```mermaid
graph TD
    A[Click Me!] --> B[Action Triggered]
    
    click A "https://agentcare.dev" "Visit AgentCare"
```

## 💡 Best Practices

1. **Keep It Simple**: Focus on the essential information
2. **Use Consistent Colors**: Stick to healthcare theme colors
3. **Add Context**: Use subgraphs to group related items
4. **Responsive Design**: Test on different screen sizes
5. **Accessibility**: Use meaningful labels and descriptions

## 📞 Support

For Mermaid-specific issues:
- [Mermaid Documentation](https://mermaid-js.github.io/mermaid/)
- [Mermaid Live Editor](https://mermaid.live/) - Test diagrams
- [GitHub Issues](https://github.com/mermaid-js/mermaid/issues) - Report bugs

---

**🏥 Beautiful Diagrams for Healthcare Documentation**  
*Enhancing technical communication with visual clarity* 