import { Router } from 'express';
import { pool } from '../db/pool';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { course_id } = req.query;
    let query = 'SELECT id, course_id, title, description, duration_minutes, order_index FROM lessons';
    let params: any[] = [];
    if (course_id) {
      query += ' WHERE course_id = $1';
      params.push(course_id);
    }
    query += ' ORDER BY order_index';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.get('/user/progress', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM lesson_progress WHERE user_id = $1', [req.user?.id]);
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.get('/:id', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const lessonRes = await pool.query('SELECT * FROM lessons WHERE id = $1', [id]);
    if (lessonRes.rows.length === 0) return res.status(404).json({ message: 'Lesson not found' });
    
    const progressRes = await pool.query('SELECT * FROM lesson_progress WHERE user_id = $1 AND lesson_id = $2', [req.user?.id, id]);
    
    const lesson = lessonRes.rows[0];
    lesson.progress = progressRes.rows[0] || null;
    
    res.json(lesson);
  } catch (err) { next(err); }
});

router.put('/:id/progress', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    const result = await pool.query(`
      INSERT INTO lesson_progress (user_id, lesson_id, status, notes, completed_at)
      VALUES ($1, $2, $3, $4, CASE WHEN $3 = 'completed' THEN NOW() ELSE NULL END)
      ON CONFLICT (user_id, lesson_id) 
      DO UPDATE SET status = $3, notes = COALESCE($4, lesson_progress.notes), completed_at = CASE WHEN $3 = 'completed' THEN NOW() ELSE lesson_progress.completed_at END, updated_at = NOW()
      RETURNING *
    `, [req.user?.id, id, status, notes]);
    
    // update user overall progress
    if (status === 'completed') {
      await pool.query('UPDATE user_progress SET completed_lessons = completed_lessons + 1 WHERE user_id = $1', [req.user?.id]);
    }

    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

export default router;
