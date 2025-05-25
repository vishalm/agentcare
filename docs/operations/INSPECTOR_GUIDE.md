# 🩺 AgentCare System Inspector Guide

## Multi-Agent Healthcare System Diagnostics & Troubleshooting

The AgentCare Inspector is a comprehensive health check tool that validates all components of the multi-agent healthcare scheduling system, including PostgreSQL with pgvector for RAG, Redis cache, Ollama LLM, backend API, frontend application, and Docker containers.

## 🚀 Quick Start

```bash
# Make executable and run
chmod +x agentcare-inspector.sh
./agentcare-inspector.sh

# Or run with options
./agentcare-inspector.sh --help
./agentcare-inspector.sh --quiet     # Errors only
./agentcare-inspector.sh --verbose   # Detailed output
```

## 📋 What It Checks

### 1. **Environment & Configuration**
- ✅ `.env` file existence and validity
- ✅ Critical environment variables (`DATABASE_URL`, `OLLAMA_BASE_URL`, `REDIS_URL`)
- ✅ Feature flags (`ENABLE_OLLAMA_LLM`, `ENABLE_RAG_SYSTEM`)
- ✅ Docker Compose configuration

### 2. **Docker Services Status**
- ✅ Docker daemon availability
- ✅ Docker Compose installation
- ✅ Individual container status:
  - `agentcare-ollama` - LLM inference engine
  - `agentcare-postgres` - Database with pgvector
  - `agentcare-redis` - Cache and sessions
  - `agentcare-backend` - API server
  - `agentcare-frontend` - React application

### 3. **PostgreSQL Database**
- ✅ Server accessibility
- ✅ Authentication and connection
- ✅ **pgvector extension** (required for RAG/vector similarity search)
- ✅ Critical table existence:
  - `organizations` - Multi-tenant organizations
  - `users` - Healthcare users
  - `appointments` - Scheduling data
  - `conversation_messages` - RAG conversation storage
- ✅ Database performance metrics

### 4. **Redis Cache**
- ✅ Server accessibility
- ✅ Version information
- ✅ Memory usage monitoring
- ✅ Read/write operations testing

### 5. **Ollama LLM Service**
- ✅ API accessibility (`http://localhost:11434`)
- ✅ Model availability and count
- ✅ Required model presence (`qwen2.5:latest`, `deepseek-r1:1.5b`)
- ✅ **Inference testing** - Real LLM response generation
- ✅ Performance metrics

### 6. **Backend API**
- ✅ Health endpoint accessibility
- ✅ Service availability reporting
- ✅ **Multi-agent system status**:
  - Supervisor Agent
  - Availability Agent  
  - Booking Agent
  - FAQ Agent
- ✅ Ollama integration endpoint
- ✅ **Agent processing testing** - Real AI responses

### 7. **Frontend Application**
- ✅ React application accessibility
- ✅ HTML content serving
- ✅ Application identification
- ✅ Health endpoint (if configured)

### 8. **Network Connectivity**
- ✅ Internal Docker network communication
- ✅ Backend ↔ Ollama connectivity
- ✅ Backend ↔ PostgreSQL connectivity  
- ✅ Backend ↔ Redis connectivity

### 9. **Performance & Resources**
- ✅ System memory availability
- ✅ Disk space usage
- ✅ Docker container resource usage
- ✅ **Response time analysis**:
  - Backend API response times
  - Ollama inference times

### 10. **Security Configuration**
- ✅ JWT secret validation
- ✅ **HIPAA compliance settings**
- ✅ Production mode validation
- ✅ Development feature flags

## 🎯 Example Output

```bash
🩺 AgentCare System Inspector 🔍
Multi-Agent Healthcare System Diagnostics

📊 Test Results:
  ✅ Passed: 29
  ❌ Failed: 6  
  ⚠️  Warnings: 2
  📝 Total Tests: 37

🏥 System Health Score: 78% - Good

🚨 Critical Issues:
  • pgvector extension not found: Required for RAG/vector similarity search
  • Backend cannot reach Ollama service: Check Docker network configuration

💡 Suggestions:
  • Install pgvector: CREATE EXTENSION vector;
  • Restart Ollama: docker-compose restart ollama
  • Pull model: docker-compose exec ollama ollama pull qwen2.5:latest
```

## 🔧 Common Issues & Solutions

### **Docker Issues**

```bash
# Docker daemon not running
❌ Docker daemon is not running
💡 Solution: Start Docker Desktop or systemctl start docker

# Containers not running  
❌ Backend API container not found
💡 Solution: docker-compose up -d
```

### **Database Issues**

```bash
# pgvector extension missing
❌ pgvector extension not found
💡 Solution: 
   docker-compose exec postgres psql -U agentcare agentcare_dev
   CREATE EXTENSION vector;

# Connection failures
❌ Database connection failed
💡 Solution: Check credentials in .env file
   POSTGRES_USER=agentcare
   POSTGRES_PASSWORD=your_password
   POSTGRES_DB=agentcare_dev
```

