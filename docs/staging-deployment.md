# AgentCare Staging Deployment Guide

## Overview

This document describes the staging environment setup and deployment process for the AgentCare multi-agent healthcare scheduling system.

## Staging Environment Architecture

The staging environment mirrors the production setup with the following components:

- **Frontend**: React/TypeScript application served via Nginx
- **Backend**: Node.js/Express API server with multi-agent architecture
- **Database**: PostgreSQL 15 with staging-specific data
- **Cache**: Redis 7 for session management and caching
- **Reverse Proxy**: Nginx for load balancing and SSL termination

## Environment URLs

- **Frontend**: https://staging-frontend.agentcare.dev
- **Backend API**: https://staging-api.agentcare.dev
- **Health Check**: https://staging.agentcare.dev/health
- **Environment Info**: https://staging.agentcare.dev/staging-info

## Deployment Methods

### 1. Automated CI/CD Deployment

The staging environment is automatically deployed when:
- Code is pushed to `main` or `develop` branches
- All tests pass successfully
- Docker builds complete successfully

**Trigger Conditions:**
```yaml
# Automatic deployment on:
- Push to main/develop branches
- Successful unit tests
- Successful integration tests
- Successful Docker builds
```

### 2. Manual Deployment Script

Use the staging deployment script for manual deployments:

```bash
# Deploy both frontend and backend
./scripts/deploy-staging.sh all staging

# Deploy only frontend
./scripts/deploy-staging.sh frontend staging

# Deploy only backend
./scripts/deploy-staging.sh backend staging
```

### 3. Docker Compose Deployment

For local staging environment testing:

```bash
# Start staging environment
docker-compose -f docker-compose.staging.yml up -d

# View logs
docker-compose -f docker-compose.staging.yml logs -f

# Stop staging environment
docker-compose -f docker-compose.staging.yml down
```

## Environment Configuration

### Frontend Configuration

```bash
NODE_ENV=staging
VITE_API_URL=https://staging-api.agentcare.dev
VITE_APP_ENV=staging
VITE_APP_NAME="AgentCare Staging"
VITE_APP_VERSION=staging-latest
```

### Backend Configuration

```bash
NODE_ENV=staging
PORT=3001
DATABASE_URL=postgresql://staging:staging@postgres-staging:5432/agentcare_staging
REDIS_URL=redis://redis-staging:6379
JWT_SECRET=staging-jwt-secret-change-in-production
CORS_ORIGIN=http://localhost:3000,https://staging-frontend.agentcare.dev
LOG_LEVEL=debug
API_VERSION=v1
```

## Database Setup

### Schema Migration

The staging database is automatically set up with:

1. **Schema Creation**: Applied from `database/schema.sql`
2. **Migrations**: Run from `database/migrations/`
3. **Seed Data**: Demo data for testing

```bash
# Manual database setup
cd backend
npm run db:migrate
npm run db:seed
```

### Database Access

```bash
# Connect to staging database
psql postgresql://staging:staging@localhost:5433/agentcare_staging

# View tables
\dt

# Check data
SELECT * FROM users LIMIT 5;
```

## Testing in Staging

### Automated Tests

The CI/CD pipeline runs the following tests in staging:

1. **Unit Tests**: Component and service tests
2. **Integration Tests**: API endpoint tests
3. **Health Checks**: Service availability tests
4. **Smoke Tests**: Basic functionality verification
5. **E2E Tests**: Full user journey tests

### Manual Testing

Access the staging environment for manual testing:

1. **Frontend**: https://staging-frontend.agentcare.dev
2. **API Documentation**: https://staging-api.agentcare.dev/api/docs
3. **Health Status**: https://staging.agentcare.dev/health

### Test Data

The staging environment includes:

- **Demo Users**: Pre-configured user accounts
- **Sample Appointments**: Test appointment data
- **Mock Agents**: AI agents for testing
- **Test Scenarios**: Common use case data

## Monitoring and Logging

### Application Logs

```bash
# View frontend logs
docker logs agentcare-frontend-staging

# View backend logs
docker logs agentcare-backend-staging

# View database logs
docker logs agentcare-postgres-staging
```

### Nginx Logs

```bash
# Access logs
tail -f /var/log/nginx/staging_access.log

# Error logs
tail -f /var/log/nginx/staging_error.log

# API-specific logs
tail -f /var/log/nginx/staging_api_access.log
```

### Health Monitoring

The staging environment provides health endpoints:

