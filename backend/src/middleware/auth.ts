import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types';
import { pool } from '../db/pool';

export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('CRITICAL: JWT_SECRET environment variable is not set');
    res.status(500).json({ message: 'Server configuration error' });
    return;
  }

  try {
    const claims = jwt.verify(token, secret) as jwt.JwtPayload;
    if (!claims.id || typeof claims.id !== 'string') {
      res.status(401).json({ message: 'Invalid or expired token' });
      return;
    }

    // Roles and account status are read from the database on every request so
    // a demoted, disabled, or deleted account loses access immediately.
    const result = await pool.query(
      'SELECT id, email, role, is_active FROM users WHERE id = $1',
      [claims.id]
    );
    const user = result.rows[0];
    if (!user || !user.is_active) {
      res.status(401).json({ message: 'Account is unavailable' });
      return;
    }
    (req as AuthRequest).user = { id: user.id, email: user.email, role: user.role };
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: 'Invalid or expired token' });
      return;
    }
    next(error);
  }
};
