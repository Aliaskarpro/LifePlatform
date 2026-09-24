import { Router } from 'express';
import { pool } from '../db/pool';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types';
import bcrypt from 'bcryptjs';

const router = Router();

// Admin-only middleware
const requireAdmin = (req: AuthRequest, res: any, next: any) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Apply authentication and admin check to all routes
router.use(authenticateToken);
router.use(requireAdmin);

// ==================== USER MANAGEMENT ====================

// Get all users with pagination and filters
router.get('/users', async (req: AuthRequest, res, next) => {
  try {
    const { page = '1', limit = '20', search, role, is_active } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    let query = `
      SELECT id, email, first_name, last_name, role, subscription_tier, is_active, created_at, updated_at
      FROM users
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (search) {
      query += ` AND (email ILIKE $${paramCount} OR first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (role) {
      query += ` AND role = $${paramCount++}`;
      params.push(role);
    }

    if (is_active !== undefined) {
      query += ` AND is_active = $${paramCount++}`;
      params.push(is_active === 'true');
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(parseInt(limit as string), offset);

    const result = await pool.query(query, params);

    // Get total count
    const countResult = await pool.query('SELECT COUNT(*) FROM users');
    const total = parseInt(countResult.rows[0].count);

    res.json({
      users: result.rows,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (err) {
    next(err);
  }
});

// Get single user details with stats
router.get('/users/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const userResult = await pool.query(`
      SELECT id, email, first_name, last_name, avatar_url, role, subscription_tier, is_active, created_at, updated_at
      FROM users
      WHERE id = $1
    `, [id]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user progress
    const progressResult = await pool.query(`
      SELECT * FROM user_progress WHERE user_id = $1
    `, [id]);

    // Get user notes count
    const notesResult = await pool.query(`
      SELECT COUNT(*) as count FROM notes WHERE user_id = $1
    `, [id]);

    // Get user schedule count
    const scheduleResult = await pool.query(`
      SELECT COUNT(*) as count FROM schedule WHERE user_id = $1
    `, [id]);

    res.json({
      ...userResult.rows[0],
      progress: progressResult.rows[0] || null,
      stats: {
        notesCount: parseInt(notesResult.rows[0].count),
        scheduleCount: parseInt(scheduleResult.rows[0].count),
      },
    });
  } catch (err) {
    next(err);
  }
});

// Update user (role, status, subscription)
router.put('/users/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { role, subscription_tier, is_active } = req.body;

    const result = await pool.query(`
      UPDATE users
      SET role = COALESCE($1, role),
          subscription_tier = COALESCE($2, subscription_tier),
          is_active = COALESCE($3, is_active),
          updated_at = NOW()
      WHERE id = $4
      RETURNING id, email, first_name, last_name, role, subscription_tier, is_active, created_at, updated_at
    `, [role, subscription_tier, is_active, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Delete user
router.delete('/users/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (id === req.user?.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// Create new user (admin can create teachers/students)
router.post('/users', async (req: AuthRequest, res, next) => {
  try {
    const { email, password, first_name, last_name, role } = req.body;

    // Check if email already exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hash = await bcrypt.hash(password, Number(process.env.BCRYPT_ROUNDS) || 12);

    const result = await pool.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, first_name, last_name, role, created_at
    `, [email, hash, first_name, last_name, role || 'student']);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// ==================== COURSE MANAGEMENT ====================

// Get all courses (including unpublished)
router.get('/courses', async (req: AuthRequest, res, next) => {
  try {
    const { page = '1', limit = '20', search, is_published } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    let query = `
      SELECT c.*, l.name as level_name, 
             u.first_name || ' ' || u.last_name as teacher_name,
             (SELECT COUNT(*) FROM lessons WHERE course_id = c.id) as lessons_count
      FROM courses c
      LEFT JOIN levels l ON c.level_id = l.id
      LEFT JOIN users u ON c.teacher_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (search) {
      query += ` AND (c.title ILIKE $${paramCount} OR c.description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (is_published !== undefined) {
      query += ` AND c.is_published = $${paramCount++}`;
      params.push(is_published === 'true');
    }

    query += ` ORDER BY c.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(parseInt(limit as string), offset);

    const result = await pool.query(query, params);

    const countResult = await pool.query('SELECT COUNT(*) FROM courses');
    const total = parseInt(countResult.rows[0].count);

    res.json({
      courses: result.rows,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (err) {
    next(err);
  }
});

// Publish/unpublish course
router.patch('/courses/:id/publish', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { is_published } = req.body;

    const result = await pool.query(`
      UPDATE courses
      SET is_published = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [is_published, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Delete course
router.delete('/courses/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM courses WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// ==================== SYSTEM STATISTICS ====================

router.get('/stats/overview', async (req: AuthRequest, res, next) => {
  try {
    const usersCount = await pool.query('SELECT COUNT(*) FROM users');
    const coursesCount = await pool.query('SELECT COUNT(*) FROM courses');
    const lessonsCount = await pool.query('SELECT COUNT(*) FROM lessons');
    const activeUsersCount = await pool.query('SELECT COUNT(*) FROM users WHERE is_active = true');

    // Users by role
    const usersByRole = await pool.query(`
      SELECT role, COUNT(*) as count
      FROM users
      GROUP BY role
    `);

    // Recent registrations (last 30 days)
    const recentRegistrations = await pool.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM users
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    // Course statistics
    const courseStats = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE is_published = true) as published,
        COUNT(*) FILTER (WHERE is_published = false) as unpublished
      FROM courses
    `);

    res.json({
      totals: {
        users: parseInt(usersCount.rows[0].count),
        courses: parseInt(coursesCount.rows[0].count),
        lessons: parseInt(lessonsCount.rows[0].count),
        activeUsers: parseInt(activeUsersCount.rows[0].count),
      },
      usersByRole: usersByRole.rows,
      recentRegistrations: recentRegistrations.rows,
      courseStats: courseStats.rows[0],
    });
  } catch (err) {
    next(err);
  }
});

// ==================== LEVELS MANAGEMENT ====================

// Create level
router.post('/levels', async (req: AuthRequest, res, next) => {
  try {
    const { name, code, description, order_index, min_lessons_required } = req.body;

    const result = await pool.query(`
      INSERT INTO levels (name, code, description, order_index, min_lessons_required)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [name, code, description, order_index, min_lessons_required || 0]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Update level
router.put('/levels/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { name, code, description, order_index, min_lessons_required } = req.body;

    const result = await pool.query(`
      UPDATE levels
      SET name = COALESCE($1, name),
          code = COALESCE($2, code),
          description = COALESCE($3, description),
          order_index = COALESCE($4, order_index),
          min_lessons_required = COALESCE($5, min_lessons_required)
      WHERE id = $6
      RETURNING *
    `, [name, code, description, order_index, min_lessons_required, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Level not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Delete level
router.delete('/levels/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM levels WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Level not found' });
    }

    res.json({ message: 'Level deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
