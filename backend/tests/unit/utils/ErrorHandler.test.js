"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ErrorHandler_1 = require("../../../backend/src/utils/ErrorHandler");
describe('ErrorHandler', () => {
    let errorHandler;
    let mockLogger;
    let mockMetrics;
    beforeEach(() => {
        mockLogger = {
            info: jest.fn(),
            debug: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
        };
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
        };
        errorHandler = new ErrorHandler_1.ErrorHandler(mockLogger, mockMetrics);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('Custom Error Types', () => {
        test('should create AgentError correctly', () => {
            const message = 'Agent processing failed';
            const error = new ErrorHandler_1.AgentError(message);
            expect(error).toBeInstanceOf(Error);
            expect(error).toBeInstanceOf(ErrorHandler_1.AgentError);
            expect(error.message).toBe(message);
            expect(error.name).toBe('AgentError');
        });
        test('should create ToolError correctly', () => {
            const message = 'Tool activation failed';
            const error = new ErrorHandler_1.ToolError(message);
            expect(error).toBeInstanceOf(Error);
            expect(error).toBeInstanceOf(ErrorHandler_1.ToolError);
            expect(error.message).toBe(message);
            expect(error.name).toBe('ToolError');
        });
        test('should create ValidationError correctly', () => {
            const message = 'Invalid email format';
            const error = new ErrorHandler_1.ValidationError(message);
            expect(error).toBeInstanceOf(Error);
            expect(error).toBeInstanceOf(ErrorHandler_1.ValidationError);
            expect(error.message).toBe(message);
            expect(error.name).toBe('ValidationError');
        });
    });
    describe('Error Handling', () => {
        test('should handle AgentError', () => {
            const error = new ErrorHandler_1.AgentError('Test agent error');
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
            const error = new ErrorHandler_1.ToolError('Test tool error');
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
            const error = new ErrorHandler_1.ValidationError('Invalid input provided');
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
            const agentError = new ErrorHandler_1.AgentError('Agent failed');
            const toolError = new ErrorHandler_1.ToolError('Tool failed');
            expect(errorHandler.isRetryable(agentError)).toBe(true);
            expect(errorHandler.isRetryable(toolError)).toBe(true);
        });
        test('should identify non-retryable errors', () => {
            const validationError = new ErrorHandler_1.ValidationError('Invalid data');
            const genericError = new Error('Generic error');
            expect(errorHandler.isRetryable(validationError)).toBe(false);
            expect(errorHandler.isRetryable(genericError)).toBe(false);
        });
    });
    describe('Error Type Classification', () => {
        test('should classify error types correctly', () => {
            const agentError = new ErrorHandler_1.AgentError('Agent failed');
            const toolError = new ErrorHandler_1.ToolError('Tool failed');
            const validationError = new ErrorHandler_1.ValidationError('Validation failed');
            const genericError = new Error('Generic error');
            expect(errorHandler.getErrorType(agentError)).toBe('agent');
            expect(errorHandler.getErrorType(toolError)).toBe('tool');
            expect(errorHandler.getErrorType(validationError)).toBe('validation');
            expect(errorHandler.getErrorType(genericError)).toBe('unknown');
        });
    });
});
//# sourceMappingURL=ErrorHandler.test.js.map