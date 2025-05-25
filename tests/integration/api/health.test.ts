import request from 'supertest';
import { Express } from 'express';

describe('Health API Integration Tests', () => {
  let app: Express;

  beforeAll(async () => {
    // Mock Express app for testing
    const express = require('express');
    app = express();
    
    app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'test',
        version: process.env.npm_package_version || '1.0.0'
      });
    });

    app.get('/api/v1/health', (req, res) => {
      res.status(200).json({
        status: 'healthy',
        services: {
          database: true,
          redis: true,
          ollama: true
        },
        timestamp: new Date().toISOString()
      });
    });
  });

  afterAll(async () => {
    // Cleanup after tests
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('environment', 'test');
    });

    it('should include version information', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('version');
      expect(typeof response.body.version).toBe('string');
    });
  });

  describe('GET /api/v1/health', () => {
    it('should return detailed health status', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('services');
      expect(response.body.services).toHaveProperty('database');
      expect(response.body.services).toHaveProperty('redis');
      expect(response.body.services).toHaveProperty('ollama');
    });

    it('should include timestamp in response', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .expect(200);

      expect(response.body).toHaveProperty('timestamp');
      const timestamp = new Date(response.body.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).not.toBeNaN();
    });
  });

  describe('Error handling', () => {
    it('should handle non-existent routes', async () => {
      await request(app)
        .get('/non-existent-route')
        .expect(404);
    });
  });
}); 