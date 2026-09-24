import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import http from 'http';
import cookieParser from 'cookie-parser';
import { setupWsServer } from './websocket/wsServer';
import { pool } from './db/pool';
import { errorHandler } from './middleware/errorHandler';
import { csrfProtection, csrfTokenGenerator } from './middleware/csrf';
import { sanitizeMiddleware } from './middleware/sanitize';
import { transformResponse, transformRequest } from './middleware/transform';

import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import levelRoutes from './routes/levels';
import courseRoutes from './routes/courses';
import lessonRoutes from './routes/lessons';
import scheduleRoutes from './routes/schedule';
import noteRoutes from './routes/notes';
import statsRoutes from './routes/statistics';
import progressRoutes from './routes/progress';
import adminRoutes from './routes/admin';

dotenv.config();

const app = express();
const server = http.createServer(app);

// WebSocket server setup
const wss = setupWsServer(server);

// CORS configuration
const corsOrigin = process.env.CORS_ORIGIN;
if (!corsOrigin) {
  console.error('CRITICAL: CORS_ORIGIN environment variable is not set');
  process.exit(1);
}
const allowedOrigins = corsOrigin.split(',').map(o => o.trim());

app.use(helmet());
app.use(cors({ 
  origin: allowedOrigins,
  credentials: true 
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Transform request data from camelCase to snake_case (for DB)
app.use(transformRequest);

// Transform response data from snake_case to camelCase (for frontend)
app.use(transformResponse);

// Global input sanitization (applies to all routes)
app.use(sanitizeMiddleware);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.'
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 auth attempts per 15 minutes
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: false
});

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);

// CSRF token endpoint (must be before CSRF protection)
app.get('/api/csrf-token', csrfTokenGenerator);

// Apply CSRF protection to all state-changing operations
app.use('/api/', csrfProtection);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/levels', levelRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/statistics', statsRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

// Database connection check & Server start
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Failed to connect to database', err);
    process.exit(1);
  }
  console.log('Connected to PostgreSQL');
  
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});

// Graceful shutdown
const shutdown = () => {
  console.log('Shutting down server...');
  server.close(() => {
    pool.end(() => {
      console.log('Database pool closed');
      process.exit(0);
    });
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
