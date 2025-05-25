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
const createAppointmentSchema = z.object({
  patientId: z.string().uuid(),
  providerId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  type: z.string(),
  notes: z.string().optional(),
});

const updateAppointmentSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  type: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']).optional(),
});

// Mock appointment data for demo
const generateMockAppointments = (count: number, filters: any = {}) => {
  const types = ['Consultation', 'Follow-up', 'Check-up', 'Procedure', 'Emergency'];
  const statuses = ['scheduled', 'confirmed', 'completed', 'cancelled'];
  
  return Array.from({ length: count }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + Math.floor(Math.random() * 30) - 15);
    
    return {
      id: `apt-${i + 1}`,
      patientId: `patient-${Math.floor(Math.random() * 10) + 1}`,
      patientName: `Patient ${Math.floor(Math.random() * 100) + 1}`,
      providerId: `provider-${Math.floor(Math.random() * 4) + 1}`,
      providerName: ['Dr. Sarah Johnson', 'Dr. Michael Chen', 'Jennifer Wilson NP', 'David Martinez PA'][Math.floor(Math.random() * 4)],
      date: date.toISOString().split('T')[0],
      time: `${Math.floor(Math.random() * 8) + 9}:${Math.random() > 0.5 ? '00' : '30'}`,
      type: types[Math.floor(Math.random() * types.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      notes: Math.random() > 0.5 ? `Notes for appointment ${i + 1}` : null,
      duration: 30,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    };
  }).filter(apt => {
    if (filters.status && apt.status !== filters.status) return false;
    if (filters.providerId && apt.providerId !== filters.providerId) return false;
    if (filters.patientId && apt.patientId !== filters.patientId) return false;
    if (filters.date && apt.date !== filters.date) return false;
    return true;
  });
};

/**
 * @swagger
 * /api/v1/appointments:
 *   get:
 *     summary: Get appointments
 *     tags: [Appointments]
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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [scheduled, confirmed, in_progress, completed, cancelled, no_show]
 *       - in: query
 *         name: providerId
 *         schema:
 *           type: string
 *       - in: query
 *         name: patientId
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Appointments retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    const providerId = req.query.providerId as string;
    const patientId = req.query.patientId as string;
    const date = req.query.date as string;

    const filters = { status, providerId, patientId, date };
    
    // For demo, generate mock appointments
    const allAppointments = generateMockAppointments(50, filters);
    const total = allAppointments.length;
    const offset = (page - 1) * limit;
    const appointments = allAppointments.slice(offset, offset + limit);

    res.json({
      success: true,
      data: {
        appointments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'APPOINTMENTS_FETCH_FAILED',
        message: 'Failed to fetch appointments'
      }
    });
  }
});

/**
 * @swagger
 * /api/v1/appointments:
 *   post:
 *     summary: Create a new appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *               - providerId
 *               - date
 *               - time
 *               - type
 *             properties:
 *               patientId:
 *                 type: string
 *                 format: uuid
 *               providerId:
 *                 type: string
 *                 format: uuid
 *               date:
 *                 type: string
 *                 format: date
 *               time:
 *                 type: string
 *                 pattern: '^\\d{2}:\\d{2}$'
 *               type:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Appointment created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const validatedData = createAppointmentSchema.parse(req.body);
    const { patientId, providerId, date, time, type, notes } = validatedData;

    // Mock appointment creation
    const newAppointment = {
      id: `apt-${Date.now()}`,
      patientId,
      patientName: `Patient Name`, // In real app, fetch from database
      providerId,
      providerName: 'Provider Name', // In real app, fetch from database
      date,
      time,
      type,
      status: 'scheduled',
      notes: notes || null,
      duration: 30,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    res.status(201).json({
      success: true,
      data: newAppointment
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(400).json({
      success: false,
      error: {
        code: 'APPOINTMENT_CREATION_FAILED',
        message: error instanceof z.ZodError ? error.errors : 'Failed to create appointment'
      }
    });
  }
});

/**
 * @swagger
 * /api/v1/appointments/{appointmentId}:
 *   get:
 *     summary: Get appointment by ID
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Appointment retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Appointment not found
 */
router.get('/:appointmentId', authMiddleware, async (req, res) => {
  try {
    const appointmentId = req.params.appointmentId;

    // Mock appointment data
    const appointment = {
      id: appointmentId,
      patientId: 'patient-1',
      patientName: 'John Smith',
      patientPhone: '(555) 123-4567',
      patientEmail: 'john.smith@email.com',
      providerId: 'provider-1',
      providerName: 'Dr. Sarah Johnson',
      providerSpecialty: 'Cardiology',
      date: '2024-01-20',
      time: '10:00',
      type: 'Follow-up',
      status: 'scheduled',
      notes: 'Follow-up for hypertension management',
      duration: 30,
      location: 'Room 205',
      insuranceInfo: {
        provider: 'Blue Cross Blue Shield',
        policyNumber: 'BC123456789'
      },
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    };

    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'APPOINTMENT_FETCH_FAILED',
        message: 'Failed to fetch appointment'
      }
    });
  }
});

/**
 * @swagger
 * /api/v1/appointments/{appointmentId}:
 *   put:
 *     summary: Update an appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               time:
 *                 type: string
 *                 pattern: '^\\d{2}:\\d{2}$'
 *               type:
 *                 type: string
 *               notes:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [scheduled, confirmed, in_progress, completed, cancelled, no_show]
 *     responses:
 *       200:
 *         description: Appointment updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Appointment not found
 */
router.put('/:appointmentId', authMiddleware, async (req, res) => {
  try {
    const appointmentId = req.params.appointmentId;
    const validatedData = updateAppointmentSchema.parse(req.body);

    // Mock appointment update
    const updatedAppointment = {
      id: appointmentId,
      patientId: 'patient-1',
      patientName: 'John Smith',
      providerId: 'provider-1',
      providerName: 'Dr. Sarah Johnson',
      ...validatedData,
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: updatedAppointment
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(400).json({
      success: false,
      error: {
        code: 'APPOINTMENT_UPDATE_FAILED',
        message: error instanceof z.ZodError ? error.errors : 'Failed to update appointment'
      }
    });
  }
});

/**
 * @swagger
 * /api/v1/appointments/{appointmentId}/cancel:
 *   post:
 *     summary: Cancel an appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Appointment cancelled successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Appointment not found
 */
router.post('/:appointmentId/cancel', authMiddleware, async (req, res) => {
  try {
    const appointmentId = req.params.appointmentId;
    const { reason } = req.body;

    // Mock appointment cancellation
    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: {
        appointmentId,
        status: 'cancelled',
        reason: reason || 'No reason provided',
        cancelledAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'APPOINTMENT_CANCELLATION_FAILED',
        message: 'Failed to cancel appointment'
      }
    });
  }
});

export default router; 