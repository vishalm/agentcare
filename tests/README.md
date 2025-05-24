# AgentCare Testing Documentation

This document outlines the comprehensive testing strategy for the AgentCare Multi-Agent Healthcare Scheduling System.

## Testing Strategy

AgentCare implements a multi-layered testing approach ensuring reliability, performance, and user experience quality:

### 🧪 Test Types

#### 1. **Unit Tests** (`tests/unit/`)
- **Purpose**: Test individual components in isolation
- **Scope**: Utilities, services, agents, and business logic
- **Framework**: Jest with TypeScript
- **Coverage**: 80%+ code coverage target

#### 2. **Integration Tests** (`tests/integration/`)
- **Purpose**: Test API endpoints and component interactions
- **Scope**: HTTP endpoints, agent coordination, service integration
- **Framework**: Jest + Supertest
- **Coverage**: All API endpoints and critical workflows

#### 3. **Contract Tests** (`tests/contract/`)
- **Purpose**: Ensure API contracts remain consistent
- **Scope**: Request/response formats, error handling, data validation
- **Framework**: Jest with custom contract matchers
- **Coverage**: All public API contracts

#### 4. **UI Tests** (`tests/ui/`)
- **Purpose**: End-to-end user interface testing
- **Scope**: Frontend functionality, user interactions, cross-browser compatibility
- **Framework**: Playwright
- **Coverage**: Critical user journeys and accessibility

## 🚀 Running Tests

### Prerequisites
```bash
# Install dependencies
npm install

# Install Playwright browsers (for UI tests)
npm run install-ui-deps
```

### Test Commands

#### All Tests
```bash
# Run all test suites
npm run test:all

# Run all Jest tests only
npm test

# Run with coverage report
npm run test:coverage
```

#### Individual Test Types
```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# Contract tests only
npm run test:contract

# UI tests only
npm run test:ui

# UI tests with browser window visible
npm run test:ui-headed

# UI tests in debug mode
npm run test:ui-debug
```

#### Development Workflow
```bash
# Watch mode for continuous testing
npm run test:watch

# CI/CD pipeline tests
npm run test:ci
```

## 📁 Test Structure

```
tests/
├── setup.ts                    # Global test configuration
├── unit/                       # Unit tests
│   ├── agents/                 # Agent tests
│   │   ├── SupervisorAgent.test.ts
│   │   ├── AvailabilityAgent.test.ts
│   │   ├── BookingAgent.test.ts
│   │   └── FAQAgent.test.ts
│   ├── services/               # Service tests
│   │   ├── ValidationService.test.ts
│   │   ├── DoctorService.test.ts
│   │   ├── AppointmentService.test.ts
│   │   └── FAQService.test.ts
│   └── utils/                  # Utility tests
│       ├── Logger.test.ts
│       ├── MetricsCollector.test.ts
│       └── ErrorHandler.test.ts
├── integration/                # Integration tests
│   └── api.test.ts
├── contract/                   # Contract tests
│   └── api-contract.test.ts
└── ui/                         # UI tests
    └── agentcare-ui.spec.ts
```

## 🎯 Test Coverage Requirements

### Minimum Coverage Targets
- **Unit Tests**: 85% statement coverage
- **Integration Tests**: 100% endpoint coverage
- **Contract Tests**: 100% API contract coverage
- **UI Tests**: 90% critical user journey coverage

### Coverage Reports
```bash
# Generate coverage report
npm run test:coverage

# View HTML coverage report
open coverage/lcov-report/index.html
```

## 🧪 Unit Tests

### What We Test
- **Utilities**: Logger, MetricsCollector, ErrorHandler, Config
- **Services**: Data validation, business logic, mock operations
- **Agents**: Intent recognition, message processing, state management
- **Tools**: Tool activation, data processing, error handling

### Example Test Patterns
```typescript
describe('SupervisorAgent', () => {
  test('should recognize booking intent', async () => {
    const message = 'I want to book an appointment';
    const response = await supervisorAgent.process(message);
    expect(mockBookingAgent.process).toHaveBeenCalled();
  });
});
```

### Custom Matchers
- `toBeValidEmail()`: Validates email format
- `toBeValidPhone()`: Validates phone number format

## 🔗 Integration Tests

### API Endpoint Testing
- **Health Checks**: System status and availability
- **Agent Processing**: Message handling and responses
- **Status Monitoring**: Agent states and metrics
- **Error Handling**: Graceful failure scenarios

