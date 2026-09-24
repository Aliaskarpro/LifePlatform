import { Router } from 'express';
import { pool } from '../db/pool';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

// All course routes require authentication
router.use(authenticateToken);

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const result = await pool.query(`
      SELECT c.*, l.name as level_name 
      FROM courses c 
      LEFT JOIN levels l ON c.level_id = l.id 
      WHERE c.is_published = true 
      ORDER BY c.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const courseRes = await pool.query(`
      SELECT c.*, l.name as level_name 
      FROM courses c 
      LEFT JOIN levels l ON c.level_id = l.id 
      WHERE c.id = $1
    `, [id]);
    if (courseRes.rows.length === 0) return res.status(404).json({ message: 'Course not found' });
    
    const lessonsRes = await pool.query('SELECT id, title, description, duration_minutes, order_index FROM lessons WHERE course_id = $1 ORDER BY order_index', [id]);
    const course = courseRes.rows[0];
    course.lessons = lessonsRes.rows;
    
    res.json(course);
  } catch (err) { next(err); }
});

router.post('/', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    if (req.user?.role !== 'admin' && req.user?.role !== 'teacher') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const { title, description, level_id, total_lessons, cover_image, is_published } = req.body;
    
    // For teachers, automatically set teacher_id to their own ID
    const teacher_id = req.user.role === 'teacher' ? req.user.id : req.body.teacher_id;
    
    const result = await pool.query(`
      INSERT INTO courses (title, description, level_id, teacher_id, total_lessons, cover_image, is_published)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [title, description, level_id, teacher_id, total_lessons, cover_image, is_published ?? true]);
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
});

router.put('/:id', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    if (req.user?.role !== 'admin' && req.user?.role !== 'teacher') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    const { id } = req.params;
    
    // For teachers: check if they own this course
    if (req.user.role === 'teacher') {
      const ownerCheck = await pool.query(
        'SELECT teacher_id FROM courses WHERE id = $1',
        [id]
      );
      
      if (ownerCheck.rows.length === 0) {
        return res.status(404).json({ message: 'Course not found' });
      }
      
      if (ownerCheck.rows[0].teacher_id !== req.user.id) {
        return res.status(403).json({ message: 'You can only modify your own courses' });
      }
    }
    
    const { title, description, level_id, total_lessons, cover_image, is_published } = req.body;
    const result = await pool.query(`
      UPDATE courses 
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          level_id = COALESCE($3, level_id),
          total_lessons = COALESCE($4, total_lessons),
          cover_image = COALESCE($5, cover_image),
          is_published = COALESCE($6, is_published),
          updated_at = NOW()
      WHERE id = $7
      RETURNING *
    `, [title, description, level_id, total_lessons, cover_image, is_published, id]);
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

export default router;
