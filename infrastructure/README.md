# AgentCare Infrastructure 🏗️

**Centralized infrastructure, deployment, and DevOps configurations for AgentCare**

This directory contains all infrastructure-related configurations, deployment manifests, and DevOps tooling for the AgentCare platform.

## 📁 Directory Structure

```
infrastructure/
├── README.md                    # This file
├── docker/                      # Docker configurations
│   ├── Dockerfile              # Multi-stage production build
│   ├── .dockerignore           # Docker ignore patterns
│   └── docker-compose.yml      # Development environment
├── kubernetes/                  # Kubernetes manifests
│   ├── namespace.yaml          # Namespace, quotas, policies
│   ├── deployment.yaml         # Application deployment
│   ├── service.yaml            # Service definitions
│   └── ingress.yaml            # Traffic routing
├── helm/                        # Helm charts
│   └── agentcare/              # Main Helm chart
│       ├── Chart.yaml          # Chart metadata
│       ├── values.yaml         # Default values
│       ├── values-staging.yaml # Staging overrides
│       ├── values-production.yaml # Production overrides
│       └── templates/          # Kubernetes templates
├── observability/               # Monitoring and observability
│   ├── prometheus/             # Metrics collection
│   │   ├── prometheus.yml      # Prometheus configuration
│   │   └── rules/              # Alert rules
│   ├── grafana/                # Dashboards and visualization
│   │   └── dashboards/         # Pre-built dashboards
│   ├── loki/                   # Log aggregation
│   │   └── config.yml          # Loki configuration
│   └── jaeger/                 # Distributed tracing
│       └── config.yml          # Jaeger configuration
└── ci-cd/                      # CI/CD pipelines
    ├── ci-cd.yml               # GitHub Actions workflow
    ├── security-scan.yml       # Security scanning pipeline
    └── deploy.yml              # Deployment pipeline
```

## 🐳 Docker

### Quick Commands
```bash
# Build production image
docker build -f infrastructure/docker/Dockerfile -t agentcare:latest .

# Start development environment
docker-compose -f infrastructure/docker/docker-compose.yml up -d

# Stop development environment
docker-compose -f infrastructure/docker/docker-compose.yml down
```

### Files
- **[Dockerfile](docker/Dockerfile)** - Multi-stage production build with security best practices
- **[.dockerignore](docker/.dockerignore)** - Optimized ignore patterns for smaller build context
- **[docker-compose.yml](docker/docker-compose.yml)** - Complete development environment with all services

## ☸️ Kubernetes

### Quick Commands
```bash
# Apply all Kubernetes manifests
kubectl apply -f infrastructure/kubernetes/

# Deploy to specific namespace
kubectl apply -f infrastructure/kubernetes/ -n agentcare

# View deployment status
kubectl get pods -n agentcare

# View logs
kubectl logs -f deployment/agentcare -n agentcare
```

### Files
- **[namespace.yaml](kubernetes/namespace.yaml)** - Namespace with resource quotas and network policies
- **[deployment.yaml](kubernetes/deployment.yaml)** - Application deployment with health checks
- **[service.yaml](kubernetes/service.yaml)** - Service definitions for internal communication
- **[ingress.yaml](kubernetes/ingress.yaml)** - External traffic routing and TLS termination

## 📦 Helm Charts

### Quick Commands
```bash
# Install AgentCare with Helm
helm install agentcare infrastructure/helm/agentcare \
  --namespace agentcare \
  --create-namespace

# Upgrade deployment
helm upgrade agentcare infrastructure/helm/agentcare \
  --values infrastructure/helm/agentcare/values-production.yaml

# Uninstall
helm uninstall agentcare -n agentcare
```

### Chart Components
- **[Chart.yaml](helm/agentcare/Chart.yaml)** - Chart metadata and dependencies
- **[values.yaml](helm/agentcare/values.yaml)** - Default configuration values
- **[values-staging.yaml](helm/agentcare/values-staging.yaml)** - Staging environment overrides
- **[values-production.yaml](helm/agentcare/values-production.yaml)** - Production environment overrides
- **[templates/](helm/agentcare/templates/)** - Kubernetes manifest templates

## 📊 Observability

### Monitoring Stack
- **Prometheus** - Metrics collection and alerting
- **Grafana** - Dashboards and visualization
- **Loki** - Log aggregation and analysis
- **Jaeger** - Distributed tracing

### Quick Commands
```bash
# Deploy observability stack
kubectl apply -f infrastructure/observability/

# Port forward to Grafana
kubectl port-forward svc/grafana 3000:3000 -n monitoring

# Port forward to Prometheus
kubectl port-forward svc/prometheus 9090:9090 -n monitoring

# View Jaeger UI
kubectl port-forward svc/jaeger-query 16686:16686 -n tracing
```

### Components
- **[prometheus/](observability/prometheus/)** - Metrics collection configuration
- **[grafana/](observability/grafana/)** - Dashboard and visualization setup
- **[loki/](observability/loki/)** - Log aggregation configuration
- **[jaeger/](observability/jaeger/)** - Distributed tracing setup

