import { SupervisorAgent } from '../../../backend/src/agents/SupervisorAgent';
import { Logger } from '../../../backend/src/utils/Logger';
import { MetricsCollector } from '../../../backend/src/utils/MetricsCollector';
import { OllamaService } from '../../../backend/src/services/OllamaService';
import { UserManagementService } from '../../../backend/src/services/UserManagementService';
import { RAGService } from '../../../backend/src/services/RAGService';
import { AvailabilityAgent } from '../../../backend/src/agents/AvailabilityAgent';
import { BookingAgent } from '../../../backend/src/agents/BookingAgent';
import { FAQAgent } from '../../../backend/src/agents/FAQAgent';

// Mock the dependent agents
jest.mock('../../../backend/src/agents/AvailabilityAgent');
jest.mock('../../../backend/src/agents/BookingAgent');
jest.mock('../../../backend/src/agents/FAQAgent');

describe('SupervisorAgent', () => {
  let supervisorAgent: SupervisorAgent;
  let mockLogger: jest.Mocked<Logger>;
  let mockMetrics: jest.Mocked<MetricsCollector>;
  let mockOllamaService: jest.Mocked<OllamaService>;
  let mockUserService: jest.Mocked<UserManagementService>;
  let mockRAGService: jest.Mocked<RAGService>;
  let mockAvailabilityAgent: jest.Mocked<AvailabilityAgent>;
  let mockBookingAgent: jest.Mocked<BookingAgent>;
  let mockFAQAgent: jest.Mocked<FAQAgent>;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    } as any;

    mockMetrics = {
      startOperation: jest.fn(),
      endOperation: jest.fn(),
      recordError: jest.fn(),
      incrementCounter: jest.fn(),
      recordTiming: jest.fn(),
      getMetric: jest.fn(),
      getAllMetrics: jest.fn(),
      resetMetrics: jest.fn(),
      exportMetrics: jest.fn(),
    } as any;

    mockOllamaService = {
      analyzeIntent: jest.fn(),
      generateResponse: jest.fn(),
      healthCheck: jest.fn()
    } as any;

    mockUserService = {
      validateToken: jest.fn(),
      addMessage: jest.fn(),
      getConversationHistory: jest.fn(),
      getConversationContext: jest.fn()
    } as any;

    mockRAGService = {
      retrieveContext: jest.fn(),
      storeConversationMessage: jest.fn(),
      generateEnhancedPrompt: jest.fn(),
      updateConversationSummary: jest.fn(),
      cleanupUserData: jest.fn()
    } as any;

    mockAvailabilityAgent = {
      process: jest.fn(),
      isAgentActive: jest.fn(),
    } as any;

    mockBookingAgent = {
      process: jest.fn(),
      isAgentActive: jest.fn(),
    } as any;

    mockFAQAgent = {
      process: jest.fn(),
      isAgentActive: jest.fn(),
    } as any;

    supervisorAgent = new SupervisorAgent(
      mockLogger,
      mockMetrics,
      mockOllamaService,
      mockUserService,
      mockRAGService,
      mockAvailabilityAgent,
      mockBookingAgent,
      mockFAQAgent
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create a SupervisorAgent instance', () => {
      expect(supervisorAgent).toBeInstanceOf(SupervisorAgent);
      expect(supervisorAgent.isAgentActive()).toBe(false);
    });
  });

  describe('isAgentActive', () => {
    it('should return false initially', () => {
      expect(supervisorAgent.isAgentActive()).toBe(false);
    });
  });

  describe('healthCheck', () => {
    it('should return health status for all services', async () => {
      mockOllamaService.healthCheck.mockResolvedValue(true);

      const result = await supervisorAgent.healthCheck();

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('services');
      expect(result.services).toHaveProperty('ollama');
      expect(result.services).toHaveProperty('supervisor');
      expect(result.services).toHaveProperty('availability');
      expect(result.services).toHaveProperty('booking');
      expect(result.services).toHaveProperty('faq');
    });

    it('should return healthy status when all services are available', async () => {
      mockOllamaService.healthCheck.mockResolvedValue(true);

      const result = await supervisorAgent.healthCheck();

      expect(result.status).toBe('healthy');
    });
  });

  describe('process', () => {
    const mockMessage = 'Hello, I need to book an appointment';
    const mockUser = {
      id: 'user123',
      email: 'test@example.com',
      name: 'Test User',
      passwordHash: 'hash',
      createdAt: new Date(),
      isActive: true,
      preferences: {
        language: 'en',
        timezone: 'UTC',
        notifications: { email: true, sms: false, reminders: true },
        preferredDoctorSpecializations: []
      },
      profile: {}
    };

    const mockSession = {
      sessionId: 'session123',
      userId: 'user123',
      createdAt: new Date(),
      lastActivityAt: new Date(),
      expiresAt: new Date(Date.now() + 3600000),
      isActive: true
    };

    it('should process message and return response', async () => {
      // Setup mocks
      mockUserService.validateToken.mockResolvedValue({ user: mockUser, session: mockSession });
      mockUserService.getConversationHistory.mockResolvedValue('Previous conversation...');
      mockRAGService.retrieveContext.mockResolvedValue({
        relevantHistory: 'Previous interactions...',
        userPreferences: JSON.stringify(mockUser.preferences),
        entities: new Map(),
        conversationSummary: 'User needs healthcare assistance',
        recentContext: 'context'
      });
      mockUserService.addMessage.mockResolvedValue({
        id: 'msg123',
        role: 'user',
        content: mockMessage,
        timestamp: new Date()
      });
      mockOllamaService.analyzeIntent.mockResolvedValue({
        intent: 'booking',
        confidence: 0.9,
        entities: [],
        summary: 'User wants to book an appointment'
      });
      mockRAGService.generateEnhancedPrompt.mockResolvedValue('Enhanced prompt...');
      mockOllamaService.generateResponse.mockResolvedValue({
        response: 'I can help you book an appointment',
        tokens: 50
      });
      mockBookingAgent.process.mockResolvedValue('Booking process completed');

      const result = await supervisorAgent.process(mockMessage, { token: 'valid-token' });

      expect(result).toContain('I can help you book an appointment');
      expect(mockLogger.info).toHaveBeenCalledWith('SupervisorAgent processing message', expect.any(Object));
      expect(mockMetrics.startOperation).toHaveBeenCalled();
      expect(mockMetrics.endOperation).toHaveBeenCalled();
    });

    it('should handle invalid token by creating guest session', async () => {
      mockUserService.validateToken.mockRejectedValue(new Error('Invalid token'));
      mockOllamaService.analyzeIntent.mockResolvedValue({
        intent: 'general',
        confidence: 0.8,
        entities: [],
        summary: 'General conversation'
      });
      mockUserService.addMessage.mockResolvedValue({
        id: 'msg123',
        role: 'user',
        content: mockMessage,
        timestamp: new Date()
      });
      mockOllamaService.generateResponse.mockResolvedValue({
        response: 'Hello! How can I help you today?',
        tokens: 30
      });

      const result = await supervisorAgent.process(mockMessage, { token: 'invalid-token' });

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Token validation failed, creating guest session',
        expect.objectContaining({
          errorType: 'Error',
          sessionType: 'guest'
        })
      );
      expect(result).toBeDefined();
    });

    it('should handle no token by creating guest session', async () => {
      mockOllamaService.analyzeIntent.mockResolvedValue({
        intent: 'general',
        confidence: 0.8,
        entities: [],
        summary: 'General conversation'
      });
      mockUserService.addMessage.mockResolvedValue({
        id: 'msg123',
        role: 'user',
        content: mockMessage,
        timestamp: new Date()
      });
      mockOllamaService.generateResponse.mockResolvedValue({
        response: 'Hello! How can I help you today?',
        tokens: 30
      });

      const result = await supervisorAgent.process(mockMessage);

      expect(result).toBeDefined();
      expect(mockUserService.validateToken).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      mockUserService.validateToken.mockRejectedValue(new Error('Database error'));
      mockUserService.addMessage.mockRejectedValue(new Error('Failed to add message'));

      const result = await supervisorAgent.process(mockMessage, { token: 'valid-token' });

      expect(result).toContain('experiencing some technical difficulties');
      expect(mockLogger.error).toHaveBeenCalled();
      expect(mockMetrics.recordError).toHaveBeenCalledWith('supervisor_process');
    });
  });

  describe('resetConversation', () => {
    it('should reset conversation successfully', async () => {
      mockUserService.getConversationContext.mockResolvedValue({
        userId: 'user123',
        sessionId: 'session123',
        messages: [],
        summary: '',
        entities: new Map(),
        lastUpdated: new Date()
      });
      mockRAGService.cleanupUserData.mockResolvedValue(undefined);

      await supervisorAgent.resetConversation('user123', 'session123');

      expect(mockLogger.info).toHaveBeenCalledWith('Conversation reset completed', {
        userId: 'user123',
        sessionId: 'session123'
      });
    });

    it('should handle reset errors gracefully', async () => {
      mockUserService.getConversationContext.mockRejectedValue(new Error('Reset failed'));

      await supervisorAgent.resetConversation('user123', 'session123');

      expect(mockLogger.error).toHaveBeenCalledWith('Error resetting conversation', expect.any(Object));
    });
  });

  describe('Intent Analysis', () => {
    test('should recognize booking intent', async () => {
      const message = 'I want to book an appointment with a cardiologist';
      mockBookingAgent.process.mockResolvedValue('Booking response');

      const response = await supervisorAgent.process(message);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Delegating to BookingAgent',
        expect.objectContaining({
          message,
          intent: expect.objectContaining({ type: 'booking', confidence: 0.9 })
        })
      );
      expect(mockBookingAgent.process).toHaveBeenCalledWith(
        message,
        expect.objectContaining({ type: 'booking', confidence: 0.9 })
      );
      expect(response).toBe('Booking response');
    });

    test('should recognize availability intent', async () => {
      const message = 'What doctors are available this week?';
      mockAvailabilityAgent.process.mockResolvedValue('Availability response');

      const response = await supervisorAgent.process(message);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Delegating to AvailabilityAgent',
        expect.objectContaining({
          message,
          intent: expect.objectContaining({ type: 'availability', confidence: 0.8 })
        })
      );
      expect(mockAvailabilityAgent.process).toHaveBeenCalledWith(
        message,
        expect.objectContaining({ type: 'availability', confidence: 0.8 })
      );
      expect(response).toBe('Availability response');
    });

    test('should recognize information intent', async () => {
      const message = 'Tell me about your doctors';
      mockFAQAgent.process.mockResolvedValue('FAQ response');

      const response = await supervisorAgent.process(message);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Delegating to FAQAgent',
        expect.objectContaining({
          message,
          intent: expect.objectContaining({ type: 'information', confidence: 0.7 })
        })
      );
      expect(mockFAQAgent.process).toHaveBeenCalledWith(
        message,
        expect.objectContaining({ type: 'information', confidence: 0.7 })
      );
      expect(response).toBe('FAQ response');
    });

    test('should handle general/unknown intents', async () => {
      const message = 'Hello there';

      const response = await supervisorAgent.process(message);

      expect(response).toContain('I understand you need assistance with appointments');
      expect(response).toContain('Book a new appointment');
      expect(response).toContain('Check doctor availability');
      expect(response).toContain('Get information about our doctors');
    });
  });

  describe('Agent State Management', () => {
    test('should track active state during processing', async () => {
      const message = 'I want to book an appointment';
      mockBookingAgent.process.mockImplementation(() => {
        // Check if supervisor is active during delegation
        expect(supervisorAgent.isAgentActive()).toBe(true);
        return Promise.resolve('Booking response');
      });

      await supervisorAgent.process(message);

      // Should be inactive after processing
      expect(supervisorAgent.isAgentActive()).toBe(false);
    });

    test('should reset active state on error', async () => {
      const message = 'I want to book an appointment';
      mockBookingAgent.process.mockRejectedValue(new Error('Booking failed'));

      await expect(supervisorAgent.process(message)).rejects.toThrow('Failed to process request');
      expect(supervisorAgent.isAgentActive()).toBe(false);
    });
  });

  describe('Metrics Collection', () => {
    test('should track operation metrics', async () => {
      const message = 'I want to book an appointment';
      mockBookingAgent.process.mockResolvedValue('Booking response');

      await supervisorAgent.process(message);

      expect(mockMetrics.startOperation).toHaveBeenCalledWith('supervisor_process');
      expect(mockMetrics.endOperation).toHaveBeenCalledWith('supervisor_process');
    });

    test('should record error metrics on failure', async () => {
      const message = 'I want to book an appointment';
      mockBookingAgent.process.mockRejectedValue(new Error('Booking failed'));

      await expect(supervisorAgent.process(message)).rejects.toThrow();

      expect(mockMetrics.startOperation).toHaveBeenCalledWith('supervisor_process');
      expect(mockMetrics.recordError).toHaveBeenCalledWith('supervisor_process');
    });
  });

  describe('Error Handling', () => {
    test('should handle booking agent errors', async () => {
      const message = 'I want to book an appointment';
      mockBookingAgent.process.mockRejectedValue(new Error('Booking service down'));

      await expect(supervisorAgent.process(message)).rejects.toThrow('Failed to process request');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error in SupervisorAgent process',
        expect.objectContaining({ error: expect.any(Error) })
      );
    });

    test('should handle availability agent errors', async () => {
      const message = 'What doctors are available?';
      mockAvailabilityAgent.process.mockRejectedValue(new Error('Availability service down'));

      await expect(supervisorAgent.process(message)).rejects.toThrow('Failed to process request');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error in SupervisorAgent process',
        expect.objectContaining({ error: expect.any(Error) })
      );
    });

    test('should handle FAQ agent errors', async () => {
      const message = 'Tell me about your doctors';
      mockFAQAgent.process.mockRejectedValue(new Error('FAQ service down'));

      await expect(supervisorAgent.process(message)).rejects.toThrow('Failed to process request');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error in SupervisorAgent process',
        expect.objectContaining({ error: expect.any(Error) })
      );
    });
  });

  describe('Logging', () => {
    test('should log processing start', async () => {
      const message = 'Test message';
      mockBookingAgent.process.mockResolvedValue('Response');

      await supervisorAgent.process(message);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'SupervisorAgent processing request',
        expect.objectContaining({ message })
      );
    });

    test('should log delegation actions', async () => {
      const availabilityMessage = 'What doctors are available?';
      mockAvailabilityAgent.process.mockResolvedValue('Available doctors');

      await supervisorAgent.process(availabilityMessage);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Delegating to AvailabilityAgent',
        expect.objectContaining({ 
          message: availabilityMessage,
          intent: expect.objectContaining({ type: 'availability' })
        })
      );
    });
  });
}); 