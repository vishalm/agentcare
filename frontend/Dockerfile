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

# Copy package files
COPY package*.json ./

# Development stage
FROM base AS development
ENV NODE_ENV=development

# Install all dependencies
RUN npm ci --include=dev

# Copy source code
COPY . .

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

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine AS production
ENV NODE_ENV=production

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create nginx user and set permissions
RUN addgroup -g 1001 -S agentcare && \
    adduser -S agentcare -u 1001 -G agentcare && \
    chown -R agentcare:agentcare /usr/share/nginx/html && \
    chown -R agentcare:agentcare /var/cache/nginx && \
    chown -R agentcare:agentcare /var/log/nginx && \
    chown -R agentcare:agentcare /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R agentcare:agentcare /var/run/nginx.pid

# Switch to non-root user
USER agentcare

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:80 || exit 1

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 