### **Ollama Issues**

```bash
# Models not loaded
❌ No models loaded in Ollama
💡 Solution: docker-compose exec ollama ollama pull qwen2.5:latest

# Inference failures
❌ Ollama inference failed  
💡 Solution: Check model availability and container resources
```

### **Agent System Issues**

```bash
# Agent processing failures
❌ Agent processing endpoint failed
💡 Solution: Check agent configuration and Ollama connection

# Short responses (fallback mode)
⚠️  Agent responses seem too short
💡 Solution: Verify Ollama integration is working properly
```

### **Network Issues**

```bash
# Internal connectivity problems
❌ Backend cannot reach Ollama service
💡 Solution: Check Docker network configuration
   docker network ls
   docker-compose restart
```

## 📊 Health Score Interpretation

| Score | Status | Description |
|-------|--------|-------------|
| **90-100%** | 🟢 Excellent | System fully operational |
| **75-89%** | 🟡 Good | Minor issues, system functional |
| **50-74%** | 🟠 Fair | Some problems, reduced functionality |
| **0-49%** | 🔴 Poor | Major issues, system may not work |

## 🔍 Advanced Usage

### **Running Specific Checks**

While the inspector doesn't support individual checks yet, you can focus on specific output sections:

```bash
# Focus on errors only
./agentcare-inspector.sh --quiet

# Full detailed output
./agentcare-inspector.sh --verbose

# Save results to file
./agentcare-inspector.sh > health-check-$(date +%Y%m%d-%H%M%S).log
```

### **Automation Integration**

```bash
# CI/CD Pipeline Usage
#!/bin/bash
./agentcare-inspector.sh
HEALTH_SCORE=$(./agentcare-inspector.sh | grep "System Health Score" | grep -o '[0-9]\+')

if [ "$HEALTH_SCORE" -lt 75 ]; then
    echo "Health check failed: $HEALTH_SCORE%"
    exit 1
fi
```

### **Monitoring Integration**

```bash
# Cron job for regular health checks
# Add to crontab: 0 */6 * * * /path/to/agentcare-inspector.sh >> /var/log/agentcare-health.log
```

## 🛠️ Troubleshooting Quick Reference

### **Immediate Actions**

```bash
# 1. Restart all services
docker-compose restart

# 2. Clean restart (if issues persist)
./docker-quick-start.sh --clean

# 3. Check logs
docker-compose logs -f backend
docker-compose logs -f ollama

# 4. Status verification
./docker-quick-start.sh --status
```

### **Service-Specific Fixes**

```bash
# Ollama issues
docker-compose restart ollama
docker-compose exec ollama ollama pull qwen2.5:latest

# Database issues  
docker-compose restart postgres
docker-compose exec postgres psql -U agentcare agentcare_dev

# Redis issues
docker-compose restart redis
redis-cli ping

# Backend issues
docker-compose restart backend
curl http://localhost:3000/health

# Frontend issues
docker-compose restart frontend
curl http://localhost:3001
```

## 🔒 Security Considerations

The inspector checks several security aspects:

### **HIPAA Compliance**
- ✅ Audit logging enabled (`HIPAA_LOGGING=true`)
- ✅ Secure JWT configuration
- ✅ Environment mode validation

### **Production Readiness**
- ✅ Default password detection
- ✅ Debug mode warnings
- ✅ SSL/TLS configuration (when applicable)

## 📈 Performance Optimization

Based on inspector results, consider these optimizations:

### **Resource Management**
```bash
# If memory warnings appear
# Increase Docker memory limits in docker-compose.yml

# If disk warnings appear  
docker system prune -a
docker volume prune
```

### **Response Time Optimization**
```bash
# If backend is slow
# Check database connection pooling
# Review query performance

# If Ollama is slow
# Consider using smaller models
# Add GPU acceleration if available
```

## 🤝 Contributing

To extend the inspector with additional checks:

1. Add new check functions following the pattern:
```bash
check_new_feature() {
    print_section "New Feature Check"
    
    if check_condition; then
        test_status 0 "Feature is working"
    else
        test_status 1 "Feature failed" "Suggested fix"
        add_suggestion "How to fix this issue"
    fi
}
```

2. Add the check to the main() function
3. Update this documentation

## 📞 Support

For issues with the inspector itself:
1. Check the script permissions: `ls -la agentcare-inspector.sh`
2. Verify dependencies: `which jq bc curl`
3. Run with debug: `bash -x agentcare-inspector.sh`

For AgentCare system issues, the inspector provides specific suggestions and commands to resolve most common problems.

---

**The AgentCare Inspector helps ensure your multi-agent healthcare system runs smoothly with comprehensive diagnostics and actionable insights.** 🏥🤖 