import { Router } from 'express';
import { pool } from '../db/pool';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM levels ORDER BY order_index');
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (id === 'user') return next(); // Fallthrough to /user/current
    const result = await pool.query('SELECT * FROM levels WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

router.get('/user/current', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const result = await pool.query(`
      SELECT l.*, up.completed_lessons, up.total_study_time, up.current_xp 
      FROM levels l
      JOIN user_progress up ON l.id = up.level_id
      WHERE up.user_id = $1
    `, [req.user?.id]);
    res.json(result.rows[0] || null);
  } catch (err) { next(err); }
});

export default router;
