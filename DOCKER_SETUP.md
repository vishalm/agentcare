# AgentCare Docker Development Setup

This comprehensive Docker setup provides a complete development environment for AgentCare with all necessary infrastructure components including observability, monitoring, and storage services.

## 🏗️ Architecture Overview

The development environment consists of:

### Core Services
- **Frontend**: React/TypeScript with Vite dev server and HMR
- **Backend**: Node.js/Express API with live reload
- **PostgreSQL**: Database with pgvector extension for vector operations
- **Redis**: Cache and session storage
- **Ollama**: LLM service for AI capabilities

### Observability Stack
- **Prometheus**: Metrics collection and monitoring
- **Grafana**: Metrics visualization and dashboards
- **Jaeger**: Distributed tracing
- **Elasticsearch**: Log storage and search
- **Logstash**: Log processing and enrichment
- **Kibana**: Log visualization and analysis

### Development Tools
- **pgAdmin**: PostgreSQL management interface
- **Redis Commander**: Redis management interface
- **Mailhog**: Email testing service
- **MinIO**: S3-compatible object storage

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- At least 8GB of RAM available for Docker
- 20GB of free disk space

### Start Development Environment

```bash
# Make the script executable
chmod +x docker-dev.sh

# Start core development services
./docker-dev.sh dev

# Or start all services including observability
./docker-dev.sh start
```

## 📋 Available Commands

### Core Commands
```bash
./docker-dev.sh dev                    # Start core development environment
./docker-dev.sh start                  # Start all services
./docker-dev.sh stop                   # Stop all services
./docker-dev.sh restart                # Restart all services
./docker-dev.sh build                  # Rebuild all services
./docker-dev.sh clean                  # Clean up everything
./docker-dev.sh reset                  # Reset and rebuild
```

### Service Management
```bash
./docker-dev.sh start-backend          # Backend services only
./docker-dev.sh start-frontend         # Frontend service only
./docker-dev.sh start-observability    # Observability stack
./docker-dev.sh start-tools            # Development tools
./docker-dev.sh start-monitoring       # Monitoring exporters
./docker-dev.sh start-storage          # Storage services
```

### Utilities
```bash
./docker-dev.sh logs [service]         # Show logs
./docker-dev.sh shell [service]        # Open shell in container
./docker-dev.sh status                 # Show service status
./docker-dev.sh health                 # Health check all services
./docker-dev.sh env                    # Show environment info
```

## 🌐 Service URLs

### Core Services
- **Frontend (Dev)**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api/v1
- **Ollama LLM**: http://localhost:11434

### Database & Cache
- **PostgreSQL**: localhost:5432 (agentcare/agentcare_dev)
- **Redis**: localhost:6379

### Observability Stack
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3002 (admin/admin)
- **Jaeger (Tracing)**: http://localhost:16686
- **Kibana (Logs)**: http://localhost:5601
- **Elasticsearch**: http://localhost:9200

### Development Tools
- **pgAdmin**: http://localhost:5050 (admin@agentcare.local/admin)
- **Redis Commander**: http://localhost:8081 (admin/admin)
- **Mailhog**: http://localhost:8025

### Storage Services
- **MinIO Console**: http://localhost:9001 (agentcare/agentcare123)
- **MinIO API**: http://localhost:9000

## 🔧 Development Features

### Live Reloading
- **Backend**: Automatic restart on TypeScript changes using nodemon
- **Frontend**: Hot Module Replacement (HMR) with Vite
- **Configuration**: File watching for config changes

### Volume Mounting
- Source code mounted for live development
- Persistent node_modules volumes for faster rebuilds
- Separate build output volumes
- Log directories mounted for analysis

### Debugging
- **Node.js Debug Port**: localhost:9229
- **Backend Metrics**: http://localhost:9091
- **Vite HMR Port**: localhost:24678

## 📊 Monitoring & Observability

### Metrics Collection
Prometheus automatically scrapes metrics from:
- Backend API endpoints
- PostgreSQL database
- Redis cache
- System resources (CPU, memory, disk)
- Application-specific metrics

### Log Management
Logstash processes logs from:
- Application logs (structured JSON)
- System logs
- Error logs with stack traces
- Performance metrics
- AI/LLM operation logs

### Distributed Tracing
Jaeger provides:
- Request tracing across services
- Performance bottleneck identification
- Service dependency mapping

### Dashboards
Grafana includes pre-configured dashboards for:
- Application performance
- Database metrics
- Cache performance
- System resources
- Custom business metrics

