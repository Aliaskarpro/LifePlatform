import { doubleCsrf } from 'csrf-csrf';
import { Request, Response, NextFunction } from 'express';

const csrfConfig = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET || 'default-csrf-secret-change-me',
  cookieName: process.env.NODE_ENV === 'production' ? '__Host-csrf' : 'csrf',
  cookieOptions: {
    sameSite: 'strict',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  },
  size: 64,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
  getSessionIdentifier: (req) => {
    // Use user ID if authenticated, otherwise use IP address
    return (req as any).user?.id || req.ip || 'anonymous';
  },
});

// Middleware to generate and send CSRF token
export const csrfTokenGenerator = (req: Request, res: Response) => {
  const token = csrfConfig.generateCsrfToken(req, res);
  res.json({ csrfToken: token });
};

// Middleware to validate CSRF token
export const csrfProtection = csrfConfig.doubleCsrfProtection;
