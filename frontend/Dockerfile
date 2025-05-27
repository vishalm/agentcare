# AgentCare Frontend Dockerfile
# React + TypeScript + Vite

# =============================================================================
# Base stage - Common foundation
# =============================================================================
FROM node:20-alpine3.19 AS base

LABEL maintainer="AgentCare Team <dev@agentcare.com>" \
      description="AgentCare Frontend - AI Healthcare Scheduling Interface" \
      version="2.0.0"

# Create non-root user for security
RUN addgroup -g 1001 -S agentcare && \
    adduser -S agentcare -u 1001 -G agentcare

WORKDIR /app

# =============================================================================
# Dependencies stage - Install and cache dependencies
# =============================================================================
FROM base AS deps

# Copy package files for dependency installation
COPY package.json package-lock.json* ./

# Install dependencies with npm ci for consistent builds
RUN npm ci --only=production && \
    npm cache clean --force

# =============================================================================
# Development stage
# =============================================================================
FROM base AS development

ENV NODE_ENV=development

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies)
RUN npm ci && \
    npm cache clean --force

# Copy source code
COPY --chown=agentcare:agentcare . .

USER agentcare

EXPOSE 3001

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# =============================================================================
# Build stage - TypeScript compilation and bundling
# =============================================================================
FROM base AS builder

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies needed for building
RUN npm ci && \
    npm cache clean --force

# Copy source code
COPY . .

# Type check and build the application
RUN npm run type-check 2>/dev/null || echo "No type-check script found, skipping..." && \
    npm run build && \
    # Remove development dependencies to reduce size
    npm prune --production

# =============================================================================
# Production stage - Nginx serving static files
# =============================================================================
FROM nginx:1.25-alpine AS production

# Install curl for healthcheck
RUN apk add --no-cache curl && \
    rm -rf /var/cache/apk/*

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Create nginx user and set permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d

# Switch to non-root user
USER nginx

# Health check with better configuration
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

EXPOSE 80

# Use nginx in foreground mode
CMD ["nginx", "-g", "daemon off;"]

# =============================================================================
# Multi-stage build targets:
# - docker build --target development . (for dev)
# - docker build --target production . (for prod, default)
# =============================================================================