## 🗄️ Database Features

### PostgreSQL with pgvector
- **Vector Operations**: Similarity search for RAG system
- **Extensions**: pgvector, pg_trgm, uuid-ossp, pgcrypto
- **Performance**: Optimized configuration for development
- **Monitoring**: Comprehensive metrics and query analysis

### Vector Functions
```sql
-- Create vector index
SELECT create_vector_index('documents', 'embedding', 1536);

-- Similarity search
SELECT * FROM vector_similarity_search(
    '[0.1, 0.2, ...]'::vector, 
    'documents', 
    'embedding', 
    10
);
```

## 💾 Storage Options

### MinIO S3-Compatible Storage
- **Use Case**: File uploads, document storage
- **API**: S3-compatible REST API
- **Management**: Web-based console
- **Integration**: Direct integration with backend services

## 🔍 Log Analysis

### Structured Logging
All services use structured JSON logging with:
- Request ID tracking
- User context
- Performance metrics
- Error details with stack traces

### Log Patterns
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "INFO",
  "service": "agentcare-backend",
  "requestId": "req-123",
  "userId": "user-456",
  "message": "API request processed",
  "responseTime": 150,
  "endpoint": "/api/v1/appointments"
}
```

### Kibana Dashboards
Pre-configured dashboards for:
- Error monitoring and alerting
- Performance analysis
- User activity tracking
- AI/LLM operation insights

## 🔒 Security Configuration

### Development Security
- Simplified authentication for development
- Disabled SSL/TLS (use reverse proxy in production)
- Open CORS policies
- Exposed management interfaces

### Production Considerations
- Enable security features in production
- Use proper secrets management
- Implement SSL/TLS
- Restrict network access

## 🚨 Troubleshooting

### Common Issues

#### Out of Memory
```bash
# Increase Docker memory allocation to 8GB+
# Check system resources
./docker-dev.sh health
```

#### Port Conflicts
```bash
# Check for conflicting services
lsof -i :3000  # Backend port
lsof -i :3001  # Frontend port
lsof -i :5432  # PostgreSQL port
```

#### Elasticsearch Issues
```bash
# Increase virtual memory
sudo sysctl -w vm.max_map_count=262144

# Make permanent
echo 'vm.max_map_count=262144' | sudo tee -a /etc/sysctl.conf
```

#### Volume Permission Issues
```bash
# Fix volume permissions
docker-compose -f docker-compose.dev.yml exec backend chown -R node:node /app
```

### Health Checks
```bash
# Check all services
./docker-dev.sh health

# Check specific service logs
./docker-dev.sh logs backend
./docker-dev.sh logs elasticsearch

# Check container status
docker ps
```

## 📚 Configuration Files

### Infrastructure Configurations
- `infrastructure/postgres/`: PostgreSQL configuration and extensions
- `infrastructure/redis/`: Redis configuration
- `infrastructure/prometheus/`: Metrics collection configuration
- `infrastructure/elasticsearch/`: Search and logging configuration
- `infrastructure/grafana/`: Dashboard and visualization setup

### Environment Variables
Key environment variables for development:
```bash
# Database
DATABASE_URL=postgresql://agentcare:agentcare_dev@postgres:5432/agentcare_dev
REDIS_URL=redis://:agentcare_redis_dev@redis:6379/0

# AI/LLM
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_MODEL=qwen2.5:latest
ENABLE_OLLAMA_LLM=true

# Observability
ELASTICSEARCH_URL=http://elasticsearch:9200
JAEGER_ENDPOINT=http://jaeger:14268/api/traces
ENABLE_TRACING=true

# Vector Database
PGVECTOR_ENABLED=true
VECTOR_DIMENSION=1536
```

## 🎯 Production Deployment

For production deployment:
1. Use `docker-compose.prod.yml` configuration
2. Enable security features
3. Configure proper secrets management
4. Set up SSL/TLS certificates
5. Implement proper backup strategies
6. Configure monitoring alerts

## 🤝 Contributing

When adding new services:
1. Add service to `docker-compose.dev.yml`
2. Create necessary configuration files
3. Update the management script
4. Add health checks
5. Update documentation

## 📖 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Prometheus Configuration](https://prometheus.io/docs/prometheus/latest/configuration/configuration/)
- [Elasticsearch Setup](https://www.elastic.co/guide/en/elasticsearch/reference/current/setup.html)
- [pgvector Documentation](https://github.com/pgvector/pgvector) 