import { Router } from 'express';
import { pool } from '../db/pool';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();
router.use(authenticateToken);

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const { start_date, end_date, status, type } = req.query;
    let query = 'SELECT * FROM schedule WHERE user_id = $1';
    let params: any[] = [req.user?.id];
    let count = 2;

    if (start_date && end_date) {
      query += ` AND start_time >= $${count++} AND start_time <= $${count++}`;
      params.push(start_date, end_date);
    }
    if (status) {
      query += ` AND status = $${count++}`;
      params.push(status);
    }
    if (type) {
      query += ` AND lesson_type = $${count++}`;
      params.push(type);
    }
    
    query += ' ORDER BY start_time ASC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.get('/today', async (req: AuthRequest, res, next) => {
  try {
    const result = await pool.query(`
      SELECT * FROM schedule 
      WHERE user_id = $1 
      AND start_time >= CURRENT_DATE 
      AND start_time < CURRENT_DATE + INTERVAL '1 day'
      ORDER BY start_time ASC
    `, [req.user?.id]);
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.get('/week', async (req: AuthRequest, res, next) => {
  try {
    const result = await pool.query(`
      SELECT * FROM schedule 
      WHERE user_id = $1 
      AND start_time >= date_trunc('week', CURRENT_DATE) 
      AND start_time < date_trunc('week', CURRENT_DATE) + INTERVAL '7 days'
      ORDER BY start_time ASC
    `, [req.user?.id]);
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.get('/upcoming', async (req: AuthRequest, res, next) => {
  try {
    const result = await pool.query(`
      SELECT * FROM schedule 
      WHERE user_id = $1 
      AND start_time > NOW()
      ORDER BY start_time ASC
      LIMIT 1
    `, [req.user?.id]);
    res.json(result.rows[0] || null);
  } catch (err) { next(err); }
});

router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const { lesson_id, title, description, teacher_name, level_id, start_time, end_time, location, meeting_url, lesson_type, status, color } = req.body;
    const result = await pool.query(`
      INSERT INTO schedule (user_id, lesson_id, title, description, teacher_name, level_id, start_time, end_time, location, meeting_url, lesson_type, status, color)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [req.user?.id, lesson_id, title, description, teacher_name, level_id, start_time, end_time, location, meeting_url, lesson_type, status, color]);
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
});

router.put('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, start_time, end_time, status, color } = req.body;
    const result = await pool.query(`
      UPDATE schedule 
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          start_time = COALESCE($3, start_time),
          end_time = COALESCE($4, end_time),
          status = COALESCE($5, status),
          color = COALESCE($6, color),
          updated_at = NOW()
      WHERE id = $7 AND user_id = $8
      RETURNING *
    `, [title, description, start_time, end_time, status, color, id, req.user?.id]);
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM schedule WHERE id = $1 AND user_id = $2', [id, req.user?.id]);
    res.json({ message: 'Deleted successfully' });
  } catch (err) { next(err); }
});

export default router;
