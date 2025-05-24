# Contributing to AgentCare 🏥

Thank you for your interest in contributing to AgentCare! This document provides guidelines for contributing to our multi-agent healthcare scheduling system.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Code Standards](#code-standards)
- [Testing Requirements](#testing-requirements)
- [Security Guidelines](#security-guidelines)

## 🤝 Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm 8+
- Docker and Docker Compose
- Git with GPG signing configured
- Ollama (optional, for LLM features)

### Setup Development Environment
```bash
# 1. Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/agentcare.git
cd agentcare

# 2. Set up the development environment
npm run dev:setup

# 3. Create a feature branch
git checkout -b feature/your-feature-name

# 4. Start development
npm run start:dev
```

## 🔄 Development Workflow

### Branch Naming Convention
- `feature/` - New features (`feature/ollama-integration`)
- `fix/` - Bug fixes (`fix/authentication-error`)
- `docs/` - Documentation (`docs/api-reference`)
- `refactor/` - Code refactoring (`refactor/agent-architecture`)
- `test/` - Test additions (`test/unit-coverage`)
- `chore/` - Maintenance (`chore/dependency-updates`)

### Development Process
1. **Create Issue** - Always create an issue before starting work
2. **Branch Creation** - Create a feature branch from `main`
3. **Development** - Implement changes with tests
4. **Testing** - Ensure all tests pass
5. **Documentation** - Update relevant documentation
6. **Pull Request** - Submit PR with detailed description
7. **Code Review** - Address reviewer feedback
8. **Merge** - Squash and merge after approval

## 📝 Commit Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types
- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Code style changes (formatting, semicolons, etc.)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Performance improvements
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes affecting build system or external dependencies
- **ci**: Changes to CI configuration files and scripts
- **chore**: Other changes that don't modify src or test files
- **revert**: Reverts a previous commit

### Scopes (Optional)
- **agents**: Multi-agent system changes
- **api**: REST API changes
- **ui**: Frontend/UI changes
- **db**: Database changes
- **auth**: Authentication/authorization
- **llm**: LLM/Ollama integration
- **rag**: RAG system changes
- **docker**: Docker/containerization
- **k8s**: Kubernetes deployment
- **monitoring**: Observability/monitoring

### Examples
```bash
# Good commits
feat(llm): add Ollama qwen2.5 model integration
fix(auth): resolve JWT token expiration handling
docs(api): update endpoint documentation for v2.0
test(agents): add unit tests for SupervisorAgent
chore(deps): update dependencies to latest versions

# Bad commits
Update stuff
Fixed bug
Added feature
WIP
```

### Commit Message Rules
1. **Imperative mood**: Use imperative, present tense ("add" not "added" or "adds")
2. **Lowercase**: Start with lowercase letter
3. **No period**: Don't end with a period
4. **50 character limit**: Keep the first line under 50 characters
5. **Body explanation**: Use body to explain "what" and "why" vs. "how"

### Breaking Changes
For breaking changes, add `BREAKING CHANGE:` in the footer:
```
feat(api): restructure authentication endpoints

BREAKING CHANGE: /auth/login endpoint now requires email instead of username
```

## 🔍 Pull Request Process

### Before Submitting
- [ ] Code follows project style guidelines
- [ ] Self-review of code completed
- [ ] Tests added for new functionality
- [ ] All tests pass locally
- [ ] Documentation updated if needed
- [ ] No security vulnerabilities introduced
- [ ] HIPAA compliance maintained

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change (fix or feature causing existing functionality to change)
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No security vulnerabilities
- [ ] HIPAA compliance maintained
```

### Review Criteria
- **Functionality**: Does the code work as intended?
- **Security**: Are there any security vulnerabilities?
- **Performance**: Will this impact system performance?
- **Maintainability**: Is the code readable and maintainable?
- **Testing**: Are there adequate tests?
- **Documentation**: Is documentation updated?

## 🐛 Issue Guidelines

### Issue Types
- **Bug Report**: Something isn't working
- **Feature Request**: Suggest new functionality
- **Documentation**: Improve or add documentation
- **Performance**: Performance-related issues
- **Security**: Security vulnerabilities (use security template)

### Issue Labels
- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `priority:high` - High priority issue
- `priority:medium` - Medium priority issue
- `priority:low` - Low priority issue
- `component:agents` - Multi-agent system
- `component:api` - REST API
- `component:ui` - Frontend/UI
- `component:auth` - Authentication
- `component:llm` - LLM integration
- `component:rag` - RAG system
- `component:docker` - Docker/containers
- `component:k8s` - Kubernetes

## 💻 Code Standards

### TypeScript Guidelines
- Use strict TypeScript configuration
- Prefer `interface` over `type` for object shapes
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Handle errors explicitly

### File Organization
```
backend/src/
├── agents/          # Multi-agent implementations
├── services/        # Business logic services
├── utils/           # Utility functions
├── interfaces/      # TypeScript interfaces
├── middleware/      # Express middleware
└── tools/           # Agent tools
```

### Naming Conventions
- **Files**: `kebab-case.ts`
- **Classes**: `PascalCase`
- **Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Interfaces**: `IPascalCase`

### Code Style
```typescript
// Good
interface IUserPreferences {
  theme: 'light' | 'dark';
  notifications: boolean;
}

class UserManagementService {
  private readonly logger: Logger;
  
  constructor(logger: Logger) {
    this.logger = logger;
  }
  
  public async createUser(userData: IUserData): Promise<IUser> {
    // Implementation
  }
}

// Use async/await instead of promises
const user = await userService.createUser(userData);
```

## 🧪 Testing Requirements

### Test Coverage
- **Minimum 80%** overall test coverage
- **90%** for critical healthcare features
- **100%** for security-related functions

### Test Types
1. **Unit Tests**: Test individual functions/classes
2. **Integration Tests**: Test API endpoints
3. **Contract Tests**: Test agent interactions
4. **E2E Tests**: Test complete user workflows

### Testing Standards
```typescript
// Good test structure
describe('UserManagementService', () => {
  let service: UserManagementService;
  let mockLogger: jest.Mocked<Logger>;
  
  beforeEach(() => {
    mockLogger = createMockLogger();
    service = new UserManagementService(mockLogger);
  });
  
  describe('createUser', () => {
    it('should create user with valid data', async () => {
      // Arrange
      const userData = { email: 'test@example.com', password: 'secure123' };
      
      // Act
      const result = await service.createUser(userData);
      
      // Assert
      expect(result.id).toBeDefined();
      expect(result.email).toBe(userData.email);
    });
  });
});
```

## 🔒 Security Guidelines

### HIPAA Compliance
- **No PHI in logs**: Never log patient data
- **Data encryption**: Encrypt sensitive data at rest and in transit
- **Access controls**: Implement proper authentication/authorization
- **Audit logging**: Track all access to patient data

### Security Checklist
- [ ] Input validation and sanitization
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Rate limiting implementation
- [ ] Secure session management
- [ ] Error handling without information disclosure

### Vulnerability Reporting
Report security vulnerabilities via our [Security Policy](SECURITY.md). Do not create public issues for security vulnerabilities.

## 📚 Documentation Standards

### Code Documentation
```typescript
/**
 * Creates a new healthcare appointment
 * @param patientId - Unique identifier for the patient
 * @param doctorId - Unique identifier for the doctor
 * @param appointmentDate - Desired appointment date/time
 * @returns Promise resolving to created appointment
 * @throws {ValidationError} When input data is invalid
 * @throws {ConflictError} When appointment slot is unavailable
 */
public async createAppointment(
  patientId: string,
  doctorId: string,
  appointmentDate: Date
): Promise<IAppointment> {
  // Implementation
}
```

### README Updates
- Keep README.md current with latest features
- Update setup instructions for new dependencies
- Include troubleshooting for common issues

## 🎯 Performance Guidelines

### Agent Performance
- Agents should respond within 500ms for 95% of requests
- Implement proper caching for frequently accessed data
- Use connection pooling for database operations
- Monitor memory usage in long-running processes

### API Performance
- RESTful endpoints should respond within 200ms
- Implement pagination for large datasets
- Use appropriate HTTP status codes
- Implement proper error handling

## 🏥 Healthcare Specific Guidelines

### Patient Data Handling
- Always use de-identified data in development
- Implement proper access controls
- Log all access to patient data
- Use encryption for data transmission

### Appointment Management
- Ensure appointment slots are properly locked during booking
- Implement proper cancellation workflows
- Handle timezone conversions correctly
- Validate doctor availability

## 🆘 Getting Help

### Communication Channels
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and discussions
- **Discord**: Real-time chat (link in README)
- **Email**: maintainers@agentcare.dev

### Development Support
- Check existing issues before creating new ones
- Use issue templates for consistent reporting
- Provide minimal reproducible examples
- Include relevant logs and error messages

---

## 📞 Contact

- **Maintainers**: @vishalm
- **Email**: maintainers@agentcare.dev
- **Website**: https://agentcare.dev

Thank you for contributing to AgentCare! Together, we're building the future of healthcare scheduling. 🏥✨ 