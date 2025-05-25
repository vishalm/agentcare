---
layout: default
title: "Project Structure Guide"
permalink: /PROJECT_STRUCTURE/
---

{% include doc-header.html %}

# AgentCare Project Structure Guide

## Overview
This document outlines the complete organizational structure of the AgentCare multi-agent healthcare scheduling platform.

## 📁 Root Directory Structure

```
agentcare/
├── 📱 frontend/              # React + TypeScript + Vite frontend
├── 🔧 backend/               # Node.js + Express + TypeScript API
├── 🗄️ database/              # PostgreSQL schemas and migrations
├── 🏗️ infrastructure/        # Docker, Kubernetes, CI/CD configurations
├── 📚 docs/                  # Complete project documentation
├── 🧪 tests/                 # Integration and E2E tests
├── 📜 scripts/               # Automation and utility scripts
├── 🔒 ssl/                   # SSL certificates and security configs
├── 📊 coverage/              # Test coverage reports
├── 📝 logs/                  # Application logs
└── ⚙️ Configuration Files    # Package.json, Docker, CI/CD configs
```

## 🎯 Frontend Structure (`frontend/`)

```
frontend/
├── src/
│   ├── components/           # React components
│   │   ├── UI/              # Reusable UI components
│   │   ├── Layout/          # Layout components
│   │   └── Features/        # Feature-specific components
│   ├── pages/               # Page components
│   ├── hooks/               # Custom React hooks
│   ├── store/               # State management (Zustand)
│   ├── theme/               # Material-UI themes
│   ├── utils/               # Utility functions
│   └── types/               # TypeScript type definitions
├── public/                  # Static assets
│   ├── assets/              # Images, icons, etc.
│   ├── 404.html             # GitHub Pages SPA routing
│   └── CNAME                # Custom domain config
├── tests/                   # Frontend unit tests
├── dist/                    # Build output
├── Dockerfile               # Standalone frontend container
├── nginx.conf               # Nginx configuration
└── package.json             # Frontend dependencies
```

## 🔧 Backend Structure (`backend/`)

```
backend/
├── src/
│   ├── agents/              # AI agents (Supervisor, Booking, FAQ, etc.)
│   ├── controllers/         # Express route controllers
│   ├── middleware/          # Express middleware
│   ├── models/              # Data models and schemas
│   ├── routes/              # API route definitions
│   ├── services/            # Business logic services
│   ├── tools/               # Agent tools and utilities
│   ├── patterns/            # Enterprise patterns (Circuit Breaker, etc.)
│   ├── process/             # Process management (12-Factor)
│   ├── config/              # Configuration management
│   ├── logging/             # Logging utilities
│   ├── utils/               # Utility functions
│   └── types/               # TypeScript type definitions
├── tests/                   # Backend unit tests
├── dist/                    # Compiled TypeScript output
├── logs/                    # Backend-specific logs
├── Dockerfile               # Standalone backend container
└── package.json             # Backend dependencies
```

## 🗄️ Database Structure (`database/`)

```
database/
├── schemas/                 # SQL schema definitions
├── migrations/              # Database migration scripts
├── seeds/                   # Sample data and demo data
├── backups/                 # Database backup scripts
└── README.md                # Database setup instructions
```

## 🏗️ Infrastructure Structure (`infrastructure/`)

```
infrastructure/
├── docker/                  # Docker configurations
│   ├── Dockerfile           # Multi-stage monorepo build
│   ├── Dockerfile.backend   # Backend-specific container
│   ├── Dockerfile.frontend  # Frontend-specific container
│   ├── docker-compose.yml   # Development stack
│   ├── docker-compose.prod.yml # Production stack
│   └── nginx.conf           # Nginx configuration
├── kubernetes/              # K8s deployment manifests
├── helm/                    # Helm charts
├── ci-cd/                   # CI/CD pipeline configurations
├── 12factor/                # 12-Factor app compliance
├── observability/           # Monitoring and logging
├── process-management/      # PM2 and process configs
└── README.md                # Infrastructure guide
```

## 📚 Documentation Structure (`docs/`)

