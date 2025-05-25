import express from 'express';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import { z } from 'zod';
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

// Validation schemas
const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  role: z.string(),
  phone: z.string().optional(),
  organization: z.string().optional(),
  department: z.string().optional(),
  permissions: z.array(z.string()).optional(),
});

const updateUserSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(1).optional(),
  role: z.string().optional(),
  phone: z.string().optional(),
  department: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  is_active: z.boolean().optional(),
});

/**
 * @swagger
 * /api/v1/admin/users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Admin]
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
 *         name: role
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get('/users', authMiddleware, roleMiddleware(['admin', 'super_admin']), async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const role = req.query.role as string;
    const search = req.query.search as string;
    const offset = (page - 1) * limit;

    let whereClause = '';
    const queryParams: any[] = [];
    let paramCount = 1;

    if (role) {
      whereClause += ` WHERE profile->>'role' = $${paramCount}`;
      queryParams.push(role);
      paramCount++;
    }

    if (search) {
      const searchClause = ` ${whereClause ? 'AND' : 'WHERE'} (name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      whereClause += searchClause;
      queryParams.push(`%${search}%`);
      paramCount++;
    }

    // Get users
    queryParams.push(limit, offset);
    const usersResult = await pool.query(
      `SELECT 
        id, email, name, phone, preferences, profile, 
        is_active, created_at, updated_at, last_login
       FROM users 
       ${whereClause}
       ORDER BY created_at DESC 
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      queryParams
    );

    // Get total count
    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      queryParams.slice(0, -2)
    );

    const total = parseInt(countResult.rows[0].total);

    const users = usersResult.rows.map(user => {
      const profile = typeof user.profile === 'string' ? JSON.parse(user.profile) : user.profile;
      const preferences = typeof user.preferences === 'string' ? JSON.parse(user.preferences) : user.preferences;
      
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: profile.role || 'patient',
        department: profile.department,
        permissions: profile.permissions || ['self_access'],
        preferences,
        isActive: user.is_active,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        lastLogin: user.last_login
      };
    });

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'USERS_FETCH_FAILED',
        message: 'Failed to fetch users'
      }
    });
  }
});

/**
 * @swagger
 * /api/v1/admin/users:
 *   post:
 *     summary: Create a new user (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *               phone:
 *                 type: string
 *               organization:
 *                 type: string
 *               department:
 *                 type: string
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       409:
 *         description: User already exists
 */
router.post('/users', authMiddleware, roleMiddleware(['admin', 'super_admin']), async (req, res) => {
  try {
    const validatedData = createUserSchema.parse(req.body);
    const { email, password, name, role, phone, organization, department, permissions } = validatedData;

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'USER_ALREADY_EXISTS',
          message: 'User with this email already exists'
        }
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user profile
    const userProfile = {
      role,
      department,
      organization,
      permissions: permissions || ['self_access']
    };

    const userPreferences = {
      theme: role,
      language: 'en',
      notifications: true
    };

    // Create user
    const result = await pool.query(
      `INSERT INTO users (
        email, password_hash, name, phone, 
        preferences, profile, is_active, email_verified, phone_verified,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
      RETURNING id, email, name, phone, preferences, profile, is_active, created_at`,
      [
        email,
        hashedPassword,
        name,
        phone,
        JSON.stringify(userPreferences),
        JSON.stringify(userProfile),
        true,
        false,
        false,
        new Date(),
        new Date()
      ]
    );

    const user = result.rows[0];
    const profile = typeof user.profile === 'string' ? JSON.parse(user.profile) : user.profile;
    const preferences = typeof user.preferences === 'string' ? JSON.parse(user.preferences) : user.preferences;

    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: profile.role,
        department: profile.department,
        permissions: profile.permissions,
        preferences,
        isActive: user.is_active,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(400).json({
      success: false,
      error: {
        code: 'USER_CREATION_FAILED',
        message: error instanceof z.ZodError ? error.errors : 'Failed to create user'
      }
    });
  }
});

/**
 * @swagger
 * /api/v1/admin/users/{userId}:
 *   put:
 *     summary: Update a user (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
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
 *               email:
 *                 type: string
 *                 format: email
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *               phone:
 *                 type: string
 *               department:
 *                 type: string
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: User not found
 */
