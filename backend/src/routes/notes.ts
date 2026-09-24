import { Router } from 'express';
import { pool } from '../db/pool';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();
router.use(authenticateToken);

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const { search, category, tag } = req.query;
    let query = 'SELECT * FROM notes WHERE user_id = $1';
    let params: any[] = [req.user?.id];
    let count = 2;

    if (search) {
      query += ` AND (title ILIKE $${count} OR content ILIKE $${count})`;
      params.push(`%${search}%`);
      count++;
    }
    if (category) {
      query += ` AND category = $${count++}`;
      params.push(category);
    }
    if (tag) {
      query += ` AND $${count++} = ANY(tags)`;
      params.push(tag);
    }

    query += ' ORDER BY is_pinned DESC, updated_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const { schedule_id, title, content, category, tags, is_pinned } = req.body;
    const result = await pool.query(`
      INSERT INTO notes (user_id, schedule_id, title, content, category, tags, is_pinned)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [req.user?.id, schedule_id, title, content, category, tags || [], is_pinned || false]);
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
});

router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM notes WHERE id = $1 AND user_id = $2', [id, req.user?.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Note not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

router.put('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, category, tags, is_pinned } = req.body;
    const result = await pool.query(`
      UPDATE notes 
      SET title = COALESCE($1, title),
          content = COALESCE($2, content),
          category = COALESCE($3, category),
          tags = COALESCE($4, tags),
          is_pinned = COALESCE($5, is_pinned),
          updated_at = NOW()
      WHERE id = $6 AND user_id = $7
      RETURNING *
    `, [title, content, category, tags, is_pinned, id, req.user?.id]);
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

router.put('/:id/pin', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { is_pinned } = req.body;
    const result = await pool.query(`
      UPDATE notes SET is_pinned = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3 RETURNING *
    `, [is_pinned, id, req.user?.id]);
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM notes WHERE id = $1 AND user_id = $2', [id, req.user?.id]);
    res.json({ message: 'Deleted successfully' });
  } catch (err) { next(err); }
});

export default router;
