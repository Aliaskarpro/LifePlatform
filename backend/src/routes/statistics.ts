import { Router } from 'express';
import { pool } from '../db/pool';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();
router.use(authenticateToken);

// GET /api/statistics - Full statistics
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.id;

    // Overall lesson progress counts
    const lessonStatsRes = await pool.query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'missed') as missed,
        COUNT(*) FILTER (WHERE status = 'planned') as planned,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress
       FROM lesson_progress WHERE user_id = $1`,
      [userId]
    );

    // Schedule stats
    const scheduleStatsRes = await pool.query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'missed') as missed,
        COUNT(*) FILTER (WHERE status = 'planned') as planned
       FROM schedule WHERE user_id = $1`,
      [userId]
    );

    // User progress (level, XP)
    const progressRes = await pool.query(
      `SELECT up.*, l.name as level_name, l.code as level_code, l.order_index,
              l2.name as next_level_name, l2.min_lessons_required as next_level_required
       FROM user_progress up
       JOIN levels l ON l.id = up.level_id
       LEFT JOIN levels l2 ON l2.order_index = l.order_index + 1
       WHERE up.user_id = $1`,
      [userId]
    );

    // Weekly data (last 8 weeks)
    const weeklyRes = await pool.query(
      `SELECT 
        TO_CHAR(DATE_TRUNC('week', s.start_time), 'Mon DD') as week,
        TO_CHAR(DATE_TRUNC('week', s.start_time), 'YYYY-MM-DD') as week_start,
        COUNT(*) FILTER (WHERE s.status = 'completed') as completed,
        COUNT(*) FILTER (WHERE s.status = 'missed') as missed,
        COUNT(*) FILTER (WHERE s.status = 'planned') as planned
       FROM schedule s
       WHERE s.user_id = $1 
         AND s.start_time >= NOW() - INTERVAL '8 weeks'
       GROUP BY DATE_TRUNC('week', s.start_time)
       ORDER BY week_start ASC`,
      [userId]
    );

    // Monthly data (last 6 months)
    const monthlyRes = await pool.query(
      `SELECT 
        TO_CHAR(DATE_TRUNC('month', s.start_time), 'Mon YYYY') as month,
        TO_CHAR(DATE_TRUNC('month', s.start_time), 'YYYY-MM-DD') as month_start,
        COUNT(*) FILTER (WHERE s.status = 'completed') as completed,
        COUNT(*) FILTER (WHERE s.status = 'missed') as missed,
        COUNT(*) FILTER (WHERE s.status = 'planned') as planned
       FROM schedule s
       WHERE s.user_id = $1 
         AND s.start_time >= NOW() - INTERVAL '6 months'
       GROUP BY DATE_TRUNC('month', s.start_time)
       ORDER BY month_start ASC`,
      [userId]
    );

    const lessonStats = lessonStatsRes.rows[0];
    const scheduleStats = scheduleStatsRes.rows[0];
    const progress = progressRes.rows[0];

    const totalCompleted = parseInt(scheduleStats.completed) + parseInt(lessonStats.completed);
    const totalAll = parseInt(scheduleStats.total);
    const completionRate = totalAll > 0 ? Math.round((parseInt(scheduleStats.completed) / totalAll) * 100) : 0;

    res.json({
      totalLessons: parseInt(scheduleStats.total),
      completedLessons: parseInt(scheduleStats.completed),
      missedLessons: parseInt(scheduleStats.missed),
      plannedLessons: parseInt(scheduleStats.planned),
      completionRate,
      totalStudyTime: progress?.total_study_time || 0,
      currentXp: progress?.current_xp || 0,
      levelName: progress?.level_name || 'Beginner',
      levelCode: progress?.level_code || 'A1',
      nextLevelName: progress?.next_level_name || null,
      nextLevelRequired: parseInt(progress?.next_level_required || '0'),
      weeklyData: weeklyRes.rows.map(r => ({
        week: r.week,
        completed: parseInt(r.completed),
        missed: parseInt(r.missed),
        planned: parseInt(r.planned),
      })),
      monthlyData: monthlyRes.rows.map(r => ({
        month: r.month,
        completed: parseInt(r.completed),
        missed: parseInt(r.missed),
        planned: parseInt(r.planned),
      })),
    });
  } catch (err) { next(err); }
});

// GET /api/statistics/weekly
router.get('/weekly', async (req: AuthRequest, res, next) => {
  try {
    const result = await pool.query(
      `SELECT 
        TO_CHAR(DATE_TRUNC('week', s.start_time), 'Mon DD') as week,
        COUNT(*) FILTER (WHERE s.status = 'completed') as completed,
        COUNT(*) FILTER (WHERE s.status = 'missed') as missed,
        COUNT(*) FILTER (WHERE s.status = 'planned') as planned
       FROM schedule s
       WHERE s.user_id = $1 AND s.start_time >= NOW() - INTERVAL '12 weeks'
       GROUP BY DATE_TRUNC('week', s.start_time)
       ORDER BY DATE_TRUNC('week', s.start_time) ASC`,
      [req.user?.id]
    );
    res.json(result.rows.map(r => ({
      week: r.week,
      completed: parseInt(r.completed),
      missed: parseInt(r.missed),
      planned: parseInt(r.planned),
    })));
  } catch (err) { next(err); }
});

// GET /api/statistics/monthly
router.get('/monthly', async (req: AuthRequest, res, next) => {
  try {
    const result = await pool.query(
      `SELECT 
        TO_CHAR(DATE_TRUNC('month', s.start_time), 'Mon YYYY') as month,
        COUNT(*) FILTER (WHERE s.status = 'completed') as completed,
        COUNT(*) FILTER (WHERE s.status = 'missed') as missed,
        COUNT(*) FILTER (WHERE s.status = 'planned') as planned
       FROM schedule s
       WHERE s.user_id = $1 AND s.start_time >= NOW() - INTERVAL '12 months'
       GROUP BY DATE_TRUNC('month', s.start_time)
       ORDER BY DATE_TRUNC('month', s.start_time) ASC`,
      [req.user?.id]
    );
    res.json(result.rows.map(r => ({
      month: r.month,
      completed: parseInt(r.completed),
      missed: parseInt(r.missed),
      planned: parseInt(r.planned),
    })));
  } catch (err) { next(err); }
});

export default router;
