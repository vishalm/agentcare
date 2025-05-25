import { ErrorHandler, AgentError, ToolError, ValidationError } from '../../../src/utils/ErrorHandler';
import { Logger } from '../../../src/utils/Logger';
import { MetricsCollector } from '../../../src/utils/MetricsCollector';

describe('ErrorHandler', () => {
  let errorHandler: ErrorHandler;
  let mockLogger: jest.Mocked<Logger>;
  let mockMetrics: jest.Mocked<MetricsCollector>;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    } as any;

    mockMetrics = {
      incrementCounter: jest.fn(),
      recordTiming: jest.fn(),
      getMetric: jest.fn(),
      getAllMetrics: jest.fn(),
      resetMetrics: jest.fn(),
      exportMetrics: jest.fn(),
      startOperation: jest.fn(),
      endOperation: jest.fn(),
      recordError: jest.fn(),
    } as any;

    errorHandler = new ErrorHandler(mockLogger, mockMetrics);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Custom Error Types', () => {
    test('should create AgentError correctly', () => {
      const message = 'Agent processing failed';
      const error = new AgentError(message);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AgentError);
      expect(error.message).toBe(message);
      expect(error.name).toBe('AgentError');
    });

    test('should create ToolError correctly', () => {
      const message = 'Tool activation failed';
      const error = new ToolError(message);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ToolError);
      expect(error.message).toBe(message);
      expect(error.name).toBe('ToolError');
    });

    test('should create ValidationError correctly', () => {
      const message = 'Invalid email format';
      const error = new ValidationError(message);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe(message);
      expect(error.name).toBe('ValidationError');
    });
  });

  describe('Error Handling', () => {
    test('should handle AgentError', () => {
      const error = new AgentError('Test agent error');
      
      const result = errorHandler.handleError(error);
      
      expect(result).toBe('There was an issue processing your request. Please try again.');
      expect(mockLogger.error).toHaveBeenCalledWith('Error occurred', {
        name: 'AgentError',
        message: 'Test agent error',
        stack: expect.any(String)
      });
      expect(mockMetrics.incrementCounter).toHaveBeenCalledWith('error_agenterror');
    });

    test('should handle ToolError', () => {
      const error = new ToolError('Test tool error');
      
      const result = errorHandler.handleError(error);
      
      expect(result).toBe('A system tool encountered an error. Our team has been notified.');
      expect(mockLogger.error).toHaveBeenCalledWith('Error occurred', {
        name: 'ToolError',
        message: 'Test tool error',
        stack: expect.any(String)
      });
      expect(mockMetrics.incrementCounter).toHaveBeenCalledWith('error_toolerror');
    });

    test('should handle ValidationError', () => {
      const error = new ValidationError('Invalid input provided');
      
      const result = errorHandler.handleError(error);
      
      expect(result).toBe('Invalid input provided');
      expect(mockLogger.error).toHaveBeenCalledWith('Error occurred', {
        name: 'ValidationError',
        message: 'Invalid input provided',
        stack: expect.any(String)
      });
      expect(mockMetrics.incrementCounter).toHaveBeenCalledWith('error_validationerror');
    });

    test('should handle generic Error', () => {
      const error = new Error('Generic error');
      
      const result = errorHandler.handleError(error);
      
      expect(result).toBe('An unexpected error occurred. Please try again later.');
      expect(mockLogger.error).toHaveBeenCalledWith('Error occurred', {
        name: 'Error',
        message: 'Generic error',
        stack: expect.any(String)
      });
      expect(mockMetrics.incrementCounter).toHaveBeenCalledWith('error_error');
    });
  });

  describe('Error Retry Logic', () => {
    test('should identify retryable errors', () => {
      const agentError = new AgentError('Agent failed');
      const toolError = new ToolError('Tool failed');
      
      expect(errorHandler.isRetryable(agentError)).toBe(true);
      expect(errorHandler.isRetryable(toolError)).toBe(true);
    });

    test('should identify non-retryable errors', () => {
      const validationError = new ValidationError('Invalid data');
      const genericError = new Error('Generic error');
      
      expect(errorHandler.isRetryable(validationError)).toBe(false);
      expect(errorHandler.isRetryable(genericError)).toBe(false);
    });
  });

  describe('Error Type Classification', () => {
    test('should classify error types correctly', () => {
      const agentError = new AgentError('Agent failed');
      const toolError = new ToolError('Tool failed');
      const validationError = new ValidationError('Validation failed');
      const genericError = new Error('Generic error');
      
      expect(errorHandler.getErrorType(agentError)).toBe('agent');
      expect(errorHandler.getErrorType(toolError)).toBe('tool');
      expect(errorHandler.getErrorType(validationError)).toBe('validation');
      expect(errorHandler.getErrorType(genericError)).toBe('unknown');
    });
  });
}); 