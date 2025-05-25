"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const OllamaService_1 = require("../../backend/src/services/OllamaService");
// Mock fetch globally
global.fetch = jest.fn();
describe('OllamaService', () => {
    let ollamaService;
    let mockLogger;
    let mockConfig;
    beforeEach(() => {
        // Create mock logger
        mockLogger = {
            info: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn()
        };
        // Create mock config
        mockConfig = {
            get: jest.fn((key) => {
                switch (key) {
                    case 'OLLAMA_BASE_URL':
                        return 'http://localhost:11434';
                    case 'OLLAMA_MODEL':
                        return 'qwen2.5:latest';
                    default:
                        return '';
                }
            })
        };
        ollamaService = new OllamaService_1.OllamaService(mockLogger, mockConfig);
        // Clear all mocks
        jest.clearAllMocks();
    });
    afterEach(() => {
        jest.resetAllMocks();
    });
    describe('generateResponse', () => {
        it('should generate a response successfully', async () => {
            // Mock successful API response
            const mockResponse = {
                message: {
                    content: 'Hello! How can I help you with healthcare scheduling today?'
                },
                model: 'qwen2.5:latest',
                eval_count: 25
            };
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            });
            const result = await ollamaService.generateResponse('Hello, I need help booking an appointment', 'Previous conversation context', 'You are a healthcare assistant');
            expect(result.response).toBe('Hello! How can I help you with healthcare scheduling today?');
            expect(result.tokens).toBe(25);
            expect(mockLogger.info).toHaveBeenCalledWith('Generating response with Ollama', expect.any(Object));
        });
        it('should handle API errors gracefully', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error'
            });
            await expect(ollamaService.generateResponse('Test message')).rejects.toThrow('Failed to generate response');
            expect(mockLogger.error).toHaveBeenCalledWith('Error generating Ollama response', expect.any(Object));
        });
        it('should handle network errors', async () => {
            global.fetch.mockRejectedValueOnce(new Error('Network error'));
            await expect(ollamaService.generateResponse('Test message')).rejects.toThrow('Failed to generate response: Network error');
        });
        it('should format messages correctly with context and system prompt', async () => {
            const mockResponse = {
                message: { content: 'Response' },
                model: 'qwen2.5:latest'
            };
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            });
            await ollamaService.generateResponse('User message', 'Context content', 'System instructions');
            const fetchCall = global.fetch.mock.calls[0];
            const requestBody = JSON.parse(fetchCall[1].body);
            expect(requestBody.messages).toHaveLength(3);
            expect(requestBody.messages[0].role).toBe('system');
            expect(requestBody.messages[0].content).toBe('System instructions');
            expect(requestBody.messages[1].role).toBe('system');
            expect(requestBody.messages[1].content).toContain('Context content');
            expect(requestBody.messages[2].role).toBe('user');
            expect(requestBody.messages[2].content).toBe('User message');
        });
    });
    describe('analyzeIntent', () => {
        it('should analyze intent successfully', async () => {
            const mockResponse = {
                message: {
                    content: JSON.stringify({
                        intent: 'booking',
                        confidence: 0.95,
                        entities: ['cardiology', 'appointment'],
                        summary: 'User wants to book a cardiology appointment'
                    })
                }
            };
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            });
            const result = await ollamaService.analyzeIntent('I want to book an appointment with a cardiologist');
            expect(result.intent).toBe('booking');
            expect(result.confidence).toBe(0.95);
            expect(result.entities).toContain('cardiology');
            expect(result.summary).toContain('cardiology appointment');
        });
        it('should use fallback intent analysis for invalid JSON', async () => {
            const mockResponse = {
                message: {
                    content: 'Invalid JSON response'
                }
            };
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            });
            const result = await ollamaService.analyzeIntent('I want to book an appointment');
            expect(result.intent).toBe('booking');
            expect(result.confidence).toBe(0.8);
            expect(result.summary).toBe('Booking request');
            expect(mockLogger.warn).toHaveBeenCalledWith('Failed to parse intent analysis JSON, using fallback', expect.any(Object));
        });
        it('should handle intent analysis errors', async () => {
            global.fetch.mockRejectedValueOnce(new Error('Network error'));
            const result = await ollamaService.analyzeIntent('Test message');
            expect(result.intent).toBe('general');
            expect(result.confidence).toBe(0.5);
            expect(result.summary).toBe('Could not analyze intent');
            expect(mockLogger.error).toHaveBeenCalledWith('Error analyzing intent with Ollama', expect.any(Object));
        });
    });
    describe('generateEmbeddings', () => {
        it('should generate embeddings successfully', async () => {
            const mockEmbedding = [0.1, 0.2, 0.3, 0.4];
            const mockResponse = {
                embedding: mockEmbedding
            };
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            });
            const result = await ollamaService.generateEmbeddings('Test text');
            expect(result).toEqual(mockEmbedding);
            expect(global.fetch).toHaveBeenCalledWith('http://localhost:11434/api/embeddings', expect.objectContaining({
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'qwen2.5:latest',
                    prompt: 'Test text'
                })
            }));
        });
        it('should handle embedding generation errors', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: false,
                status: 500
            });
            await expect(ollamaService.generateEmbeddings('Test text')).rejects.toThrow('Embedding API error: 500');
        });
    });
    describe('healthCheck', () => {
        it('should return true when Ollama is healthy', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true
            });
            const result = await ollamaService.healthCheck();
            expect(result).toBe(true);
            expect(global.fetch).toHaveBeenCalledWith('http://localhost:11434/api/tags');
        });
        it('should return false when Ollama is unhealthy', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: false
            });
            const result = await ollamaService.healthCheck();
            expect(result).toBe(false);
            expect(mockLogger.error).toHaveBeenCalledWith('Ollama health check failed', expect.any(Object));
        });
        it('should return false on network errors', async () => {
            global.fetch.mockRejectedValueOnce(new Error('Connection refused'));
            const result = await ollamaService.healthCheck();
            expect(result).toBe(false);
        });
    });
    describe('pullModel', () => {
        it('should pull model successfully', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true
            });
            const result = await ollamaService.pullModel('qwen2.5:latest');
            expect(result).toBe(true);
            expect(mockLogger.info).toHaveBeenCalledWith('Pulling Ollama model', { model: 'qwen2.5:latest' });
        });
        it('should use default model when none specified', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true
            });
            await ollamaService.pullModel();
            const fetchCall = global.fetch.mock.calls[0];
            const requestBody = JSON.parse(fetchCall[1].body);
            expect(requestBody.name).toBe('qwen2.5:latest');
        });
        it('should handle pull errors', async () => {
            global.fetch.mockRejectedValueOnce(new Error('Pull failed'));
            const result = await ollamaService.pullModel('test-model');
            expect(result).toBe(false);
            expect(mockLogger.error).toHaveBeenCalledWith('Error pulling Ollama model', expect.objectContaining({
                error: 'Pull failed',
                model: 'test-model'
            }));
        });
    });
});
//# sourceMappingURL=OllamaService.test.js.map