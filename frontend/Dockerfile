# AgentCare Frontend Dockerfile
# React + TypeScript + Vite

# Base stage
FROM node:18-alpine AS base
LABEL maintainer="AgentCare Team <dev@agentcare.com>"
LABEL description="AgentCare Frontend - AI Healthcare Scheduling Interface"
LABEL version="2.0.0"

# Install system dependencies
RUN apk add --no-cache \
    curl \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Copy package files from frontend directory
COPY frontend/package*.json ./

# Development stage
FROM base AS development
ENV NODE_ENV=development

# Install all dependencies
RUN npm ci --include=dev

# Copy frontend source code
COPY frontend/ .

# Create user for security
RUN addgroup -g 1001 -S agentcare && \
    adduser -S agentcare -u 1001 -G agentcare && \
    chown -R agentcare:agentcare /app

USER agentcare

# Expose Vite dev server port
EXPOSE 3001

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Development command
CMD ["npm", "run", "dev"]

# Build stage
FROM base AS builder
ENV NODE_ENV=production

# Install all dependencies for building
RUN npm ci --include=dev

# Copy frontend source code
COPY frontend/ .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine AS production
ENV NODE_ENV=production

# Install curl for health checks
RUN apk add --no-cache curl tini

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Create default nginx configuration for SPA
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location /health { \
        access_log off; \
        return 200 "healthy\n"; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Create nginx user and set permissions
RUN addgroup -g 1001 -S agentcare && \
    adduser -S agentcare -u 1001 -G agentcare && \
    chown -R agentcare:agentcare /usr/share/nginx/html && \
    mkdir -p /var/cache/nginx /var/log/nginx /var/run && \
    chown -R agentcare:agentcare /var/cache/nginx /var/log/nginx /var/run && \
    touch /var/run/nginx.pid && \
    chown agentcare:agentcare /var/run/nginx.pid

# Switch to non-root user
USER agentcare

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:80 || exit 1

# Expose port
EXPOSE 80

# Use tini as init system
ENTRYPOINT ["tini", "--"]

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 