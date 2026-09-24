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
    const pageNumber = Math.max(1, Number.parseInt(page as string, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, Number.parseInt(limit as string, 10) || 20));
    const offset = (pageNumber - 1) * pageSize;
    let where = 'WHERE TRUE';
    const params: any[] = [];
    let paramCount = 1;

    if (search) {
      where += ` AND (email ILIKE $${paramCount} OR first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (role) {
      where += ` AND role = $${paramCount++}`;
      params.push(role);
    }

    if (is_active !== undefined) {
      where += ` AND is_active = $${paramCount++}`;
      params.push(is_active === 'true');
    }

    const query = `SELECT id, email, first_name, last_name, role, subscription_tier, is_active, created_at, updated_at
      FROM users ${where} ORDER BY created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    const pageParams = [...params, pageSize, offset];

    const result = await pool.query(query, pageParams);

    const countResult = await pool.query(`SELECT COUNT(*) FROM users ${where}`, params);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      users: result.rows,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
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

    const [progressResult, notesResult, scheduleResult, lessonProgressResult, lifeDataResult, notificationsResult] = await Promise.all([
      pool.query('SELECT * FROM user_progress WHERE user_id = $1', [id]),
      pool.query('SELECT * FROM notes WHERE user_id = $1 ORDER BY updated_at DESC', [id]),
      pool.query('SELECT * FROM schedule WHERE user_id = $1 ORDER BY start_time DESC', [id]),
      pool.query('SELECT * FROM lesson_progress WHERE user_id = $1 ORDER BY updated_at DESC', [id]),
      pool.query('SELECT data FROM life_data WHERE user_id = $1', [id]),
      pool.query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC', [id]),
    ]);

    res.json({
      ...userResult.rows[0],
      progress: progressResult.rows[0] || null,
      personalData: {
        lifeData: lifeDataResult.rows[0]?.data || {},
        progress: progressResult.rows[0] || null,
        notes: notesResult.rows,
        schedule: scheduleResult.rows,
        lessonProgress: lessonProgressResult.rows,
        notifications: notificationsResult.rows,
      },
      stats: {
        notesCount: notesResult.rows.length,
        scheduleCount: scheduleResult.rows.length,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Update account fields that an administrator is allowed to manage.
router.put('/users/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { email, first_name, last_name, avatar_url, role, subscription_tier, is_active } = req.body;
    if (role !== undefined && !['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Role must be user or admin' });
    }
    if (id === req.user?.id && (role === 'user' || is_active === false)) {
      return res.status(400).json({ message: 'Cannot disable or demote your own account' });
    }

    const result = await pool.query(`
      UPDATE users
      SET email = COALESCE($1, email),
          first_name = COALESCE($2, first_name),
          last_name = COALESCE($3, last_name),
          avatar_url = COALESCE($4, avatar_url),
          role = COALESCE($5, role),
          subscription_tier = COALESCE($6, subscription_tier),
          is_active = COALESCE($7, is_active),
          updated_at = NOW()
      WHERE id = $8
      RETURNING id, email, first_name, last_name, role, subscription_tier, is_active, created_at, updated_at
    `, [email, first_name, last_name, avatar_url, role, subscription_tier, is_active, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.put('/users/:id/life-data', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body?.data;
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return res.status(400).json({ message: 'A life-data object is required' });
    }
    const exists = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
    if (exists.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    const result = await pool.query(
      `INSERT INTO life_data (user_id, data, updated_at)
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (user_id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
       RETURNING data, updated_at`,
      [id, JSON.stringify(data)]
    );
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Replace a user's complete private data set in one transaction. This endpoint
// is intentionally admin-only; every inserted row is assigned to the target
// account ID rather than trusting an owner ID supplied in JSON.
router.put('/users/:id/personal-data', async (req: AuthRequest, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const data = req.body?.personal_data;
    if (!data || typeof data !== 'object' || Array.isArray(data) || !data.life_data || typeof data.life_data !== 'object') {
      return res.status(400).json({ message: 'A complete personal-data object is required' });
    }
    for (const key of ['notes', 'schedule', 'lesson_progress', 'notifications']) {
      if (!Array.isArray(data[key])) {
        return res.status(400).json({ message: `${key} must be an array` });
      }
    }

    await client.query('BEGIN');
    const exists = await client.query('SELECT id FROM users WHERE id = $1 FOR UPDATE', [id]);
    if (exists.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'User not found' });
    }

    await client.query('DELETE FROM notes WHERE user_id = $1', [id]);
    await client.query('DELETE FROM schedule WHERE user_id = $1', [id]);
    await client.query('DELETE FROM lesson_progress WHERE user_id = $1', [id]);
    await client.query('DELETE FROM notifications WHERE user_id = $1', [id]);
    await client.query(
      `INSERT INTO life_data (user_id, data, updated_at) VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (user_id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
      [id, JSON.stringify(data.life_data)]
    );

    for (const entry of data.schedule) {
      if (!entry.title || !entry.start_time || !entry.end_time) throw new Error('Each schedule entry needs title, start_time, and end_time');
      await client.query(
        `INSERT INTO schedule (id, user_id, lesson_id, title, description, teacher_name, level_id, start_time, end_time, location, meeting_url, lesson_type, status, color)
         VALUES (COALESCE($1::uuid, uuid_generate_v4()), $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [entry.id || null, id, entry.lesson_id || null, entry.title, entry.description || null, entry.teacher_name || null, entry.level_id || null, entry.start_time, entry.end_time, entry.location || null, entry.meeting_url || null, entry.lesson_type || 'lesson', entry.status || 'planned', entry.color || null]
      );
    }

    for (const note of data.notes) {
      if (!note.title) throw new Error('Each note needs a title');
      if (note.schedule_id) {
        const owned = await client.query('SELECT id FROM schedule WHERE id = $1 AND user_id = $2', [note.schedule_id, id]);
        if (owned.rows.length === 0) throw new Error('A note references a schedule entry owned by another account');
      }
      await client.query(
        `INSERT INTO notes (id, user_id, schedule_id, title, content, category, tags, is_pinned)
         VALUES (COALESCE($1::uuid, uuid_generate_v4()), $2, $3, $4, $5, $6, $7, $8)`,
        [note.id || null, id, note.schedule_id || null, note.title, note.content || '', note.category || null, Array.isArray(note.tags) ? note.tags : [], Boolean(note.is_pinned)]
      );
    }

    for (const item of data.lesson_progress) {
      if (!item.lesson_id) throw new Error('Each lesson-progress record needs a lesson_id');
      await client.query(
        `INSERT INTO lesson_progress (id, user_id, lesson_id, status, completed_at, notes)
         VALUES (COALESCE($1::uuid, uuid_generate_v4()), $2, $3, $4, $5, $6)`,
        [item.id || null, id, item.lesson_id, item.status || 'planned', item.completed_at || null, item.notes || null]
      );
    }

    for (const item of data.notifications) {
      if (!item.title) throw new Error('Each notification needs a title');
      await client.query(
        `INSERT INTO notifications (id, user_id, title, message, type, is_read, data)
         VALUES (COALESCE($1::uuid, uuid_generate_v4()), $2, $3, $4, $5, $6, $7::jsonb)`,
        [item.id || null, id, item.title, item.message || null, item.type || null, Boolean(item.is_read), JSON.stringify(item.data || {})]
      );
    }

    if (data.progress) {
      await client.query(
        `INSERT INTO user_progress (user_id, level_id, completed_lessons, total_study_time, current_xp)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (user_id) DO UPDATE SET level_id = EXCLUDED.level_id,
           completed_lessons = EXCLUDED.completed_lessons, total_study_time = EXCLUDED.total_study_time,
           current_xp = EXCLUDED.current_xp, updated_at = NOW()`,
        [id, data.progress.level_id || null, data.progress.completed_lessons || 0, data.progress.total_study_time || 0, data.progress.current_xp || 0]
      );
    } else {
      await client.query('DELETE FROM user_progress WHERE user_id = $1', [id]);
    }

    await client.query('COMMIT');
    res.json({ message: 'Personal data updated' });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
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

// Create a new user account with an optional admin role.
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
    `, [email, hash, first_name, last_name, role === 'admin' ? 'admin' : 'user']);

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
