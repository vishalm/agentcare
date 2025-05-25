{% include doc-header.html %}

# AgentCare v2.0 Setup Guide
## Enhanced Multi-Agent Healthcare Scheduling with Ollama LLM + RAG

This guide will help you set up the enhanced AgentCare system with Ollama LLM integration, User Management System (UMS), and RAG (Retrieval-Augmented Generation) for persistent conversation memory.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+ with npm
- **Ollama** installed and running
- **Git** for version control
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/vishalm/agentcare.git
cd agentcare

# Install dependencies
npm install
```

### 2. Install and Setup Ollama

#### Install Ollama
```bash
# On macOS
brew install ollama

# On Linux
curl -fsSL https://ollama.ai/install.sh | sh

# On Windows
# Download from https://ollama.ai/download
```

#### Pull the qwen2.5 Model
```bash
# Start Ollama service (if not auto-started)
ollama serve

# In a new terminal, pull the model
ollama pull qwen2.5:latest

# Verify installation
ollama list
```

### 3. Configure Environment

```bash
# Copy environment template
cp env.example .env

# Edit the configuration file
nano .env
```

#### Essential Configuration
```env
# Application Settings
NODE_ENV=development
API_PORT=3000
LOG_LEVEL=info

# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:latest
OLLAMA_TIMEOUT=30000

# Security (IMPORTANT: Change in production)
JWT_SECRET=your-super-secure-jwt-secret-change-in-production
SESSION_SECRET=your-session-secret-key

# Feature Flags
ENABLE_OLLAMA_LLM=true
ENABLE_RAG_SYSTEM=true
ENABLE_USER_REGISTRATION=true
ENABLE_GUEST_BOOKING=true
```

### 4. Start the Application

```bash
# Development mode with auto-reload
npm run dev

# Or production mode
npm run build
npm start
```

### 5. Access the Application

🌐 **Web Interface**: http://localhost:3000
📚 **API Health Check**: http://localhost:3000/health
📊 **System Metrics**: http://localhost:3000/api/v1/metrics

---

## 🏗️ System Architecture

<div class="mermaid">
graph TB
    subgraph "Frontend Layer"
        UI[Enhanced Web UI]
        Auth[Authentication Forms]
        Chat[AI Chat Interface]
    end
    
    subgraph "API Layer"
        Express[Express.js Server]
        Routes[RESTful API Routes]
        Middleware[Security Middleware]
    end
    
    subgraph "Agent Layer"
        Supervisor[Enhanced SupervisorAgent]
        Availability[AvailabilityAgent]
        Booking[BookingAgent]
        FAQ[FAQAgent]
    end
    
    subgraph "Service Layer"
        Ollama[Ollama LLM Service]
        UMS[User Management Service]
        RAG[RAG Service]
        Traditional[Traditional Services]
    end
    
    subgraph "Data Layer"
        Memory[In-Memory Store]
        Vectors[Vector Embeddings]
        Sessions[User Sessions]
    end
    
    UI --> Express
    Express --> Supervisor
    Supervisor --> Ollama
    Supervisor --> UMS
    Supervisor --> RAG
    RAG --> Vectors
    UMS --> Sessions
</div>

---

## 🔧 Detailed Setup

### Ollama Service Configuration

#### Model Selection
The system supports multiple Ollama models:

```bash
# Recommended: qwen2.5 (default)
ollama pull qwen2.5:latest

# Alternative models:
ollama pull llama2:latest
ollama pull mistral:latest
ollama pull codellama:latest
```

#### Performance Tuning
Edit your Ollama configuration for optimal performance:

```bash
# Set environment variables
export OLLAMA_HOST=0.0.0.0:11434
export OLLAMA_NUM_PARALLEL=2
export OLLAMA_MAX_LOADED_MODELS=1
```

#### Health Check
Verify Ollama is working:

```bash
# Test basic functionality
curl http://localhost:11434/api/tags

# Test model generation
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{"model": "qwen2.5:latest", "prompt": "Hello", "stream": false}'
```

### User Management System (UMS)

#### Features
- **JWT-based authentication** with secure token management
- **User registration and login** with password hashing
- **Session management** with automatic cleanup
- **User preferences** and profile management
- **Guest mode** for unauthenticated users

#### Demo Accounts
The system includes pre-configured demo accounts:

```
Patient Account:
Email: patient@example.com
Password: demo123

