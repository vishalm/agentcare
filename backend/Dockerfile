# AgentCare Backend Dockerfile
# Multi-Agent Healthcare Scheduling API

# Build stage
FROM node:18-alpine AS build
LABEL maintainer="AgentCare Team <dev@agentcare.com>"
LABEL description="AgentCare Backend API Service"
LABEL version="3.0.0"

# Install system dependencies
RUN apk add --no-cache \
    curl \
    dumb-init \
    postgresql-client \
    && rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Copy backend package.json
COPY backend/package*.json ./

# Install dependencies
RUN npm ci --include=dev --no-audit --no-fund

# Copy backend source code
COPY backend/ .

# Build the backend application
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
    tini \
    && rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup -g 1001 -S agentcare && \
    adduser -S agentcare -u 1001 -G agentcare

# Set working directory
WORKDIR /app

# Copy production dependencies from build stage
COPY --from=build /app/node_modules ./node_modules

# Copy built application
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./

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
CMD ["node", "dist/server.js"]

# Development stage (for development builds)
FROM node:18-alpine AS development
ENV NODE_ENV=development

RUN apk add --no-cache \
    curl \
    dumb-init \
    postgresql-client \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# Copy backend package.json
COPY backend/package*.json ./

# Install all dependencies (including dev)
RUN npm ci --include=dev

# Copy backend source code
COPY backend/ .

# Create directories
RUN mkdir -p /app/logs && chmod 755 /app/logs

# Expose development ports
EXPOSE 3000 9090

ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "dev"] 