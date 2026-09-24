import { Router } from 'express';
import { pool } from '../db/pool';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();
router.use(authenticateToken);

router.get('/profile', async (req: AuthRequest, res, next) => {
  try {
    const userRes = await pool.query('SELECT id, email, first_name, last_name, avatar_url, role, subscription_tier FROM users WHERE id = $1', [req.user?.id]);
    const progressRes = await pool.query('SELECT * FROM user_progress WHERE user_id = $1', [req.user?.id]);
    
    res.json({
      ...userRes.rows[0],
      progress: progressRes.rows[0] || null
    });
  } catch (err) { next(err); }
});

router.put('/profile', async (req: AuthRequest, res, next) => {
  try {
    const { first_name, last_name, email, avatar_url } = req.body;
    const result = await pool.query(`
      UPDATE users 
      SET first_name = COALESCE($1, first_name),
          last_name = COALESCE($2, last_name),
          email = COALESCE($3, email),
          avatar_url = COALESCE($4, avatar_url),
          updated_at = NOW()
      WHERE id = $5
      RETURNING id, email, first_name, last_name, avatar_url, role, subscription_tier
    `, [first_name, last_name, email, avatar_url, req.user?.id]);
    
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

router.get('/stats', async (req: AuthRequest, res, next) => {
  try {
    const progress = await pool.query('SELECT * FROM user_progress WHERE user_id = $1', [req.user?.id]);
    res.json(progress.rows[0] || { completed_lessons: 0, total_study_time: 0, current_xp: 0 });
  } catch (err) { next(err); }
});

export default router;