Admin Account:
Email: admin@agentcare.com
Password: admin123
```

#### Security Features
- Password hashing with PBKDF2
- JWT token expiration (24 hours)
- CORS protection
- Rate limiting
- Input sanitization

### RAG System (Retrieval-Augmented Generation)

#### How It Works
1. **Message Storage**: All user messages are converted to vector embeddings
2. **Context Retrieval**: Relevant conversation history is retrieved using similarity search
3. **Enhanced Prompts**: LLM prompts are enriched with user context and preferences
4. **Conversation Memory**: Persistent memory across sessions for authenticated users

#### Vector Storage
- **In-Memory**: Fast access, suitable for development
- **Embeddings**: Generated using Ollama's embedding API
- **Similarity Search**: Cosine similarity for context retrieval
- **Cleanup**: Automatic cleanup of old conversation data

---

## 🧪 Testing the System

### 1. Basic Health Check

```bash
# Check overall system health
curl http://localhost:3000/health

# Expected response:
{
  "status": "healthy",
  "version": "2.0.0-alpha",
  "services": {
    "ollama": true,
    "supervisor": true,
    "availability": true,
    "booking": true,
    "faq": true
  },
  "features": {
    "ollama": true,
    "rag": true,
    "userManagement": true,
    "guestBooking": true
  }
}
```

### 2. Ollama Integration Test

```bash
# Check Ollama status
curl http://localhost:3000/api/v1/ollama/status

# Expected response:
{
  "status": "healthy",
  "model": "qwen2.5:latest",
  "timestamp": "2025-01-24T..."
}
```

### 3. Authentication Test

```bash
# Register a new user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "testpass123"
  }'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123"
  }'
```

### 4. AI Agent Test

```bash
# Test agent processing (guest mode)
curl -X POST http://localhost:3000/api/v1/agents/process \
  -H "Content-Type: application/json" \
  -d '{"message": "I want to book an appointment with a cardiologist"}'

# Test with authentication
curl -X POST http://localhost:3000/api/v1/agents/process \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"message": "Do you remember my previous appointment requests?"}'
```

---

## 🎯 User Guide

### Web Interface Features

#### 1. Authentication
- **Guest Mode**: Try the system without creating an account
- **Registration**: Create an account for persistent conversation memory
- **Login**: Access your conversation history and preferences

#### 2. AI Conversation
- **Natural Language**: Speak naturally about your healthcare needs
- **Context Awareness**: The AI remembers your conversation history
- **Multi-Agent Routing**: Requests are intelligently routed to specialized agents

#### 3. Example Interactions

**Booking Appointments:**
- "I want to book an appointment with a cardiologist"
- "Can I schedule a checkup for next week?"
- "I need to see Dr. Johnson as soon as possible"

**Checking Availability:**
- "What doctors are available this week?"
- "When is Dr. Smith free?"
- "Show me all cardiology appointments"

**Information Requests:**
- "Tell me about Dr. Sarah Johnson"
- "What are your office hours?"
- "What should I bring to my appointment?"

**Account Management:**
- "Can I reschedule my appointment?"
- "What's my appointment history?"
- "Update my contact information"

### API Endpoints

#### Authentication
```
POST /api/v1/auth/register    # Register new user
POST /api/v1/auth/login       # User login
POST /api/v1/auth/logout      # User logout
```

#### User Management
```
GET  /api/v1/user/profile     # Get user profile
PUT  /api/v1/user/preferences # Update preferences
```

#### AI Agents
```
POST /api/v1/agents/process   # Process user message
GET  /api/v1/agents/status    # Get agent status
```

#### Conversation
```
POST /api/v1/conversation/reset # Reset conversation memory
```

#### System
```
GET  /health                  # System health check
GET  /api/v1/metrics         # System metrics
GET  /api/v1/ollama/status   # Ollama status
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Ollama Connection Failed
**Symptoms**: "Ollama service is not available" in status

