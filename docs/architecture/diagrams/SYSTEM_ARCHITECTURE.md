# AgentCare System Architecture Diagrams

## 🏗️ High-Level System Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        React[React App]
        UI[Material-UI]
        Store[Zustand Store]
        Router[React Router]
    end
    
    subgraph "API Gateway Layer"
        Express[Express Server]
        Auth[JWT Auth]
        Rate[Rate Limiting]
        CORS[CORS Handler]
    end
    
    subgraph "Multi-Agent System"
        Supervisor[Supervisor Agent]
        Booking[Booking Agent]
        Availability[Availability Agent]
        FAQ[FAQ Agent]
        
        Supervisor --> Booking
        Supervisor --> Availability
        Supervisor --> FAQ
    end
    
    subgraph "AI/LLM Layer"
        Ollama[Ollama LLM]
        RAG[RAG System]
        Embeddings[Vector Embeddings]
        Knowledge[Knowledge Base]
    end
    
    subgraph "Data Layer"
        Postgres[(PostgreSQL)]
        Redis[(Redis Cache)]
        Files[File Storage]
    end
    
    subgraph "Infrastructure"
        Docker[Docker Containers]
        K8s[Kubernetes]
        Monitor[Monitoring]
        Logs[Centralized Logging]
    end
    
    React --> Express
    Express --> Supervisor
    Supervisor --> Ollama
    Supervisor --> RAG
    Booking --> Postgres
    Availability --> Postgres
    FAQ --> Knowledge
    Express --> Redis
    Express --> Postgres
    
    Docker --> K8s
    K8s --> Monitor
    K8s --> Logs
```

## 🤖 Multi-Agent Architecture

```mermaid
graph TD
    subgraph "Agent Coordination Layer"
        SM[Supervisor Agent]
        Queue[Message Queue]
        Events[Event Bus]
    end
    
    subgraph "Specialized Agents"
        BA[Booking Agent]
        AA[Availability Agent]
        FA[FAQ Agent]
        NA[Notification Agent]
    end
    
    subgraph "Agent Tools"
        DB_Tool[Database Tool]
        Calendar_Tool[Calendar Tool]
        Email_Tool[Email Tool]
        LLM_Tool[LLM Tool]
        Validation_Tool[Validation Tool]
    end
    
    subgraph "External Services"
        LLM[Ollama LLM]
        DB[(Database)]
        Email_Service[Email Service]
        Calendar_API[Calendar API]
    end
    
    User_Request[User Request] --> SM
    SM --> Queue
    Queue --> BA
    Queue --> AA
    Queue --> FA
    Queue --> NA
    
    BA --> DB_Tool
    BA --> Calendar_Tool
    AA --> DB_Tool
    AA --> Calendar_Tool
    FA --> LLM_Tool
    NA --> Email_Tool
    
    DB_Tool --> DB
    Calendar_Tool --> Calendar_API
    Email_Tool --> Email_Service
    LLM_Tool --> LLM
    
    SM --> Events
    Events --> Response[Coordinated Response]
```

## 🔄 Request Flow Architecture

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API_Gateway
    participant Supervisor
    participant Agents
    participant Database
    participant LLM
    
    User->>Frontend: Makes Request
    Frontend->>API_Gateway: HTTP Request
    API_Gateway->>API_Gateway: Validate Auth
    API_Gateway->>API_Gateway: Rate Limiting
    API_Gateway->>Supervisor: Route Request
    
    Supervisor->>Supervisor: Parse Intent
    Supervisor->>Agents: Delegate Tasks
    
    alt Booking Request
        Agents->>Database: Check Availability
        Agents->>Database: Create Booking
    else Information Request
        Agents->>LLM: Generate Response
    end
    
    Agents->>Supervisor: Return Results
    Supervisor->>API_Gateway: Coordinated Response
    API_Gateway->>Frontend: JSON Response
    Frontend->>User: Updated UI
```

## 📊 Data Architecture

```mermaid
erDiagram
    USERS {
        int id PK
        string email UK
        string password_hash
        string first_name
        string last_name
        string role
        timestamp created_at
        timestamp updated_at
    }
    
    PROVIDERS {
        int id PK
        string name
        string email UK
        string specialty
        json availability_schedule
        boolean is_active
        timestamp created_at
    }
    
    APPOINTMENTS {
        int id PK
        int user_id FK
        int provider_id FK
        timestamp appointment_date
        int duration_minutes
        string status
        text notes
        timestamp created_at
        timestamp updated_at
    }
    
    AGENT_SESSIONS {
        int id PK
        int user_id FK
        string session_id UK
        json conversation_history
        string current_agent
        json context_data
        timestamp created_at
        timestamp updated_at
    }
    
    KNOWLEDGE_BASE {
        int id PK
        string title
        text content
        json metadata
        vector embeddings
        timestamp created_at
        timestamp updated_at
    }
    
    USERS ||--o{ APPOINTMENTS : makes
    PROVIDERS ||--o{ APPOINTMENTS : provides
    USERS ||--o{ AGENT_SESSIONS : has
```

## 🛡️ Security Architecture

