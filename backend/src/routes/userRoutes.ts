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
const updateProfileSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
});

const updatePreferencesSchema = z.object({
  theme: z.string().optional(),
  language: z.string().optional(),
  notifications: z.boolean().optional(),
  timezone: z.string().optional(),
});

/**
 * @swagger
 * /api/v1/user/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT 
        id, email, name, phone, preferences, profile, 
        created_at, updated_at, last_login
       FROM users 
       WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    const user = result.rows[0];
    const profile = typeof user.profile === 'string' ? JSON.parse(user.profile) : user.profile;
    const preferences = typeof user.preferences === 'string' ? JSON.parse(user.preferences) : user.preferences;

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: profile.role || 'patient',
        department: profile.department,
        permissions: profile.permissions || ['self_access'],
        preferences,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        lastLogin: user.last_login
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PROFILE_FETCH_FAILED',
        message: 'Failed to fetch user profile'
      }
    });
  }
});

/**
 * @swagger
 * /api/v1/user/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const validatedData = updateProfileSchema.parse(req.body);

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    Object.entries(validatedData).forEach(([key, value]) => {
      if (value !== undefined) {
        updates.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_UPDATES',
          message: 'No valid updates provided'
        }
      });
    }

    updates.push(`updated_at = $${paramCount}`);
    values.push(new Date());
    values.push(userId);

    const query = `
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount + 1}
      RETURNING id, email, name, phone, preferences, profile
    `;

    const result = await pool.query(query, values);
    const user = result.rows[0];
    const profile = typeof user.profile === 'string' ? JSON.parse(user.profile) : user.profile;
    const preferences = typeof user.preferences === 'string' ? JSON.parse(user.preferences) : user.preferences;

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: profile.role || 'patient',
        department: profile.department,
        permissions: profile.permissions || ['self_access'],
        preferences
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(400).json({
      success: false,
      error: {
        code: 'PROFILE_UPDATE_FAILED',
        message: error instanceof z.ZodError ? error.errors : 'Failed to update profile'
      }
    });
  }
});

/**
 * @swagger
 * /api/v1/user/preferences:
 *   put:
 *     summary: Update user preferences
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               theme:
 *                 type: string
 *               language:
 *                 type: string
 *               notifications:
 *                 type: boolean
 *               timezone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Preferences updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.put('/preferences', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const validatedData = updatePreferencesSchema.parse(req.body);

    // Get current preferences
    const currentResult = await pool.query(
      'SELECT preferences FROM users WHERE id = $1',
      [userId]
    );

    if (currentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    const currentPreferences = typeof currentResult.rows[0].preferences === 'string' 
      ? JSON.parse(currentResult.rows[0].preferences) 
      : currentResult.rows[0].preferences || {};

    // Merge with new preferences
    const updatedPreferences = {
      ...currentPreferences,
      ...validatedData
    };

    // Update preferences
    const result = await pool.query(
      `UPDATE users 
       SET preferences = $1, updated_at = $2
       WHERE id = $3
       RETURNING id, email, name, phone, preferences, profile`,
      [JSON.stringify(updatedPreferences), new Date(), userId]
    );

    const user = result.rows[0];
    const profile = typeof user.profile === 'string' ? JSON.parse(user.profile) : user.profile;
    const preferences = typeof user.preferences === 'string' ? JSON.parse(user.preferences) : user.preferences;

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: profile.role || 'patient',
        department: profile.department,
        permissions: profile.permissions || ['self_access'],
        preferences
      }
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(400).json({
      success: false,
      error: {
        code: 'PREFERENCES_UPDATE_FAILED',
        message: error instanceof z.ZodError ? error.errors : 'Failed to update preferences'
      }
    });
  }
});

export default router; 