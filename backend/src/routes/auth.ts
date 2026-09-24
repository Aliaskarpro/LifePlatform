import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { z } from 'zod';
import { pool } from '../db/pool';
import { validate } from '../middleware/validate';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types';
import { sendPasswordResetEmail } from '../services/emailService';

const router = Router();

const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    first_name: z.string().min(1),
    last_name: z.string().min(1)
  })
});

router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const { email, password, first_name, last_name } = req.body;
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) return res.status(400).json({ message: 'Email already in use' });

    const hash = await bcrypt.hash(password, Number(process.env.BCRYPT_ROUNDS) || 12);
    const result = await pool.query(`
      INSERT INTO users (email, password_hash, first_name, last_name)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, first_name, last_name, role
    `, [email, hash, first_name, last_name]);

    const user = result.rows[0];
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('CRITICAL: JWT_SECRET not set');
      return res.status(500).json({ message: 'Server configuration error' });
    }
    const expiresIn: string = process.env.JWT_EXPIRES_IN || '7d';
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role }, 
      secret, 
      { expiresIn } as jwt.SignOptions
    );

    res.status(201).json({ token, user });
  } catch (err) { next(err); }
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string()
  })
});

router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(400).json({ message: 'Invalid credentials' });

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(400).json({ message: 'Invalid credentials' });

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('CRITICAL: JWT_SECRET not set');
      return res.status(500).json({ message: 'Server configuration error' });
    }
    const expiresIn: string = process.env.JWT_EXPIRES_IN || '7d';
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role }, 
      secret, 
      { expiresIn } as jwt.SignOptions
    );
    
    delete user.password_hash;
    res.json({ token, user });
  } catch (err) { next(err); }
});

router.post('/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email()
  })
});

router.post('/forgot-password', validate(forgotPasswordSchema), async (req, res) => {
  try {
    const { email } = req.body;
    
    // Check if user exists
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    
    // Always return success to prevent email enumeration
    if (userResult.rows.length === 0) {
      return res.json({ message: 'If the email exists, a password reset link has been sent' });
    }

    const userId = userResult.rows[0].id;
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store hashed token in database
    await pool.query(
      'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3',
      [hashedToken, expiresAt, userId]
    );

    // Send email
    await sendPasswordResetEmail(email, resetToken);

    res.json({ message: 'If the email exists, a password reset link has been sent' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Failed to process request' });
  }
});

const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string(),
    new_password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
  })
});

router.post('/reset-password', validate(resetPasswordSchema), async (req, res) => {
  try {
    const { token, new_password } = req.body;
    
    // Hash the provided token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    // Find user with valid token
    const result = await pool.query(
      'SELECT id FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()',
      [hashedToken]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const userId = result.rows[0].id;
    
    // Hash new password
    const hash = await bcrypt.hash(new_password, Number(process.env.BCRYPT_ROUNDS) || 12);
    
    // Update password and clear reset token
    await pool.query(
      'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL, updated_at = NOW() WHERE id = $2',
      [hash, userId]
    );

    res.json({ message: 'Password has been reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Failed to reset password' });
  }
});

router.get('/me', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const result = await pool.query('SELECT id, email, first_name, last_name, avatar_url, role, subscription_tier, is_active FROM users WHERE id = $1', [req.user?.id]);
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

router.put('/change-password', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const { old_password, new_password } = req.body;
    const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user?.id]);
    const valid = await bcrypt.compare(old_password, result.rows[0].password_hash);
    if (!valid) return res.status(400).json({ message: 'Invalid old password' });

    const hash = await bcrypt.hash(new_password, Number(process.env.BCRYPT_ROUNDS) || 12);
    await pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [hash, req.user?.id]);
    res.json({ message: 'Password updated' });
  } catch (err) { next(err); }
});

export default router;
