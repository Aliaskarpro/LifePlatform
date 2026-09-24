/**
 * DEMO SERVER - For demonstration without PostgreSQL
 * This is a simplified version that runs without database
 */

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3001;

// Configuration
const JWT_SECRET = 'demo-secret-key';
const CORS_ORIGIN = 'http://localhost:5173';

// Middleware
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());

// In-memory data
let users = [
  {
    id: '1',
    email: 'admin@example.com',
    password_hash: bcrypt.hashSync('Admin123!', 10),
    first_name: 'Admin',
    last_name: 'User',
    role: 'admin',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'teacher@example.com',
    password_hash: bcrypt.hashSync('Teacher123!', 10),
    first_name: 'Teacher',
    last_name: 'Demo',
    role: 'teacher',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    email: 'student@example.com',
    password_hash: bcrypt.hashSync('Student123!', 10),
    first_name: 'Student',
    last_name: 'Demo',
    role: 'student',
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

let levels = [
  { id: '1', name: 'Beginner', code: 'A1', description: 'Beginner Level', order_index: 1 },
  { id: '2', name: 'Elementary', code: 'A2', description: 'Elementary Level', order_index: 2 },
  { id: '3', name: 'Intermediate', code: 'B1', description: 'Intermediate Level', order_index: 3 },
];

let courses = [
  {
    id: '1',
    title: 'English for Beginners',
    description: 'Start your English learning journey',
    level_id: '1',
    teacher_id: '2',
    total_lessons: 10,
    is_published: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Business English',
    description: 'Professional English for business',
    level_id: '3',
    teacher_id: '2',
    total_lessons: 15,
    is_published: true,
    created_at: new Date().toISOString(),
  },
];

let notes = [];
let schedule = [];

// Helper: Transform snake_case to camelCase
function toCamelCase(obj) {
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  if (obj === null || typeof obj !== 'object') return obj;
  
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = toCamelCase(value);
  }
  return result;
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Demo server running (no database)' });
});

// CSRF token (mock)
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: 'demo-csrf-token-12345' });
});

// Auth: Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = {
      id: String(users.length + 1),
      email,
      password_hash: hash,
      first_name: firstName,
      last_name: lastName,
      role: 'student',
      is_active: true,
      created_at: new Date().toISOString(),
    };
    
    users.push(user);
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password_hash, ...userWithoutPassword } = user;
    res.status(201).json({ token, user: toCamelCase(userWithoutPassword) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Auth: Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password_hash, ...userWithoutPassword } = user;
    res.json({ token, user: toCamelCase(userWithoutPassword) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Auth: Get current user
app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find(u => u.id === decoded.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { password_hash, ...userWithoutPassword } = user;
    res.json(toCamelCase(userWithoutPassword));
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Levels
app.get('/api/levels', (req, res) => {
  res.json(toCamelCase(levels));
});

// Courses
app.get('/api/courses', (req, res) => {
  const coursesWithLevels = courses.map(course => {
    const level = levels.find(l => l.id === course.level_id);
    return {
      ...course,
      level_name: level?.name,
    };
  });
  res.json(toCamelCase(coursesWithLevels));
});

app.get('/api/courses/:id', (req, res) => {
  const course = courses.find(c => c.id === req.params.id);
  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }
  
  const level = levels.find(l => l.id === course.level_id);
  res.json(toCamelCase({
    ...course,
    level_name: level?.name,
    lessons: [],
  }));
});

// Notes (requires auth)
app.get('/api/notes', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const userNotes = notes.filter(n => n.user_id === decoded.id);
    res.json(toCamelCase(userNotes));
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

app.post('/api/notes', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const note = {
      id: String(notes.length + 1),
      user_id: decoded.id,
      title: req.body.title,
      content: req.body.content,
      category: req.body.category,
      tags: req.body.tags || [],
      is_pinned: req.body.isPinned || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    notes.push(note);
    res.status(201).json(toCamelCase(note));
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Schedule
app.get('/api/schedule', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const userSchedule = schedule.filter(s => s.user_id === decoded.id);
    res.json(toCamelCase(userSchedule));
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Statistics
app.get('/api/statistics/dashboard', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    res.json({
      completedLessons: 12,
      totalStudyTime: 360,
      currentLevel: { id: '2', name: 'Elementary', code: 'A2' },
      currentXp: 1250,
      weeklyProgress: [
        { day: 'Mon', minutes: 45 },
        { day: 'Tue', minutes: 60 },
        { day: 'Wed', minutes: 30 },
        { day: 'Thu', minutes: 75 },
        { day: 'Fri', minutes: 50 },
        { day: 'Sat', minutes: 90 },
        { day: 'Sun', minutes: 10 },
      ],
    });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Admin endpoints
app.get('/api/admin/users', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const usersWithoutPasswords = users.map(({ password_hash, ...user }) => user);
    res.json({
      users: toCamelCase(usersWithoutPasswords),
      pagination: { page: 1, limit: 20, total: users.length, totalPages: 1 },
    });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

app.get('/api/admin/stats/overview', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    res.json({
      totals: {
        users: users.length,
        courses: courses.length,
        lessons: 25,
        activeUsers: users.filter(u => u.is_active).length,
      },
      usersByRole: [
        { role: 'admin', count: '1' },
        { role: 'teacher', count: '1' },
        { role: 'student', count: String(users.length - 2) },
      ],
      courseStats: {
        published: String(courses.filter(c => c.is_published).length),
        unpublished: '0',
      },
    });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║  🎉 EDUPLATFORM DEMO SERVER RUNNING                     ║
╠══════════════════════════════════════════════════════════╣
║  📍 URL: http://localhost:${PORT}                         ║
║  🔐 Demo Users:                                          ║
║     Admin:   admin@example.com    / Admin123!           ║
║     Teacher: teacher@example.com  / Teacher123!         ║
║     Student: student@example.com  / Student123!         ║
║                                                          ║
║  ⚠️  NOTE: Using in-memory storage (no database)        ║
║     Data will be lost on server restart                 ║
╚══════════════════════════════════════════════════════════╝
  `);
});
