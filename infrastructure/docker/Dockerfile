# AgentCare Dockerfile
# Multi-stage build for optimized production image

# Stage 1: Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++ curl

# Copy package files
COPY package*.json ./
COPY backend/tsconfig.json ./backend/

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY backend/src ./backend/src
COPY frontend/public ./frontend/public

# Build the application
RUN npm run build:backend

# Stage 2: Production stage
FROM node:18-alpine AS runtime

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S agentcare -u 1001

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built application from builder stage
COPY --from=builder --chown=agentcare:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=agentcare:nodejs /app/backend/dist ./backend/dist
COPY --from=builder --chown=agentcare:nodejs /app/frontend/public ./frontend/public
COPY --from=builder --chown=agentcare:nodejs /app/package*.json ./

# Create logs directory
RUN mkdir -p logs && chown agentcare:nodejs logs

# Switch to non-root user
USER agentcare

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Environment variables
ENV NODE_ENV=production
ENV API_PORT=3000
ENV LOG_LEVEL=info

# Labels for better Docker management
LABEL org.opencontainers.image.title="AgentCare" \
      org.opencontainers.image.description="Enhanced Multi-Agent Healthcare Scheduling System with Ollama LLM + RAG" \
      org.opencontainers.image.version="2.0.0-alpha" \
      org.opencontainers.image.authors="Vishal Mishra <vishal@agentcare.dev>" \
      org.opencontainers.image.url="https://github.com/vishalm/agentcare" \
      org.opencontainers.image.source="https://github.com/vishalm/agentcare" \
      org.opencontainers.image.vendor="AgentCare" \
      org.opencontainers.image.licenses="MIT"

# Start the application
CMD ["npm", "start"] 