**Solutions**:
```bash
# Check if Ollama is running
ps aux | grep ollama

# Start Ollama service
ollama serve

# Check port availability
netstat -an | grep 11434

# Test direct connection
curl http://localhost:11434/api/tags
```

#### 2. Model Not Found
**Symptoms**: "Model not available" errors

**Solutions**:
```bash
# List available models
ollama list

# Pull the required model
ollama pull qwen2.5:latest

# Check disk space
df -h
```

#### 3. Authentication Issues
**Symptoms**: "Invalid token" or login failures

**Solutions**:
- Check JWT secret in environment variables
- Clear browser localStorage
- Verify password requirements
- Check server logs for detailed error messages

#### 4. Performance Issues
**Symptoms**: Slow response times

**Solutions**:
- Monitor system resources (CPU, RAM)
- Optimize Ollama configuration
- Reduce context window size
- Clear conversation history

### Logging and Debugging

#### Enable Debug Mode
```env
# In .env file
LOG_LEVEL=debug
DEBUG_MODE=true
```

#### View Logs
```bash
# Application logs
npm run dev | grep ERROR

# Ollama logs
ollama logs
```

#### Performance Monitoring
Access metrics at: http://localhost:3000/api/v1/metrics

---

## 🚀 Production Deployment

### Environment Setup

#### Production Configuration
```env
NODE_ENV=production
API_PORT=3000
LOG_LEVEL=info

# Security (Generate strong secrets)
JWT_SECRET=your-production-jwt-secret-64-chars-long
SESSION_SECRET=your-production-session-secret

# Ollama (Production server)
OLLAMA_BASE_URL=http://ollama-server:11434

# Features
ENABLE_OLLAMA_LLM=true
ENABLE_RAG_SYSTEM=true
ENABLE_USER_REGISTRATION=true
```

#### Docker Deployment
```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

#### Docker Compose
```yaml
version: '3.8'
services:
  agentcare:
    build: .
    ports:
      - "3000:3000"
    environment:
      - OLLAMA_BASE_URL=http://ollama:11434
    depends_on:
      - ollama
  
  ollama:
    image: ollama/ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama

volumes:
  ollama_data:
```

### Security Considerations

1. **Change Default Secrets**: Update JWT and session secrets
2. **Enable HTTPS**: Use SSL/TLS certificates
3. **Firewall Rules**: Restrict access to necessary ports
4. **Rate Limiting**: Configure appropriate rate limits
5. **Monitoring**: Set up log aggregation and monitoring

---

## 🔮 What's New in v2.0

### Major Enhancements

1. **🤖 Ollama LLM Integration**
   - Natural language understanding and generation
   - Support for multiple open-source models
   - Fallback mechanisms for reliability

2. **🧠 RAG System**
   - Persistent conversation memory
   - Context-aware responses
   - Vector-based similarity search

3. **🔐 User Management System**
   - JWT-based authentication
   - User preferences and profiles
   - Session management

4. **💬 Enhanced UI**
   - Modern, responsive design
   - Real-time status indicators
   - Conversation history

5. **🔧 Developer Experience**
   - Comprehensive testing suite
   - Detailed documentation
   - Development tools

### Migration from v1.0

If upgrading from v1.0:

1. Install new dependencies: `npm install`
2. Set up Ollama and pull models
3. Update environment configuration
4. Existing conversations will start fresh (no automatic migration)

---

## 📞 Support

### Getting Help

- **GitHub Issues**: https://github.com/vishalm/agentcare/issues
- **Documentation**: Check README.md and docs/ folder
- **Health Check**: http://localhost:3000/health

### Development

```bash
# Run tests
npm test

# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## 🎉 Congratulations!

You now have a fully functional AI-powered healthcare scheduling system with:

✅ **Ollama LLM** for natural conversations  
✅ **RAG system** for conversation memory  
✅ **User authentication** and management  
✅ **Multi-agent coordination** for specialized tasks  
✅ **Modern web interface** with real-time features  

**Next Steps:**
1. Explore the example interactions
2. Create user accounts and test persistence
3. Customize the system for your needs
4. Deploy to production environment

Happy scheduling! 🏥✨ 