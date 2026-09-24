import { Router } from 'express';
import { pool } from '../db/pool';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();
router.use(authenticateToken);

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const result = await pool.query(`
      SELECT up.*, l.name as level_name, l.code as level_code 
      FROM user_progress up 
      LEFT JOIN levels l ON up.level_id = l.id 
      WHERE up.user_id = $1
    `, [req.user?.id]);
    res.json(result.rows[0] || null);
  } catch (err) { next(err); }
});

router.put('/level', async (req: AuthRequest, res, next) => {
  try {
    const { level_id } = req.body;
    const result = await pool.query(`
      INSERT INTO user_progress (user_id, level_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id) 
      DO UPDATE SET level_id = $2, updated_at = NOW()
      RETURNING *
    `, [req.user?.id, level_id]);
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

export default router;