## 🔄 CI/CD

### Pipeline Overview
The CI/CD pipeline includes:
1. **Validation** - Code linting, formatting, security scanning
2. **Testing** - Unit, integration, contract, and E2E tests
3. **Building** - Multi-architecture Docker images
4. **Security** - SAST, dependency scanning, container scanning
5. **Deployment** - Automated staging and production deployment

### Files
- **[ci-cd.yml](ci-cd/ci-cd.yml)** - Main CI/CD pipeline
- **[security-scan.yml](ci-cd/security-scan.yml)** - Security scanning workflow
- **[deploy.yml](ci-cd/deploy.yml)** - Deployment automation

### GitHub Actions Setup
The workflow file is symlinked to `.github/workflows/ci-cd.yml` for GitHub Actions compatibility.

## 🚀 Deployment Environments

### Development
```bash
# Start local development with Docker
docker-compose -f infrastructure/docker/docker-compose.yml up -d

# Or with npm script
npm run dev:docker
```

### Staging
```bash
# Deploy to staging with Helm
helm upgrade --install agentcare-staging infrastructure/helm/agentcare \
  --namespace agentcare-staging \
  --create-namespace \
  --values infrastructure/helm/agentcare/values-staging.yaml
```

### Production
```bash
# Deploy to production with Helm
helm upgrade --install agentcare infrastructure/helm/agentcare \
  --namespace agentcare \
  --create-namespace \
  --values infrastructure/helm/agentcare/values-production.yaml
```

## 🔒 Security & Compliance

### Security Features
- **HIPAA Compliance** - Healthcare data protection
- **Network Policies** - Secure inter-service communication
- **Pod Security Standards** - Container security best practices
- **TLS Everywhere** - Encrypted communication
- **RBAC** - Role-based access control

### Security Scanning
- **SAST** - Static application security testing
- **Dependency Scanning** - Vulnerability assessment of dependencies
- **Container Scanning** - Docker image security analysis
- **Infrastructure Scanning** - Kubernetes manifest validation

## 📈 Monitoring & Alerting

### Key Metrics
- **Application Metrics** - Response times, error rates, throughput
- **Business Metrics** - Appointment bookings, patient satisfaction
- **Infrastructure Metrics** - CPU, memory, disk, network
- **Security Metrics** - Authentication failures, access violations

### Alert Categories
- **Critical** - System outages, security breaches, HIPAA violations
- **Warning** - Performance degradation, resource limits
- **Info** - Deployment notifications, maintenance windows

## 🛠️ Infrastructure as Code

### Terraform (Future)
```bash
# Initialize Terraform
terraform init infrastructure/terraform/

# Plan deployment
terraform plan infrastructure/terraform/

# Apply infrastructure
terraform apply infrastructure/terraform/
```

### GitOps (Future)
- **ArgoCD** - Continuous deployment from Git
- **Flux** - Alternative GitOps solution
- **Helm Controller** - Helm-based GitOps

## 📚 Documentation Links

### Setup & Configuration
- **[Main Setup Guide](../SETUP_GUIDE.md)** - Complete installation guide
- **[DevOps Guide](../DEVOPS_GUIDE.md)** - Comprehensive infrastructure guide
- **[Contributing Guidelines](../.github/CONTRIBUTING.md)** - Development workflow

### Infrastructure Specific
- **[Docker Configuration](../IGNORE_FILES_SUMMARY.md)** - Docker ignore patterns
- **[Kubernetes Best Practices](https://kubernetes.io/docs/concepts/configuration/overview/)**
- **[Helm Documentation](https://helm.sh/docs/)**
- **[Prometheus Monitoring](https://prometheus.io/docs/)**

## 🆘 Troubleshooting

### Common Issues

#### Docker Build Fails
```bash
# Check Docker daemon
docker info

# Build with verbose output
docker build --progress=plain -f infrastructure/docker/Dockerfile .
```

#### Kubernetes Deployment Issues
```bash
# Check pod status
kubectl get pods -n agentcare

# View pod logs
kubectl logs -f pod/agentcare-xxx -n agentcare

# Describe pod for events
kubectl describe pod agentcare-xxx -n agentcare
```

#### Helm Installation Problems
```bash
# Dry run to validate
helm install agentcare infrastructure/helm/agentcare --dry-run

# Check Helm release status
helm status agentcare -n agentcare

# View Helm values
helm get values agentcare -n agentcare
```

### Support Channels
- **GitHub Issues** - Infrastructure-related bugs and questions
- **DevOps Guide** - Comprehensive troubleshooting section
- **Community Discord** - Real-time support and discussion

---

## 🚀 Quick Start

### 1. Local Development
```bash
# Start with Docker Compose
docker-compose -f infrastructure/docker/docker-compose.yml up -d
```

### 2. Kubernetes Deployment
```bash
# Deploy with Helm
helm install agentcare infrastructure/helm/agentcare
```

### 3. Monitoring Setup
```bash
# Deploy observability stack
kubectl apply -f infrastructure/observability/
```

**Ready to deploy AgentCare?** Choose your deployment method and follow the guides above! 🏥✨ 