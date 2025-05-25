# AgentCare Multi-Stage Dockerfile
# Multi-tenant Healthcare SaaS Platform

# Base stage with Node.js
FROM node:18-alpine AS base
LABEL maintainer="AgentCare Team <dev@agentcare.com>"
LABEL description="Multi-tenant Healthcare SaaS Platform"
LABEL version="3.0.0"

# Install system dependencies
RUN apk add --no-cache \
    curl \
    dumb-init \
    postgresql-client \
    && rm -rf /var/cache/apk/*

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Development stage
FROM base AS development
ENV NODE_ENV=development

# Install all dependencies (including devDependencies)
RUN npm ci --include=dev
RUN cd backend && npm ci --include=dev

# Copy source code
COPY . .

# Create logs directory
RUN mkdir -p /app/logs && chmod 755 /app/logs

# Expose development ports
EXPOSE 3000 9090

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Development command
CMD ["npm", "run", "dev"]

# Production dependencies stage
FROM base AS production-deps
ENV NODE_ENV=production

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force
RUN cd backend && npm ci --only=production && npm cache clean --force

# Build stage
FROM base AS build
ENV NODE_ENV=production

# Install all dependencies for building
RUN npm ci --include=dev
RUN cd backend && npm ci --include=dev

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production
ENV NODE_ENV=production
ENV PORT=3000

# Install runtime dependencies
RUN apk add --no-cache \
    curl \
    dumb-init \
    postgresql-client \
    && rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup -g 1001 -S agentcare && \
    adduser -S agentcare -u 1001 -G agentcare

# Create app directory
WORKDIR /app

# Copy production dependencies
COPY --from=production-deps /app/node_modules ./node_modules
COPY --from=production-deps /app/backend/node_modules ./backend/node_modules

# Copy built application
COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/package*.json ./
COPY --from=build /app/backend/package*.json ./backend/

# Copy necessary runtime files
COPY database ./database
COPY scripts ./scripts

# Create logs directory and set permissions
RUN mkdir -p /app/logs && \
    chown -R agentcare:agentcare /app && \
    chmod -R 755 /app

# Switch to non-root user
USER agentcare

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

# Expose application port
EXPOSE ${PORT}

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Production command
CMD ["npm", "start"]

# Multi-architecture build support
FROM production AS production-arm64
# ARM64 specific optimizations can go here

FROM production AS production-amd64
# AMD64 specific optimizations can go here 