import express from 'express';
import { Pool } from 'pg';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'agentcare',
  user: process.env.DB_USER || 'agentcare_user',
  password: process.env.DB_PASSWORD || 'agentcare_pass',
});

// Validation schemas
const processMessageSchema = z.object({
  message: z.string().min(1),
  conversationId: z.string().optional(),
});

// Mock AI responses for demo
const generateDemoResponse = (message: string): {
  response: string;
  intent: string;
  confidence: number;
  agent: string;
  responseTime: number;
} => {
  const lowerMessage = message.toLowerCase();
  
  // Appointment booking intent
  if (lowerMessage.includes('appointment') || lowerMessage.includes('book') || lowerMessage.includes('schedule')) {
    return {
      response: "I can help you schedule an appointment. What type of appointment would you like to book? We have available slots with Dr. Johnson (Cardiology), Dr. Chen (Neurology), Jennifer Wilson NP (Primary Care), and David Martinez PA (Orthopedics). What works best for you?",
      intent: 'appointment_booking',
      confidence: 0.92,
      agent: 'booking_agent',
      responseTime: 850
    };
  }
  
  // Health information intent
  if (lowerMessage.includes('symptoms') || lowerMessage.includes('hypertension') || lowerMessage.includes('blood pressure')) {
    return {
      response: "Hypertension symptoms can include headaches, shortness of breath, dizziness, chest pain, and visual changes. However, many people with high blood pressure have no symptoms at all. It's important to have regular check-ups with your healthcare provider. Would you like me to help you schedule an appointment?",
      intent: 'health_information',
      confidence: 0.88,
      agent: 'faq_agent',
      responseTime: 920
    };
  }
  
  // Provider information intent
  if (lowerMessage.includes('doctor') || lowerMessage.includes('provider') || lowerMessage.includes('available')) {
    return {
      response: "Our available providers include: Dr. Sarah Johnson (Cardiology), Dr. Michael Chen (Neurology), Jennifer Wilson NP (Primary Care), and David Martinez PA (Orthopedics). Each has different specialties and availability. Would you like to know more about any specific provider or schedule an appointment?",
      intent: 'provider_information',
      confidence: 0.85,
      agent: 'availability_agent',
      responseTime: 780
    };
  }
  
  // Office hours intent
  if (lowerMessage.includes('hours') || lowerMessage.includes('open') || lowerMessage.includes('time')) {
    return {
      response: "Our office hours are Monday-Friday 8:00 AM to 5:00 PM, with some providers offering weekend hours. Dr. Johnson and Dr. Chen are available weekdays, Jennifer Wilson NP has Saturday morning hours, and urgent appointments can sometimes be accommodated. Would you like to check availability for a specific time?",
      intent: 'office_hours',
      confidence: 0.90,
      agent: 'faq_agent',
      responseTime: 650
    };
  }
  
  // Default response
  return {
    response: "Thank you for your message. I'm here to help with appointment scheduling, answer health questions, and provide information about our providers and services. How can I assist you today?",
    intent: 'general_inquiry',
    confidence: 0.75,
    agent: 'supervisor_agent',
    responseTime: 600
  };
};

/**
 * @swagger
 * /api/v1/agents/process:
 *   post:
 *     summary: Process a message through the AI agent system
 *     tags: [AI Agents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 minLength: 1
 *               conversationId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message processed successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.post('/process', authMiddleware, async (req, res) => {
  try {
    const validatedData = processMessageSchema.parse(req.body);
    const { message, conversationId } = validatedData;
    const userId = req.user.id;

    const startTime = Date.now();

    // Generate response (in real implementation, this would call Ollama)
    const aiResponse = generateDemoResponse(message);

    // Store conversation in database
    try {
      await pool.query(
        `INSERT INTO conversations (
          user_id, message, response, intent, confidence, agent, response_time, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          userId,
          message,
          aiResponse.response,
          aiResponse.intent,
          aiResponse.confidence,
          aiResponse.agent,
          aiResponse.responseTime,
          new Date()
        ]
      );
    } catch (dbError) {
      console.warn('Failed to store conversation:', dbError);
      // Continue without failing the request
    }

    res.json({
      success: true,
      data: aiResponse
    });
  } catch (error) {
    console.error('Process message error:', error);
    res.status(400).json({
      success: false,
      error: {
        code: 'MESSAGE_PROCESSING_FAILED',
        message: error instanceof z.ZodError ? error.errors : 'Failed to process message'
      }
    });
  }
});

/**
 * @swagger
 * /api/v1/agents/status:
 *   get:
 *     summary: Get AI agent system status
 *     tags: [AI Agents]
 *     responses:
 *       200:
 *         description: Agent status retrieved successfully
 */
router.get('/status', (req, res) => {
  // Mock status for demo
  const status = {
    supervisor: { 
      active: true, 
      status: process.env.NODE_ENV === 'production' ? 'production' : 'demo_mode',
      uptime: process.uptime() 
    },
    services: {
      booking_agent: true,
      availability_agent: true,
      faq_agent: true,
      ollama_connection: process.env.OLLAMA_BASE_URL ? true : false
    },
    metrics: {
      total_conversations: 42 + Math.floor(Math.random() * 100),
      success_rate: 0.95,
      avg_response_time: 850,
      active_sessions: Math.floor(Math.random() * 10) + 1
    },
    health: {
      database: true,
      redis: process.env.REDIS_URL ? true : false,
      ollama: process.env.OLLAMA_BASE_URL ? true : false
    }
  };

  res.json({
    success: true,
    data: status
  });
});

/**
 * @swagger
 * /api/v1/conversation/reset:
 *   post:
 *     summary: Reset conversation context
 *     tags: [AI Agents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conversation reset successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/conversation/reset', authMiddleware, (req, res) => {
  // In a real implementation, this would clear conversation context
  res.json({
    success: true,
    message: 'Conversation context reset successfully'
  });
});

/**
 * @swagger
 * /api/v1/agents/conversations:
 *   get:
 *     summary: Get user conversation history
 *     tags: [AI Agents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Conversations retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/conversations', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    // Get conversations
    const conversationsResult = await pool.query(
      `SELECT 
        id, message, response, intent, confidence, agent, response_time, created_at
       FROM conversations 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    // Get total count
    const countResult = await pool.query(
      'SELECT COUNT(*) as total FROM conversations WHERE user_id = $1',
      [userId]
    );

    const total = parseInt(countResult.rows[0].total);

    res.json({
      success: true,
      data: {
        conversations: conversationsResult.rows,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CONVERSATIONS_FETCH_FAILED',
        message: 'Failed to fetch conversations'
      }
    });
  }
});

export default router; 