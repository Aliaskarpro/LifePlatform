import { Router } from 'express';
import { pool } from '../db/pool';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();
router.use(authenticateToken);

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const result = await pool.query(
      'SELECT data, updated_at FROM life_data WHERE user_id = $1',
      [req.user!.id]
    );
    res.json(result.rows[0]?.data || {});
  } catch (error) {
    next(error);
  }
});

// The client sends the complete personal dashboard document. The owner ID is
// always taken from the verified session, never from the request body.
router.put('/', async (req: AuthRequest, res, next) => {
  try {
    const data = req.body?.data;
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return res.status(400).json({ message: 'A life-data object is required' });
    }

    const result = await pool.query(
      `INSERT INTO life_data (user_id, data, updated_at)
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (user_id)
       DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
       RETURNING data, updated_at`,
      [req.user!.id, JSON.stringify(data)]
    );
    res.json(result.rows[0].data);
  } catch (error) {
    next(error);
  }
});

router.delete('/', async (req: AuthRequest, res, next) => {
  try {
    await pool.query('DELETE FROM life_data WHERE user_id = $1', [req.user!.id]);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
