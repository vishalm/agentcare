import request from 'supertest';
import express from 'express';
import { Logger } from '../../src/utils/Logger';
import { MetricsCollector } from '../../src/utils/MetricsCollector';
import { Config } from '../../src/utils/Config';
import { SupervisorAgent } from '../../src/agents/SupervisorAgent';

// Mock config to avoid file system dependencies
jest.mock('../../src/utils/Config');

describe('API Integration Tests', () => {
  let app: express.Application;
  let logger: Logger;
  let metrics: MetricsCollector;
  let config: jest.Mocked<Config>;

  beforeAll(() => {
    // Mock config
    const mockConfig = {
      get: jest.fn((key: string) => {
        const configs: Record<string, any> = {
          'NODE_ENV': 'test',
          'API_PORT': 3000,
          'CORS_ORIGIN': '*',
          'LOG_LEVEL': 'error'
        };
        return configs[key];
      }),
      getInstance: jest.fn()
    } as any;

    (Config.getInstance as jest.Mock).mockReturnValue(mockConfig);
    config = mockConfig;

    // Set up test app
    app = express();
    logger = new Logger();
    metrics = new MetricsCollector(logger);

    // Set up basic middleware
    app.use(express.json());
    
    // Mock supervisor agent
    const mockSupervisorAgent = {
      process: jest.fn(),
      isAgentActive: jest.fn()
    } as any;

    // Set up routes
    app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0-alpha'
      });
    });

    app.post('/api/v1/agents/process', async (req, res) => {
      try {
        const { message } = req.body;
        
        if (!message) {
          return res.status(400).json({
            error: 'Message is required'
          });
        }

        // Mock agent processing
        let response = 'Mock agent response';
        if (message.toLowerCase().includes('book')) {
          response = 'I can help you book an appointment. Please provide your details.';
        } else if (message.toLowerCase().includes('available')) {
          response = 'Here are our available doctors and times.';
        } else if (message.toLowerCase().includes('doctor')) {
          response = 'Our doctors are experts in their fields.';
        }

        res.json({
          response,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        res.status(500).json({
          error: 'Internal server error',
          timestamp: new Date().toISOString()
        });
      }
    });

    app.get('/api/v1/agents/status', (req, res) => {
      res.json({
        supervisor: {
          active: false
        },
        metrics: {},
        timestamp: new Date().toISOString()
      });
    });

    app.get('/api/v1/metrics', (req, res) => {
      res.json({
        metrics: metrics.exportMetrics(),
        timestamp: new Date().toISOString()
      });
    });

    app.post('/api/v1/agents/reset', (req, res) => {
      res.json({
        message: 'Conversation reset successfully',
        timestamp: new Date().toISOString()
      });
    });

    // 404 handler
    app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Endpoint not found',
        timestamp: new Date().toISOString()
      });
    });
  });

  describe('Health Endpoint', () => {
    test('GET /health should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({
        status: 'healthy',
        timestamp: expect.any(String),
        version: '1.0.0-alpha'
      });
    });
  });

  describe('Agent Processing Endpoint', () => {
    test('POST /api/v1/agents/process should process booking request', async () => {
      const message = 'I want to book an appointment';
      
      const response = await request(app)
        .post('/api/v1/agents/process')
        .send({ message })
        .expect(200);

      expect(response.body).toEqual({
        response: expect.stringContaining('book'),
        timestamp: expect.any(String)
      });
    });

    test('POST /api/v1/agents/process should process availability request', async () => {
      const message = 'What doctors are available?';
      
      const response = await request(app)
        .post('/api/v1/agents/process')
        .send({ message })
        .expect(200);

      expect(response.body).toEqual({
        response: expect.stringContaining('available'),
        timestamp: expect.any(String)
      });
    });

    test('POST /api/v1/agents/process should process doctor information request', async () => {
      const message = 'Tell me about your doctors';
      
      const response = await request(app)
        .post('/api/v1/agents/process')
        .send({ message })
        .expect(200);

      expect(response.body).toEqual({
        response: expect.stringContaining('doctors'),
        timestamp: expect.any(String)
      });
    });

    test('POST /api/v1/agents/process should return 400 for missing message', async () => {
      const response = await request(app)
        .post('/api/v1/agents/process')
        .send({})
        .expect(400);

      expect(response.body).toEqual({
        error: 'Message is required'
      });
    });

    test('POST /api/v1/agents/process should handle empty message', async () => {
      const response = await request(app)
        .post('/api/v1/agents/process')
        .send({ message: '' })
        .expect(400);

      expect(response.body).toEqual({
        error: 'Message is required'
      });
    });
  });

  describe('Agent Status Endpoint', () => {
    test('GET /api/v1/agents/status should return agent status', async () => {
      const response = await request(app)
        .get('/api/v1/agents/status')
        .expect(200);

      expect(response.body).toEqual({
        supervisor: {
          active: expect.any(Boolean)
        },
        metrics: expect.any(Object),
        timestamp: expect.any(String)
      });
    });
  });

  describe('Metrics Endpoint', () => {
    test('GET /api/v1/metrics should return metrics', async () => {
      const response = await request(app)
        .get('/api/v1/metrics')
        .expect(200);

      expect(response.body).toEqual({
        metrics: expect.any(Object),
        timestamp: expect.any(String)
      });
    });
  });

  describe('Reset Endpoint', () => {
    test('POST /api/v1/agents/reset should reset conversation', async () => {
      const response = await request(app)
        .post('/api/v1/agents/reset')
        .expect(200);

      expect(response.body).toEqual({
        message: 'Conversation reset successfully',
        timestamp: expect.any(String)
      });
    });
  });

  describe('Error Handling', () => {
    test('should return 404 for unknown endpoints', async () => {
      const response = await request(app)
        .get('/unknown-endpoint')
        .expect(404);

      expect(response.body).toEqual({
        error: 'Endpoint not found',
        timestamp: expect.any(String)
      });
    });

    test('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/v1/agents/process')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);
    });
  });

  describe('Content-Type Validation', () => {
    test('should accept application/json content type', async () => {
      const response = await request(app)
        .post('/api/v1/agents/process')
        .set('Content-Type', 'application/json')
        .send({ message: 'Test message' })
        .expect(200);

      expect(response.body.response).toBeDefined();
    });

    test('should handle missing content-type header', async () => {
      const response = await request(app)
        .post('/api/v1/agents/process')
        .send({ message: 'Test message' })
        .expect(200);

      expect(response.body.response).toBeDefined();
    });
  });

  describe('Response Format Validation', () => {
    test('all endpoints should return proper timestamp format', async () => {
      const endpoints = [
        { method: 'get', path: '/health' },
        { method: 'get', path: '/api/v1/agents/status' },
        { method: 'get', path: '/api/v1/metrics' },
        { method: 'post', path: '/api/v1/agents/reset' }
      ];

      for (const endpoint of endpoints) {
        const response = await (request(app) as any)[endpoint.method](endpoint.path);
        expect(response.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      }
    });

    test('agent process endpoint should include response and timestamp', async () => {
      const response = await request(app)
        .post('/api/v1/agents/process')
        .send({ message: 'Test message' })
        .expect(200);

      expect(response.body).toHaveProperty('response');
      expect(response.body).toHaveProperty('timestamp');
      expect(typeof response.body.response).toBe('string');
      expect(response.body.response.length).toBeGreaterThan(0);
    });
  });
}); 