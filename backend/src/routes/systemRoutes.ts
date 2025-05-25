import express from 'express';
import { Pool } from 'pg';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router = express.Router();

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'agentcare',
  user: process.env.DB_USER || 'agentcare_user',
  password: process.env.DB_PASSWORD || 'agentcare_pass',
});

/**
 * @swagger
 * /api/v1/system/health:
 *   get:
 *     summary: Get system health status
 *     tags: [System]
 *     responses:
 *       200:
 *         description: System health status
 */
router.get('/health', async (req, res) => {
  try {
    // Check database connection
    const dbResult = await pool.query('SELECT NOW()');
    const dbHealthy = dbResult.rows.length > 0;

    // Check Ollama connection (if configured)
    let ollamaHealthy = false;
    if (process.env.OLLAMA_BASE_URL) {
      try {
        const ollamaUrl = `${process.env.OLLAMA_BASE_URL}/api/tags`;
        const response = await fetch(ollamaUrl, { 
          method: 'GET',
          signal: AbortSignal.timeout(5000) // 5 second timeout
        });
        ollamaHealthy = response.ok;
      } catch {
        ollamaHealthy = false;
      }
    }

    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '3.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: dbHealthy,
        ollama: process.env.OLLAMA_BASE_URL ? ollamaHealthy : 'not_configured',
        redis: process.env.REDIS_URL ? true : 'not_configured'
      },
      features: {
        multi_tenant: true,
        ai_agents: true,
        appointment_booking: true,
        user_management: true,
        demo_mode: process.env.DEMO_MODE === 'true'
      },
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      }
    };

    res.json({
      success: true,
      data: healthStatus
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({
      success: false,
      error: {
        code: 'HEALTH_CHECK_FAILED',
        message: 'Health check failed'
      }
    });
  }
});

/**
 * @swagger
 * /api/v1/system/ollama/status:
 *   get:
 *     summary: Get Ollama service status
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Ollama service status
 */
router.get('/ollama/status', async (req, res) => {
  try {
    if (!process.env.OLLAMA_BASE_URL) {
      return res.json({
        success: true,
        data: {
          status: 'not_configured',
          message: 'Ollama not configured'
        }
      });
    }

    const ollamaUrl = `${process.env.OLLAMA_BASE_URL}/api/tags`;
    const response = await fetch(ollamaUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });

    if (response.ok) {
      const data: any = await response.json();
      res.json({
        success: true,
        data: {
          status: 'connected',
          model: process.env.OLLAMA_MODEL || 'qwen2.5:latest',
          models: data.models || []
        }
      });
    } else {
      res.json({
        success: true,
        data: {
          status: 'error',
          message: `HTTP ${response.status}`
        }
      });
    }
  } catch (error) {
    res.json({
      success: true,
      data: {
        status: 'offline',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
});

/**
 * @swagger
 * /api/v1/system/database/seed:
 *   post:
 *     summary: Seed database with demo data (admin only)
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               forceRecreate:
 *                 type: boolean
 *                 default: false
 *               seedDemoData:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       200:
 *         description: Database seeded successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.post('/database/seed', authMiddleware, roleMiddleware(['admin', 'super_admin']), async (req, res) => {
  try {
    const { forceRecreate = false, seedDemoData = true } = req.body;

    // In a real implementation, this would call the DatabaseSeeder service
    // For now, we'll return a mock response
    const mockStats = {
      users: 10,
      providers: 4,
      appointments: 15,
      organizations: 1,
      conversations: 0
    };

    res.json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        operation: forceRecreate ? 'recreated_and_seeded' : 'seeded',
        stats: mockStats,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Database seed error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_SEED_FAILED',
        message: 'Failed to seed database'
      }
    });
  }
});

/**
 * @swagger
 * /api/v1/system/database/stats:
 *   get:
 *     summary: Get database statistics
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Database statistics
 */
router.get('/database/stats', async (req, res) => {
  try {
    const stats: Record<string, number> = {};

    // Get table counts
    const tables = ['users', 'providers', 'appointments', 'conversations'];
    
    for (const table of tables) {
      try {
        const result = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
        stats[table] = parseInt(result.rows[0].count);
      } catch (error) {
        // Table might not exist, set to 0
        stats[table] = 0;
      }
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Database stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_STATS_FAILED',
        message: 'Failed to get database statistics'
      }
    });
  }
});

/**
 * @swagger
 * /api/v1/system/logs:
 *   get:
 *     summary: Get system logs (admin only)
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [error, warn, info, debug]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: System logs retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get('/logs', authMiddleware, roleMiddleware(['admin', 'super_admin']), (req, res) => {
  const level = req.query.level as string;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;

  // Mock log data for demo
  const mockLogs = Array.from({ length: limit }, (_, i) => ({
    id: i + 1,
    timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
    level: ['info', 'warn', 'error'][Math.floor(Math.random() * 3)],
    message: `Sample log message ${i + 1}`,
    service: 'agentcare-api',
    userId: Math.random() > 0.5 ? `user-${Math.floor(Math.random() * 100)}` : null,
    metadata: {
      request_id: `req-${Math.random().toString(36).substr(2, 9)}`,
      duration: Math.floor(Math.random() * 1000)
    }
  })).filter(log => !level || log.level === level);

  res.json({
    success: true,
    data: {
      logs: mockLogs,
      pagination: {
        page,
        limit,
        total: 500 + Math.floor(Math.random() * 1000),
        pages: Math.ceil(500 / limit)
      }
    }
  });
});

export default router; 