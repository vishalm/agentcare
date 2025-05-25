# AgentCare Monorepo Multi-Service Dockerfile
# Enterprise Healthcare Scheduling Platform

# ============================================================================
# Base stage with Node.js and common dependencies
# ============================================================================
FROM node:18-alpine AS base
LABEL maintainer="AgentCare Team <dev@agentcare.com>"
LABEL description="AgentCare Healthcare Platform - Monorepo Build"
LABEL version="3.0.0"

# Install system dependencies
RUN apk add --no-cache \
    curl \
    dumb-init \
    postgresql-client \
    git \
    tini \
    && rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Copy root package.json for workspace management
COPY package*.json ./

# ============================================================================
# Backend build stage
# ============================================================================
FROM base AS backend-build
LABEL service="backend"

# Copy backend package.json
COPY backend/package*.json ./backend/

# Install backend dependencies
RUN npm ci --workspaces=false --only=production --no-audit --no-fund
RUN cd backend && npm ci --include=dev --no-audit --no-fund

# Copy backend source code and shared files
COPY backend/ ./backend/
COPY database/ ./database/
COPY scripts/ ./scripts/
COPY env.example ./

# Build backend
WORKDIR /app/backend
RUN npm run build

# ============================================================================
# Frontend build stage
# ============================================================================
FROM base AS frontend-build
LABEL service="frontend"

# Copy frontend package.json
COPY frontend/package*.json ./frontend/

# Install frontend dependencies
RUN npm ci --workspaces=false --only=production --no-audit --no-fund
RUN cd frontend && npm ci --include=dev --no-audit --no-fund

# Copy frontend source code
COPY frontend/ ./frontend/

# Build frontend
WORKDIR /app/frontend
RUN npm run build

# ============================================================================
# Backend production stage
# ============================================================================
FROM node:18-alpine AS backend-production
ENV NODE_ENV=production
ENV PORT=3000
LABEL service="backend"

# Install runtime dependencies
RUN apk add --no-cache \
    curl \
    dumb-init \
    postgresql-client \
    tini \
    && rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup -g 1001 -S agentcare && \
    adduser -S agentcare -u 1001 -G agentcare

WORKDIR /app

# Copy production dependencies and built application from backend-build stage
COPY --from=backend-build /app/backend/node_modules ./backend/node_modules
COPY --from=backend-build /app/node_modules ./node_modules
COPY --from=backend-build /app/backend/dist ./backend/dist
COPY --from=backend-build /app/backend/package*.json ./backend/
COPY --from=backend-build /app/database ./database
COPY --from=backend-build /app/scripts ./scripts
COPY --from=backend-build /app/package*.json ./

# Create required directories and set permissions
RUN mkdir -p /app/logs /app/tmp && \
    chown -R agentcare:agentcare /app && \
    chmod -R 755 /app

# Switch to non-root user
USER agentcare

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

# Expose application port
EXPOSE ${PORT}

# Use tini as init system for proper signal handling
ENTRYPOINT ["tini", "--"]

# Start the backend service
CMD ["node", "backend/dist/index.js"]

# ============================================================================
# Frontend production stage with Nginx
# ============================================================================
FROM nginx:alpine AS frontend-production
ENV NODE_ENV=production
LABEL service="frontend"

# Install runtime dependencies
RUN apk add --no-cache \
    curl \
    tini \
    && rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup -g 1001 -S agentcare && \
    adduser -S agentcare -u 1001 -G agentcare

# Copy built application from frontend-build stage
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY infrastructure/docker/nginx.conf /etc/nginx/nginx.conf

# Create required directories and set permissions
RUN mkdir -p /var/cache/nginx /var/log/nginx /var/run && \
    chown -R agentcare:agentcare /var/cache/nginx /var/log/nginx /var/run /usr/share/nginx/html && \
    chmod -R 755 /var/cache/nginx /var/log/nginx /var/run

# Create nginx.pid file with proper permissions
RUN touch /var/run/nginx.pid && \
    chown agentcare:agentcare /var/run/nginx.pid

# Switch to non-root user
USER agentcare

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

# Expose port
EXPOSE 80

# Use tini as init system
ENTRYPOINT ["tini", "--"]

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

# ============================================================================
# Development stage (for development builds)
# ============================================================================
FROM base AS development
ENV NODE_ENV=development
LABEL environment="development"

# Install all dependencies for both frontend and backend
RUN npm install --workspaces

# Copy all source code
COPY backend/ ./backend/
COPY frontend/ ./frontend/
COPY database/ ./database/
COPY scripts/ ./scripts/
COPY env.example ./

# Create required directories
RUN mkdir -p /app/logs && chmod 755 /app/logs

# Expose development ports
EXPOSE 3000 3001 9090

# Use dumb-init for development
ENTRYPOINT ["dumb-init", "--"]

# Default to running both frontend and backend in development
CMD ["npm", "run", "dev"]

# ============================================================================
# Multi-architecture build support
# ============================================================================
FROM backend-production AS backend-production-arm64
LABEL architecture="arm64"
# ARM64 specific optimizations can go here

FROM backend-production AS backend-production-amd64
LABEL architecture="amd64"
# AMD64 specific optimizations can go here

FROM frontend-production AS frontend-production-arm64
LABEL architecture="arm64"
# ARM64 specific optimizations can go here

FROM frontend-production AS frontend-production-amd64
LABEL architecture="amd64"
# AMD64 specific optimizations can go here 