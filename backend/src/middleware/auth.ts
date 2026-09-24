import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Authentication required' });

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('CRITICAL: JWT_SECRET environment variable is not set');
    return res.status(500).json({ message: 'Server configuration error' });
  }

  jwt.verify(token, secret, (err: any, user: any) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    (req as AuthRequest).user = user;
    next();
  });
};