### Test Scenarios
```typescript
test('POST /api/v1/agents/process should process booking request', async () => {
  const response = await request(app)
    .post('/api/v1/agents/process')
    .send({ message: 'I want to book an appointment' })
    .expect(200);
});
```

## 📝 Contract Tests

### Contract Validation
- **Response Structure**: Consistent field names and types
- **Error Formats**: Standardized error responses
- **Timestamp Formats**: ISO 8601 compliance
- **Status Codes**: Proper HTTP status usage

### Contract Examples
```typescript
test('should follow health response contract', async () => {
  const response = await request(app).get('/health');
  expect(response.body).toMatchObject({
    status: expect.any(String),
    timestamp: expect.any(String),
    version: expect.any(String)
  });
});
```

## 🖥️ UI Tests

### Browser Coverage
- **Desktop**: Chrome, Firefox, Safari
- **Mobile**: Chrome Mobile, Safari Mobile
- **Responsive**: Tablet and mobile viewports

### Test Categories
- **Layout**: Page structure and component visibility
- **Interactions**: User input and button clicks
- **Navigation**: Tab order and keyboard accessibility
- **Error Handling**: Network failures and error states
- **Performance**: Load times and responsiveness

### Example UI Test
```typescript
test('should send message on button click', async ({ page }) => {
  await page.locator('#messageInput').fill('Hello');
  await page.locator('#sendButton').click();
  await expect(page.locator('.user-message').last()).toContainText('Hello');
});
```

## 🔧 Test Configuration

### Jest Configuration (`jest.config.js`)
- TypeScript support with ts-jest
- Multiple project setup for different test types
- Coverage collection and reporting
- Custom setup and teardown

### Playwright Configuration (`playwright.config.ts`)
- Multi-browser testing
- Mobile viewport testing
- Automatic server startup
- Video and screenshot capture

### Global Setup (`tests/setup.ts`)
- Environment variable configuration
- Custom Jest matchers
- Console mocking for clean output

## 🐛 Debugging Tests

### Jest Debugging
```bash
# Run specific test file
npm test -- ValidationService.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="booking"

# Debug with Node inspector
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Playwright Debugging
```bash
# Debug mode with browser DevTools
npm run test:ui-debug

# Run specific test file
npx playwright test agentcare-ui.spec.ts

# View test report
npx playwright show-report
```

## 📊 CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run Tests
  run: |
    npm run test:ci
    npm run test:ui
    
- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

### Test Pipeline
1. **Unit Tests**: Fast feedback on code changes
2. **Integration Tests**: API functionality verification
3. **Contract Tests**: API consistency validation
4. **UI Tests**: End-to-end user experience validation

## 🎯 Best Practices

### Writing Tests
- **AAA Pattern**: Arrange, Act, Assert
- **Descriptive Names**: Clear test descriptions
- **Single Responsibility**: One concept per test
- **Independent Tests**: No test dependencies
- **Mock External Dependencies**: Isolated testing

### Test Maintenance
- **Regular Updates**: Keep tests current with code changes
- **Review Coverage**: Monitor and improve coverage gaps
- **Performance**: Keep tests fast and reliable
- **Documentation**: Update test docs with new features

## 🚨 Troubleshooting

### Common Issues

#### Jest Tests Failing
- Check TypeScript compilation errors
- Verify mock configurations
- Ensure proper async/await usage

#### Playwright Tests Failing
- Verify server is running on correct port
- Check browser installation
- Review timeout settings for slow operations

#### Coverage Issues
- Include all source files in coverage collection
- Exclude test files and configuration from coverage
- Set appropriate coverage thresholds

### Getting Help
- Review test logs for specific error messages
- Check browser DevTools in Playwright debug mode
- Verify environment variables and configuration
- Ensure all dependencies are installed correctly

---

## 📈 Metrics and Monitoring

### Test Metrics
- **Test Execution Time**: Monitor for performance regressions
- **Failure Rates**: Track test stability over time
- **Coverage Trends**: Ensure coverage doesn't decrease
- **Browser Compatibility**: Cross-browser test results

### Quality Gates
- All tests must pass before merging
- Coverage must meet minimum thresholds
- No critical accessibility violations
- Performance benchmarks within acceptable ranges

This comprehensive testing strategy ensures AgentCare maintains high quality, reliability, and user experience standards across all components and interactions. 