```mermaid
graph TB
    subgraph "Frontend Security"
        CSP[Content Security Policy]
        XSS[XSS Protection]
        HTTPS[HTTPS Encryption]
    end
    
    subgraph "API Security"
        JWT[JWT Authentication]
        RBAC[Role-Based Access]
        RateLimit[Rate Limiting]
        InputVal[Input Validation]
        CORS_Policy[CORS Policy]
    end
    
    subgraph "Data Security"
        Encryption[Data Encryption]
        HashPass[Password Hashing]
        Audit[Audit Logging]
        HIPAA[HIPAA Compliance]
    end
    
    subgraph "Infrastructure Security"
        WAF[Web Application Firewall]
        VPN[VPN Access]
        SecretMgmt[Secret Management]
        ContainerSec[Container Security]
    end
    
    User_Request --> CSP
    CSP --> JWT
    JWT --> RBAC
    RBAC --> InputVal
    InputVal --> Encryption
    
    WAF --> CSP
    VPN --> SecretMgmt
    SecretMgmt --> ContainerSec
    Audit --> HIPAA
```

## 🚀 Deployment Architecture

```mermaid
graph TB
    subgraph "Development"
        Dev_Local[Local Development]
        Dev_Docker[Docker Compose]
        Dev_DB[(Local PostgreSQL)]
    end
    
    subgraph "CI/CD Pipeline"
        GitHub[GitHub Repository]
        Actions[GitHub Actions]
        Tests[Automated Tests]
        SonarCloud[SonarCloud]
        Registry[Container Registry]
    end
    
    subgraph "Staging Environment"
        Stage_K8s[Kubernetes Cluster]
        Stage_Ingress[Ingress Controller]
        Stage_Pods[Application Pods]
        Stage_DB[(Staging Database)]
    end
    
    subgraph "Production Environment"
        Prod_K8s[Kubernetes Cluster]
        Prod_LB[Load Balancer]
        Prod_Pods[Application Pods]
        Prod_DB[(Production Database)]
        Prod_Redis[(Redis Cluster)]
    end
    
    subgraph "Monitoring"
        Prometheus[Prometheus]
        Grafana[Grafana]
        Alerts[Alert Manager]
        Logs[Centralized Logging]
    end
    
    Dev_Local --> GitHub
    GitHub --> Actions
    Actions --> Tests
    Tests --> SonarCloud
    SonarCloud --> Registry
    
    Registry --> Stage_K8s
    Stage_K8s --> Stage_Ingress
    Stage_Ingress --> Stage_Pods
    Stage_Pods --> Stage_DB
    
    Registry --> Prod_K8s
    Prod_K8s --> Prod_LB
    Prod_LB --> Prod_Pods
    Prod_Pods --> Prod_DB
    Prod_Pods --> Prod_Redis
    
    Prod_K8s --> Prometheus
    Prometheus --> Grafana
    Prometheus --> Alerts
    Prod_Pods --> Logs
```

## 🔄 AI/LLM Integration Architecture

```mermaid
graph TB
    subgraph "LLM Processing Layer"
        Input[User Input]
        Preprocessing[Text Preprocessing]
        Intent[Intent Recognition]
        Context[Context Management]
    end
    
    subgraph "Ollama Integration"
        Ollama_Server[Ollama Server]
        Models[LLM Models]
        Qwen[Qwen 2.5]
        DeepSeek[DeepSeek R1]
    end
    
    subgraph "RAG System"
        VectorDB[(Vector Database)]
        Embeddings[Text Embeddings]
        Retrieval[Document Retrieval]
        Augmentation[Context Augmentation]
    end
    
    subgraph "Response Generation"
        Generation[Response Generation]
        Postprocessing[Post-processing]
        Validation[Response Validation]
        Output[Final Response]
    end
    
    Input --> Preprocessing
    Preprocessing --> Intent
    Intent --> Context
    Context --> Ollama_Server
    
    Ollama_Server --> Models
    Models --> Qwen
    Models --> DeepSeek
    
    Context --> VectorDB
    VectorDB --> Embeddings
    Embeddings --> Retrieval
    Retrieval --> Augmentation
    
    Ollama_Server --> Generation
    Augmentation --> Generation
    Generation --> Postprocessing
    Postprocessing --> Validation
    Validation --> Output
```

## 📱 Frontend Component Architecture

```mermaid
graph TB
    subgraph "App Shell"
        App[App Component]
        Router[React Router]
        Theme[Theme Provider]
        Store[Global Store]
    end
    
    subgraph "Layout Components"
        Layout[Main Layout]
        Header[Header]
        Sidebar[Sidebar]
        Footer[Footer]
    end
    
    subgraph "Page Components"
        Dashboard[Dashboard Page]
        Chat[Chat Page]
        Profile[Profile Page]
        Admin[Admin Page]
    end
    
    subgraph "Feature Components"
        ChatInterface[Chat Interface]
        AppointmentForm[Appointment Form]
        Calendar[Calendar View]
        UserManagement[User Management]
    end
    
    subgraph "UI Components"
        Button[Button]
        Input[Input]
        Modal[Modal]
        Card[Card]
        Table[Table]
    end
    
    App --> Router
    Router --> Layout
    Layout --> Header
    Layout --> Sidebar
    Layout --> Footer
    
    Router --> Dashboard
    Router --> Chat
    Router --> Profile
    Router --> Admin
    
    Chat --> ChatInterface
    Dashboard --> AppointmentForm
    Dashboard --> Calendar
    Admin --> UserManagement
    
    ChatInterface --> Button
    ChatInterface --> Input
    AppointmentForm --> Modal
    Calendar --> Card
    UserManagement --> Table
```

These diagrams provide a comprehensive visual representation of the AgentCare system architecture, covering all major components and their interactions. They can be used for:

- **System Understanding**: Quick overview of how components interact
- **Documentation**: Technical documentation for developers
- **Planning**: Architecture decisions and future enhancements
- **Troubleshooting**: Understanding data flow for debugging
- **Onboarding**: Helping new team members understand the system 