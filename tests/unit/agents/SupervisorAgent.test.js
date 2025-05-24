"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SupervisorAgent_1 = require("../../../backend/src/agents/SupervisorAgent");
// Mock the dependent agents
jest.mock('../../../backend/src/agents/AvailabilityAgent');
jest.mock('../../../backend/src/agents/BookingAgent');
jest.mock('../../../backend/src/agents/FAQAgent');
describe('SupervisorAgent', () => {
    let supervisorAgent;
    let mockLogger;
    let mockMetrics;
    let mockAvailabilityAgent;
    let mockBookingAgent;
    let mockFAQAgent;
    beforeEach(() => {
        mockLogger = {
            info: jest.fn(),
            debug: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
        };
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
        };
        mockAvailabilityAgent = {
            process: jest.fn(),
            isAgentActive: jest.fn(),
        };
        mockBookingAgent = {
            process: jest.fn(),
            isAgentActive: jest.fn(),
        };
        mockFAQAgent = {
            process: jest.fn(),
            isAgentActive: jest.fn(),
        };
        supervisorAgent = new SupervisorAgent_1.SupervisorAgent(mockLogger, mockMetrics, mockAvailabilityAgent, mockBookingAgent, mockFAQAgent);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('Intent Analysis', () => {
        test('should recognize booking intent', async () => {
            const message = 'I want to book an appointment with a cardiologist';
            mockBookingAgent.process.mockResolvedValue('Booking response');
            const response = await supervisorAgent.process(message);
            expect(mockLogger.info).toHaveBeenCalledWith('Delegating to BookingAgent', expect.objectContaining({
                message,
                intent: expect.objectContaining({ type: 'booking', confidence: 0.9 })
            }));
            expect(mockBookingAgent.process).toHaveBeenCalledWith(message, expect.objectContaining({ type: 'booking', confidence: 0.9 }));
            expect(response).toBe('Booking response');
        });
        test('should recognize availability intent', async () => {
            const message = 'What doctors are available this week?';
            mockAvailabilityAgent.process.mockResolvedValue('Availability response');
            const response = await supervisorAgent.process(message);
            expect(mockLogger.info).toHaveBeenCalledWith('Delegating to AvailabilityAgent', expect.objectContaining({
                message,
                intent: expect.objectContaining({ type: 'availability', confidence: 0.8 })
            }));
            expect(mockAvailabilityAgent.process).toHaveBeenCalledWith(message, expect.objectContaining({ type: 'availability', confidence: 0.8 }));
            expect(response).toBe('Availability response');
        });
        test('should recognize information intent', async () => {
            const message = 'Tell me about your doctors';
            mockFAQAgent.process.mockResolvedValue('FAQ response');
            const response = await supervisorAgent.process(message);
            expect(mockLogger.info).toHaveBeenCalledWith('Delegating to FAQAgent', expect.objectContaining({
                message,
                intent: expect.objectContaining({ type: 'information', confidence: 0.7 })
            }));
            expect(mockFAQAgent.process).toHaveBeenCalledWith(message, expect.objectContaining({ type: 'information', confidence: 0.7 }));
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
            expect(mockLogger.error).toHaveBeenCalledWith('Error in SupervisorAgent process', expect.objectContaining({ error: expect.any(Error) }));
        });
        test('should handle availability agent errors', async () => {
            const message = 'What doctors are available?';
            mockAvailabilityAgent.process.mockRejectedValue(new Error('Availability service down'));
            await expect(supervisorAgent.process(message)).rejects.toThrow('Failed to process request');
            expect(mockLogger.error).toHaveBeenCalledWith('Error in SupervisorAgent process', expect.objectContaining({ error: expect.any(Error) }));
        });
        test('should handle FAQ agent errors', async () => {
            const message = 'Tell me about your doctors';
            mockFAQAgent.process.mockRejectedValue(new Error('FAQ service down'));
            await expect(supervisorAgent.process(message)).rejects.toThrow('Failed to process request');
            expect(mockLogger.error).toHaveBeenCalledWith('Error in SupervisorAgent process', expect.objectContaining({ error: expect.any(Error) }));
        });
    });
    describe('Intent Processing with Pre-analyzed Intent', () => {
        test('should use provided intent instead of analyzing', async () => {
            const message = 'Some message';
            const providedIntent = { type: 'booking', confidence: 0.95 };
            mockBookingAgent.process.mockResolvedValue('Booking response');
            const response = await supervisorAgent.process(message, providedIntent);
            expect(mockBookingAgent.process).toHaveBeenCalledWith(message, providedIntent);
            expect(response).toBe('Booking response');
        });
    });
    describe('Logging', () => {
        test('should log processing start', async () => {
            const message = 'Test message';
            mockBookingAgent.process.mockResolvedValue('Response');
            await supervisorAgent.process(message);
            expect(mockLogger.info).toHaveBeenCalledWith('SupervisorAgent processing request', expect.objectContaining({ message }));
        });
        test('should log delegation actions', async () => {
            const availabilityMessage = 'What doctors are available?';
            mockAvailabilityAgent.process.mockResolvedValue('Available doctors');
            await supervisorAgent.process(availabilityMessage);
            expect(mockLogger.info).toHaveBeenCalledWith('Delegating to AvailabilityAgent', expect.objectContaining({
                message: availabilityMessage,
                intent: expect.objectContaining({ type: 'availability' })
            }));
        });
    });
});
//# sourceMappingURL=SupervisorAgent.test.js.map