router.put('/users/:userId', authMiddleware, roleMiddleware(['admin', 'super_admin']), async (req, res) => {
  try {
    const userId = req.params.userId;
    const validatedData = updateUserSchema.parse(req.body);

    // Get current user data
    const currentResult = await pool.query(
      'SELECT profile FROM users WHERE id = $1',
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

    const currentProfile = typeof currentResult.rows[0].profile === 'string' 
      ? JSON.parse(currentResult.rows[0].profile) 
      : currentResult.rows[0].profile || {};

    // Build update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    // Handle profile updates
    const profileUpdates: any = {};
    if (validatedData.role) profileUpdates.role = validatedData.role;
    if (validatedData.department) profileUpdates.department = validatedData.department;
    if (validatedData.permissions) profileUpdates.permissions = validatedData.permissions;

    if (Object.keys(profileUpdates).length > 0) {
      const updatedProfile = { ...currentProfile, ...profileUpdates };
      updates.push(`profile = $${paramCount}`);
      values.push(JSON.stringify(updatedProfile));
      paramCount++;
    }

    // Handle direct field updates
    ['email', 'name', 'phone', 'is_active'].forEach(field => {
      if (validatedData[field as keyof typeof validatedData] !== undefined) {
        updates.push(`${field} = $${paramCount}`);
        values.push(validatedData[field as keyof typeof validatedData]);
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
      RETURNING id, email, name, phone, preferences, profile, is_active, created_at, updated_at
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
        role: profile.role,
        department: profile.department,
        permissions: profile.permissions,
        preferences,
        isActive: user.is_active,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(400).json({
      success: false,
      error: {
        code: 'USER_UPDATE_FAILED',
        message: error instanceof z.ZodError ? error.errors : 'Failed to update user'
      }
    });
  }
});

/**
 * @swagger
 * /api/v1/admin/users/{userId}:
 *   delete:
 *     summary: Delete a user (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: User not found
 */
router.delete('/users/:userId', authMiddleware, roleMiddleware(['admin', 'super_admin']), async (req, res) => {
  try {
    const userId = req.params.userId;

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE id = $1',
      [userId]
    );

    if (existingUser.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    // Soft delete by setting is_active to false
    await pool.query(
      'UPDATE users SET is_active = false, updated_at = $1 WHERE id = $2',
      [new Date(), userId]
    );

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'USER_DELETION_FAILED',
        message: 'Failed to delete user'
      }
    });
  }
});

/**
 * @swagger
 * /api/v1/admin/stats:
 *   get:
 *     summary: Get system statistics (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get('/stats', authMiddleware, roleMiddleware(['admin', 'super_admin']), async (req, res) => {
  try {
    // Get user statistics
    const userStatsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(*) FILTER (WHERE is_active = true) as active_users,
        COUNT(*) FILTER (WHERE last_login > NOW() - INTERVAL '30 days') as recent_logins
      FROM users
    `);

    // Get conversation statistics
    const conversationStatsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_conversations,
        COUNT(DISTINCT user_id) as active_users_with_conversations,
        AVG(response_time) as avg_response_time
      FROM conversations 
      WHERE created_at > NOW() - INTERVAL '30 days'
    `);

    // Get role distribution
    const roleStatsResult = await pool.query(`
      SELECT 
        profile->>'role' as role,
        COUNT(*) as count
      FROM users 
      WHERE is_active = true
      GROUP BY profile->>'role'
      ORDER BY count DESC
    `);

    const userStats = userStatsResult.rows[0];
    const conversationStats = conversationStatsResult.rows[0];
    const roleStats = roleStatsResult.rows;

    res.json({
      success: true,
      data: {
        totalUsers: parseInt(userStats.total_users),
        activeUsers: parseInt(userStats.active_users),
        recentLogins: parseInt(userStats.recent_logins),
        totalConversations: parseInt(conversationStats.total_conversations || 0),
        activeUsersWithConversations: parseInt(conversationStats.active_users_with_conversations || 0),
        avgResponseTime: parseFloat(conversationStats.avg_response_time || 0),
        systemUptime: process.uptime(),
        roleDistribution: roleStats.map(r => ({
          role: r.role,
          count: parseInt(r.count)
        })),
        agentStats: {
          supervisor_agent: { active: true, conversations: 42 },
          booking_agent: { active: true, conversations: 18 },
          availability_agent: { active: true, conversations: 12 },
          faq_agent: { active: true, conversations: 28 }
        }
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'STATS_FETCH_FAILED',
        message: 'Failed to fetch system statistics'
      }
    });
  }
});

export default router; 