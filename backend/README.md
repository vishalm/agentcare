# AgentCare Backend

## Multi-Agent Healthcare Scheduling API

This is the backend API for the AgentCare healthcare scheduling system, built using a multi-agent architecture with TypeScript, Express.js, and Ollama LLM integration.

## 🏗 Architecture

### Multi-Agent System
- **Supervisor Agent**: Orchestrates conversation flow
- **Availability Agent**: Manages provider schedules and availability
- **Booking Agent**: Handles appointment creation and management
- **FAQ Agent**: Provides healthcare information and answers

### Technology Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Cache**: Redis
- **LLM**: Ollama (Qwen2.5)
- **Documentation**: Swagger/OpenAPI

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 8+
- PostgreSQL 13+
- Redis 6+
- Ollama (for LLM functionality)

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment setup**:
   ```bash
   cp ../env.example .env
   # Edit .env with your configuration
   ```

3. **Database setup**:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Health Check
```bash
GET /health
```

### Agent Endpoints

#### Agent Status
```bash
GET /api/v1/agents/status
```

#### Chat with Agents
```bash
POST /api/v1/agents/chat
Content-Type: application/json

{
  "message": "I need to book an appointment",
  "context": {
    "userId": "user-123",
    "sessionId": "session-456"
  }
}
```

#### Provider Availability
```bash
GET /api/v1/providers/availability
POST /api/v1/providers/availability
```

#### Appointments
```bash
GET /api/v1/appointments
POST /api/v1/appointments
PUT /api/v1/appointments/:id
DELETE /api/v1/appointments/:id
```

### Authentication
```bash
POST /api/v1/auth/login
POST /api/v1/auth/register
POST /api/v1/auth/refresh
```

## 🔧 Development

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run test` - Run test suite
- `npm run lint` - Lint code
- `npm run type-check` - Type checking only

### Project Structure

```
src/
├── agents/           # AI agent implementations
│   ├── SupervisorAgent.ts
│   ├── AvailabilityAgent.ts
│   ├── BookingAgent.ts
│   └── FAQAgent.ts
├── controllers/      # Express route controllers
├── middleware/       # Express middleware
├── models/          # Data models and schemas
├── routes/          # API route definitions
├── services/        # Business logic services
├── tools/           # Agent tools and utilities
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── config/          # Configuration files
└── index.ts         # Application entry point
```

### Agent Development

Each agent follows the multi-agent pattern:

```typescript
export class AvailabilityAgent {
  async process(input: AgentInput): Promise<AgentOutput> {
    // Agent processing logic
    return {
      response: "Agent response",
      action: "CONTINUE", // or "TRANSFER", "COMPLETE"
      data: {},
      confidence: 0.95
    };
  }
}
```

### Adding New Agents

1. Create agent class in `src/agents/`
2. Implement required tools in `src/tools/`
3. Add agent registration in supervisor
4. Update API routes if needed
5. Add comprehensive tests

## 🧪 Testing

### Test Categories

- **Unit Tests**: Individual agent and service testing
- **Integration Tests**: API endpoint testing
- **Contract Tests**: Agent interaction testing

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## 📊 Monitoring

### Health Endpoints

- `/health` - Basic health check
- `/api/v1/agents/status` - Agent system status
- `/api/v1/metrics` - Performance metrics

### Logging

Structured JSON logging with Winston:

```typescript
import { logger } from './utils/Logger';

logger.info('Agent processing started', {
  agentType: 'booking',
  userId: 'user-123',
  action: 'process_appointment'
});
```

## 🔒 Security

### Authentication
- JWT-based authentication
- Refresh token support
- Role-based access control

### Data Protection
- HIPAA-compliant logging
- Data encryption at rest
- Secure API endpoints

### Rate Limiting
- API rate limiting
- Agent processing throttling
- Redis-based session management

## 🐳 Docker Support

### Development
```bash
docker-compose up -d postgres redis ollama
npm run dev
```

### Production
```bash
docker build -t agentcare-backend .
docker run -p 3000:3000 agentcare-backend
```

## 📝 Environment Variables

Key environment variables:

```bash
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=agentcare
DB_USER=agentcare_user
DB_PASSWORD=secure_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:latest

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRE=24h
```

## 🤝 Contributing

1. Follow TypeScript strict mode
2. Use functional programming patterns for agents
3. Implement comprehensive error handling
4. Write tests for all new features
5. Use semantic commit messages

### Code Standards

- ESLint + Prettier for formatting
- Comprehensive JSDoc comments
- Type-safe agent interfaces
- Error boundary patterns

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

- **Documentation**: `/docs` endpoint when running
- **API Docs**: Swagger UI at `/api-docs`
- **Health Status**: `/health` endpoint
- **Issues**: GitHub Issues

---

Built with ❤️ for healthcare professionals and patients. 