```
docs/
├── architecture/            # Architecture guides and diagrams
│   ├── ARCHITECTURE_GUIDE.md
│   ├── MULTI_TENANCY_GUIDE.md
│   ├── TWELVE_FACTOR_GUIDE.md
│   └── diagrams/            # Architecture diagrams
├── setup/                   # Setup and installation guides
│   ├── DOCKER_SETUP.md
│   ├── DOCKER_MIGRATION_SUMMARY.md
│   └── QUICK_START.md
├── guides/                  # User and developer guides
├── api/                     # API documentation
├── testing/                 # Testing documentation
├── operations/              # Operations and deployment
├── assets/                  # Documentation images and files
├── _config.yml              # GitHub Pages configuration
└── index.md                 # Documentation homepage
```

## 🧪 Testing Structure (`tests/`)

```
tests/
├── unit/                    # Unit tests
├── integration/             # Integration tests
├── contract/                # Contract tests
├── e2e/                     # End-to-end tests
├── performance/             # Performance tests
├── fixtures/                # Test data and fixtures
└── utils/                   # Testing utilities
```

## ⚙️ Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Root workspace configuration |
| `tsconfig.json` | Global TypeScript configuration |
| `jest.config.js` | Jest testing configuration |
| `playwright.config.ts` | Playwright E2E test configuration |
| `sonar-project.properties` | SonarCloud configuration |
| `.github/workflows/` | GitHub Actions CI/CD |
| `docker-compose.yml` | Development environment |
| `env.example` | Environment variable template |
| `.gitignore` | Git ignore patterns |
| `.eslintrc.js` | ESLint configuration |
| `.cursorrules` | Cursor AI IDE rules |

## 🔄 Build and Deployment Flow

<div class="mermaid">
graph TD
    A[Source Code] --> B[Build Process]
    B --> C[Testing Pipeline]
    C --> D[Docker Images]
    D --> E[Container Registry]
    E --> F[Deployment]
    
    B --> B1[Frontend Build]
    B --> B2[Backend Build]
    
    C --> C1[Unit Tests]
    C --> C2[Integration Tests]
    C --> C3[E2E Tests]
    
    F --> F1[Development]
    F --> F2[Staging]
    F --> F3[Production]
</div>

## 📱 Frontend Architecture

<div class="mermaid">
graph TB
    A[React App] --> B[Router]
    B --> C[Pages]
    C --> D[Components]
    D --> E[Hooks]
    E --> F[Store]
    F --> G[API Layer]
    G --> H[Backend API]
</div>

## 🔧 Backend Architecture

<div class="mermaid">
graph TB
    A[Express Server] --> B[Routes]
    B --> C[Controllers]
    C --> D[Services]
    D --> E[Agents]
    E --> F[Tools]
    F --> G[Database]
    D --> H[External APIs]
</div>

## 🚀 Key Features by Directory

### Frontend Features
- **React 18** with TypeScript
- **Material-UI** design system
- **Zustand** state management
- **React Query** for API calls
- **Vite** build system
- **GitHub Pages** deployment

### Backend Features
- **Multi-Agent AI** system
- **Express.js** REST API
- **JWT Authentication**
- **PostgreSQL** database
- **Redis** caching
- **Ollama LLM** integration
- **HIPAA compliance**

### Infrastructure Features
- **Docker** containerization
- **Kubernetes** orchestration
- **GitHub Actions** CI/CD
- **SonarCloud** code quality
- **Monitoring** and logging
- **12-Factor** app compliance

## 📋 Development Guidelines

### File Naming Conventions
- **Components**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase with 'use' prefix (`useAuth.ts`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_ENDPOINTS.ts`)
- **Types**: PascalCase (`UserInterface.ts`)

### Directory Organization Rules
1. Group related files together
2. Keep components close to where they're used
3. Separate concerns (UI, business logic, data)
4. Use index files for clean imports
5. Maintain flat hierarchy when possible

### Documentation Standards
- README.md in each major directory
- Inline code comments for complex logic
- JSDoc for public APIs
- Architecture diagrams for complex flows
- Change logs for major updates

## 🔄 Migration and Updates

When adding new features or refactoring:
1. Follow the established directory structure
2. Update relevant documentation
3. Add appropriate tests
4. Update CI/CD pipelines if needed
5. Consider impact on deployment

This structure supports scalability, maintainability, and clear separation of concerns while enabling efficient development workflows. 