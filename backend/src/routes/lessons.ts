import { Router } from 'express';
import { pool } from '../db/pool';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();
router.use(authenticateToken);

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const { course_id } = req.query;
    let query = `SELECT l.id, l.course_id, l.title, l.description, l.duration_minutes, l.order_index
      FROM lessons l JOIN courses c ON c.id = l.course_id WHERE (c.is_published = true OR $1 = true)`;
    let params: any[] = [req.user?.role === 'admin'];
    if (course_id) {
      query += ' AND l.course_id = $2';
      params.push(course_id);
    }
    query += ' ORDER BY l.order_index';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.get('/user/progress', async (req: AuthRequest, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM lesson_progress WHERE user_id = $1', [req.user?.id]);
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const lessonRes = await pool.query(`
      SELECT l.* FROM lessons l JOIN courses c ON c.id = l.course_id
      WHERE l.id = $1 AND (c.is_published = true OR $2 = true)
    `, [id, req.user?.role === 'admin']);
    if (lessonRes.rows.length === 0) return res.status(404).json({ message: 'Lesson not found' });
    
    const progressRes = await pool.query('SELECT * FROM lesson_progress WHERE user_id = $1 AND lesson_id = $2', [req.user?.id, id]);
    
    const lesson = lessonRes.rows[0];
    lesson.progress = progressRes.rows[0] || null;
    
    res.json(lesson);
  } catch (err) { next(err); }
});

router.put('/:id/progress', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const previous = await pool.query(
      'SELECT status FROM lesson_progress WHERE user_id = $1 AND lesson_id = $2',
      [req.user?.id, id]
    );
    
    const result = await pool.query(`
      INSERT INTO lesson_progress (user_id, lesson_id, status, notes, completed_at)
      VALUES ($1, $2, $3, $4, CASE WHEN $3 = 'completed' THEN NOW() ELSE NULL END)
      ON CONFLICT (user_id, lesson_id) 
      DO UPDATE SET status = $3, notes = COALESCE($4, lesson_progress.notes), completed_at = CASE WHEN $3 = 'completed' THEN NOW() ELSE lesson_progress.completed_at END, updated_at = NOW()
      RETURNING *
    `, [req.user?.id, id, status, notes]);
    
    // update user overall progress
    if (status === 'completed' && previous.rows[0]?.status !== 'completed') {
      await pool.query(`
        INSERT INTO user_progress (user_id, completed_lessons)
        VALUES ($1, 1)
        ON CONFLICT (user_id) DO UPDATE
        SET completed_lessons = user_progress.completed_lessons + 1, updated_at = NOW()
      `, [req.user?.id]);
    }

    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

export default router;