```bash
# Overall health
curl https://staging.agentcare.dev/health

# Backend health
curl https://staging-api.agentcare.dev/api/v1/health

# Database health
curl https://staging-api.agentcare.dev/api/v1/health/db

# Redis health
curl https://staging-api.agentcare.dev/api/v1/health/redis
```

## Security Considerations

### Staging-Specific Security

- **Authentication**: Simplified JWT for testing
- **CORS**: Permissive for development
- **Rate Limiting**: Relaxed limits for testing
- **SSL**: Self-signed certificates acceptable

### Data Protection

- **No Production Data**: Only synthetic test data
- **Data Isolation**: Separate from production
- **Regular Cleanup**: Automated data refresh

## Troubleshooting

### Common Issues

#### 1. Database Connection Issues

```bash
# Check database status
docker ps | grep postgres-staging

# Restart database
docker-compose -f docker-compose.staging.yml restart postgres-staging

# Check logs
docker logs agentcare-postgres-staging
```

#### 2. Frontend Build Issues

```bash
# Check build logs
docker logs agentcare-frontend-staging

# Rebuild frontend
cd frontend
npm run build

# Check environment variables
docker exec agentcare-frontend-staging env | grep VITE
```

#### 3. Backend API Issues

```bash
# Check backend status
curl https://staging-api.agentcare.dev/api/v1/health

# View backend logs
docker logs agentcare-backend-staging

# Restart backend
docker-compose -f docker-compose.staging.yml restart backend-staging
```

#### 4. Nginx Configuration Issues

```bash
# Test nginx configuration
docker exec agentcare-nginx-staging nginx -t

# Reload nginx
docker exec agentcare-nginx-staging nginx -s reload

# Check nginx logs
docker logs agentcare-nginx-staging
```

### Performance Issues

#### 1. Slow Response Times

```bash
# Check resource usage
docker stats

# Monitor database queries
docker exec agentcare-postgres-staging psql -U staging -d agentcare_staging -c "SELECT * FROM pg_stat_activity;"

# Check Redis performance
docker exec agentcare-redis-staging redis-cli info stats
```

#### 2. Memory Issues

```bash
# Check memory usage
docker exec agentcare-backend-staging cat /proc/meminfo

# Monitor Node.js heap
docker exec agentcare-backend-staging node -e "console.log(process.memoryUsage())"
```

## Deployment Rollback

### Automatic Rollback

If staging deployment fails, the CI/CD pipeline will:

1. Stop the failed deployment
2. Restore previous working version
3. Send notification to team
4. Generate failure report

### Manual Rollback

```bash
# Rollback to previous version
docker-compose -f docker-compose.staging.yml down
git checkout <previous-commit>
./scripts/deploy-staging.sh all staging

# Rollback database if needed
cd backend
npm run db:rollback
```

## Environment Refresh

### Weekly Refresh

The staging environment is automatically refreshed weekly:

1. **Database Reset**: Fresh schema and seed data
2. **Cache Clear**: Redis data cleared
3. **Log Rotation**: Old logs archived
4. **Image Update**: Latest base images pulled

### Manual Refresh

```bash
# Full environment refresh
docker-compose -f docker-compose.staging.yml down -v
docker-compose -f docker-compose.staging.yml up -d

# Database-only refresh
cd backend
npm run db:reset
npm run db:seed
```

## Best Practices

### Development Workflow

1. **Feature Branches**: Test in staging before merging
2. **Code Reviews**: Required before staging deployment
3. **Testing**: Comprehensive testing in staging
4. **Documentation**: Update docs with changes

### Staging Hygiene

1. **Regular Updates**: Keep staging current with main
2. **Data Cleanup**: Regular test data refresh
3. **Monitoring**: Watch for performance issues
4. **Security**: Regular security scans

### Deployment Safety

1. **Health Checks**: Verify all services before deployment
2. **Gradual Rollout**: Deploy backend first, then frontend
3. **Monitoring**: Watch metrics during deployment
4. **Rollback Plan**: Always have rollback strategy ready

## Support and Contacts

### Team Contacts

- **DevOps Team**: devops@agentcare.dev
- **Backend Team**: backend@agentcare.dev
- **Frontend Team**: frontend@agentcare.dev
- **QA Team**: qa@agentcare.dev

### Emergency Procedures

For critical staging issues:

1. **Immediate**: Contact DevOps team
2. **Escalation**: Notify team lead
3. **Communication**: Update team in Slack
4. **Documentation**: Log incident details

### Resources

- **CI/CD Dashboard**: GitHub Actions
- **Monitoring**: Application logs and metrics
- **Documentation**: This guide and API docs
- **Support**: Team Slack channels 