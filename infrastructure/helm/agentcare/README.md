# AgentCare Helm Chart

This Helm chart deploys the AgentCare Multi-Agent Healthcare Scheduling System on a Kubernetes cluster.

## Prerequisites

- Kubernetes 1.24+
- Helm 3.0.0+
- PV provisioner support in the underlying infrastructure
- Ingress controller (if using ingress)

## Features

- Multi-agent architecture for healthcare scheduling
- Integrated LLM capabilities with Ollama
- HIPAA-compliant logging and auditing
- Comprehensive monitoring with Prometheus and Grafana
- Distributed tracing with Jaeger
- Log aggregation with Loki and Promtail
- Secure secrets management
- Automatic TLS with cert-manager
- Horizontal pod autoscaling

## Installing the Chart

1. Add the AgentCare Helm repository:
   ```bash
   helm repo add agentcare https://charts.agentcare.dev
   helm repo update
   ```

2. Install the chart:
   ```bash
   helm install agentcare agentcare/agentcare \
     --namespace agentcare \
     --create-namespace \
     --set ingress.hosts[0].host=your-domain.com
   ```

## Configuration

The following table lists the configurable parameters of the AgentCare chart and their default values.

### Global Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `global.imageRegistry` | Global Docker image registry | `""` |
| `global.imagePullSecrets` | Global Docker registry secret names | `[]` |
| `global.storageClass` | Global StorageClass for Persistent Volume(s) | `""` |
| `global.environment` | Global environment type | `production` |

### Application Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `replicaCount` | Number of AgentCare replicas | `3` |
| `image.repository` | AgentCare image repository | `agentcare/api` |
| `image.tag` | AgentCare image tag | `2.0.0-alpha` |
| `image.pullPolicy` | Image pull policy | `IfNotPresent` |
| `service.type` | Kubernetes Service type | `ClusterIP` |
| `service.port` | Service HTTP port | `3000` |
| `ingress.enabled` | Enable ingress controller resource | `true` |
| `resources` | CPU/Memory resource requests/limits | See values.yaml |

### Database Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `postgresql.enabled` | Deploy PostgreSQL | `true` |
| `postgresql.auth.database` | PostgreSQL database name | `agentcare` |
| `postgresql.auth.username` | PostgreSQL username | `agentcare_user` |
| `postgresql.auth.password` | PostgreSQL password | `""` (generated) |

### Cache Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `redis.enabled` | Deploy Redis | `true` |
| `redis.auth.enabled` | Enable Redis password authentication | `true` |
| `redis.auth.password` | Redis password | `""` (generated) |

### Monitoring Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `monitoring.prometheus.enabled` | Deploy Prometheus | `true` |
| `monitoring.grafana.enabled` | Deploy Grafana | `true` |
| `monitoring.grafana.adminPassword` | Grafana admin password | `admin123` |

### Security Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `security.podSecurityPolicy.enabled` | Enable Pod Security Policy | `true` |
| `security.networkPolicies.enabled` | Enable Network Policies | `true` |
| `security.rbac.create` | Create RBAC resources | `true` |

## Upgrading

To upgrade the chart:

```bash
helm upgrade agentcare agentcare/agentcare \
  --namespace agentcare \
  --reuse-values
```

## Uninstalling

To uninstall/delete the deployment:

```bash
helm uninstall agentcare -n agentcare
```

## Development

For development and testing:

1. Enable development mode:
   ```bash
   helm install agentcare . \
     --namespace agentcare \
     --create-namespace \
     --set development.enabled=true
   ```

2. Port forward services:
   ```bash
   kubectl port-forward svc/agentcare 3000:3000 -n agentcare
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License. See LICENSE file for details. 