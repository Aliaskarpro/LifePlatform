import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'eduplatform-inmemory-secret-2026';

app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== IN-MEMORY DATA STORE ====================
interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'teacher' | 'admin';
  subscriptionTier: 'free' | 'pro' | 'enterprise';
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
}

const users: UserRecord[] = [
  {
    id: 'demo-user-1',
    email: 'demo@example.com',
    passwordHash: bcrypt.hashSync('Demo1234!', 10),
    firstName: 'Alex',
    lastName: 'Johnson',
    role: 'student',
    subscriptionTier: 'free',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'admin-1',
    email: 'admin@example.com',
    passwordHash: bcrypt.hashSync('Admin123!', 10),
    firstName: 'System',
    lastName: 'Administrator',
    role: 'admin',
    subscriptionTier: 'enterprise',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'teacher-1',
    email: 'teacher@example.com',
    passwordHash: bcrypt.hashSync('Teacher123!', 10),
    firstName: 'Sarah',
    lastName: 'Williams',
    role: 'teacher',
    subscriptionTier: 'pro',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'student-1',
    email: 'student@example.com',
    passwordHash: bcrypt.hashSync('Student123!', 10),
    firstName: 'Michael',
    lastName: 'Chen',
    role: 'student',
    subscriptionTier: 'free',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

const levels = [
  { id: 'level-1', name: 'Beginner', code: 'A1', description: 'Basic understanding of the language', orderIndex: 1, minLessonsRequired: 10 },
  { id: 'level-2', name: 'Elementary', code: 'A2', description: 'Simple everyday expressions', orderIndex: 2, minLessonsRequired: 15 },
  { id: 'level-3', name: 'Pre-Intermediate', code: 'B1', description: 'Simple sentences on familiar topics', orderIndex: 3, minLessonsRequired: 20 },
  { id: 'level-4', name: 'Intermediate', code: 'B1+', description: 'Clear points on familiar subjects', orderIndex: 4, minLessonsRequired: 25 },
  { id: 'level-5', name: 'Upper-Intermediate', code: 'B2', description: 'Complex text & fluent interaction', orderIndex: 5, minLessonsRequired: 30 },
  { id: 'level-6', name: 'Advanced', code: 'C1', description: 'Flexible and effective language use', orderIndex: 6, minLessonsRequired: 40 },
];

const courses = [
  {
    id: 'course-1',
    title: 'English for Tech Professionals',
    description: 'Master technical vocabulary and communication skills for the IT industry.',
    levelId: 'level-4',
    levelName: 'Intermediate',
    totalLessons: 10,
    isPublished: true,
    completedLessons: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'course-2',
    title: 'Business Communications',
    description: 'Write professional emails, conduct meetings in English, and deliver presentations.',
    levelId: 'level-3',
    levelName: 'Pre-Intermediate',
    totalLessons: 8,
    isPublished: true,
    completedLessons: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'course-3',
    title: 'Advanced Conversation',
    description: 'Improve fluency through structured conversational practice and debates.',
    levelId: 'level-5',
    levelName: 'Upper-Intermediate',
    totalLessons: 6,
    isPublished: true,
    completedLessons: 0,
    createdAt: new Date().toISOString(),
  },
];

let lessons = [
  {
    id: 'lesson-1', courseId: 'course-1', courseTitle: 'English for Tech Professionals',
    title: 'Introduction to Tech Vocabulary', description: 'Learn foundational tech terms used in IT companies',
    content: '# Introduction\n\nIn this lesson, we cover the most essential tech vocabulary.\n\n## Key Terms\n- **Algorithm** - A step-by-step procedure\n- **Repository** - Code storage (Git)\n- **Deployment** - Releasing software to production\n- **API** - Application Programming Interface\n\n## Practice\nUse these words in context sentences.',
    durationMinutes: 45, orderIndex: 1, status: 'completed', homework: 'Write 5 sentences using new vocabulary',
    materials: [{ type: 'pdf', title: 'Vocabulary List', url: '#' }, { type: 'link', title: 'Tech Glossary', url: '#' }]
  },
  {
    id: 'lesson-2', courseId: 'course-1', courseTitle: 'English for Tech Professionals',
    title: 'Software Development Lifecycle', description: 'Discuss SDLC phases in English',
    content: '# Software Development Lifecycle\n\nLearn how to discuss project phases professionally.\n\n## Phases\n1. Planning\n2. Design\n3. Development\n4. Testing\n5. Deployment\n6. Maintenance',
    durationMinutes: 60, orderIndex: 2, status: 'completed', homework: 'Describe your last project using SDLC terminology',
  },
  {
    id: 'lesson-3', courseId: 'course-1', courseTitle: 'English for Tech Professionals',
    title: 'Code Review English', description: 'Language for code reviews and feedback',
    content: '# Code Review Communication\n\nLearn professional phrases for code review.\n\n## Useful Phrases\n- "I noticed that..."\n- "It might be worth considering..."\n- "Great approach, though..."',
    durationMinutes: 45, orderIndex: 3, status: 'completed', homework: 'Review a code snippet and write 3 feedback comments',
  },
  {
    id: 'lesson-4', courseId: 'course-1', courseTitle: 'English for Tech Professionals',
    title: 'Technical Interviews', description: 'Prepare for English-language tech interviews',
    content: '# Technical Interview English\n\nMaster the language of technical interviews.',
    durationMinutes: 90, orderIndex: 4, status: 'completed',
  },
  {
    id: 'lesson-5', courseId: 'course-1', courseTitle: 'English for Tech Professionals',
    title: 'API Documentation Reading', description: 'Navigate and understand API docs in English',
    content: '# Reading API Documentation\n\nLearn how to efficiently read and understand API documentation.',
    durationMinutes: 45, orderIndex: 5, status: 'in_progress',
  },
  {
    id: 'lesson-6', courseId: 'course-1', courseTitle: 'English for Tech Professionals',
    title: 'Bug Reporting', description: 'Write clear bug reports in English',
    content: '# Writing Effective Bug Reports\n\nLearn the structure and language of professional bug reports.',
    durationMinutes: 30, orderIndex: 6, status: 'planned',
  },
  {
    id: 'lesson-7', courseId: 'course-1', courseTitle: 'English for Tech Professionals',
    title: 'Agile & Scrum Meetings', description: 'Participate in standup meetings and sprints',
    content: '# Agile Communication\n\nMaster the language used in Agile/Scrum environments.',
    durationMinutes: 60, orderIndex: 7, status: 'planned',
  },
  {
    id: 'lesson-8', courseId: 'course-1', courseTitle: 'English for Tech Professionals',
    title: 'Technical Presentations', description: 'Present technical solutions confidently',
    content: '# Technical Presentations\n\nStructure and deliver technical presentations.',
    durationMinutes: 60, orderIndex: 8, status: 'planned',
  },
];

let notes: any[] = [
  {
    id: 'note-1',
    userId: 'demo-user-1',
    title: 'Tech Vocabulary - Key Terms',
    content: '- CI/CD: Continuous Integration / Continuous Deployment\n- Microservices architecture vs Monolith\n- Idempotency in REST APIs\n- Sharding & database indexing techniques',
    category: 'vocabulary',
    tags: ['tech', 'backend', 'vocabulary'],
    isPinned: true,
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
  },
  {
    id: 'note-2',
    userId: 'demo-user-1',
    title: 'Conditional Sentences in Code Review',
    content: 'Type 1: If we deploy now, we might break the test suite.\nType 2: If we had more memory, this query would run faster.\nType 3: If we had caught this bug in QA, it wouldn\'t have hit production.',
    category: 'grammar',
    tags: ['grammar', 'conditionals'],
    isPinned: true,
    createdAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
  },
  {
    id: 'note-3',
    userId: 'demo-user-1',
    title: 'Speaking Practice Notes - Sprint Review',
    content: 'Phrases to use during demo:\n- "Let me walk you through this feature"\n- "As you can see on the screen..."\n- "Any questions before we proceed?"',
    category: 'practice',
    tags: ['speaking', 'agile', 'meetings'],
    isPinned: false,
    createdAt: new Date(Date.now() - 3600000 * 24 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 6).toISOString(),
  },
];

const todayISO = new Date();
const todayDateStr = todayISO.toISOString().split('T')[0];

const buildDateTime = (dateStr: string, timeStr: string) => `${dateStr}T${timeStr}:00.000Z`;

let schedule: any[] = [
  {
    id: 'sch-1',
    userId: 'demo-user-1',
    courseId: 'course-1',
    courseTitle: 'English for Tech Professionals',
    lessonId: 'lesson-5',
    lessonTitle: 'API Documentation Reading',
    title: 'API Documentation Reading',
    startTime: buildDateTime(todayDateStr, '10:00'),
    endTime: buildDateTime(todayDateStr, '10:45'),
    status: 'planned',
    lessonType: 'lesson',
    notes: 'Prepare Swagger sample doc',
    location: 'Online Classroom',
  },
  {
    id: 'sch-2',
    userId: 'demo-user-1',
    courseId: 'course-1',
    courseTitle: 'English for Tech Professionals',
    lessonId: 'lesson-6',
    lessonTitle: 'Bug Reporting Practice',
    title: 'Bug Reporting Practice',
    startTime: buildDateTime(todayDateStr, '14:00'),
    endTime: buildDateTime(todayDateStr, '14:30'),
    status: 'planned',
    lessonType: 'practice',
    notes: 'Bring sample Jira tickets',
    location: 'Room 2B',
  },
  {
    id: 'sch-3',
    userId: 'demo-user-1',
    courseId: 'course-2',
    courseTitle: 'Business Communications',
    lessonId: 'lesson-3',
    lessonTitle: 'Email Writing Workshop',
    title: 'Email Writing Workshop',
    startTime: buildDateTime(todayDateStr, '16:00'),
    endTime: buildDateTime(todayDateStr, '17:00'),
    status: 'planned',
    lessonType: 'workshop',
    notes: 'Draft 2 formal emails',
    location: 'Lab 1',
  },
];

// Helper: Strip password hash and format user
const formatUser = (user: UserRecord) => {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
};

// Middleware: Authenticate JWT token
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'No authentication token provided' });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
  
  if (token === 'mock-jwt-token-demo-mode' || token === 'demo-token-123') {
    (req as any).user = users[0];
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = users.find(u => u.id === decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found or token expired' });
    }
    (req as any).user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// ==================== API ROUTES ====================

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'LifePlatform', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// CSRF token
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: 'eduplatform-demo-csrf-token-xyz' });
});

// Auth: Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  // Support demo login
  if (email === 'demo@example.com' && (password === 'Demo1234!' || password === 'demo')) {
    const user = users.find(u => u.email === 'demo@example.com')!;
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, user: formatUser(user) });
  }

  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  const isValid = bcrypt.compareSync(password, user.passwordHash);
  if (!isValid) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: formatUser(user) });
});

// Auth: Register
app.post('/api/auth/register', (req, res) => {
  const { email, password, firstName, lastName, first_name, last_name } = req.body;
  const fName = firstName || first_name;
  const lName = lastName || last_name;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ message: 'An account with this email already exists' });
  }

  const newUser: UserRecord = {
    id: `user-${Date.now()}`,
    email: email.toLowerCase(),
    passwordHash: bcrypt.hashSync(password, 10),
    firstName: fName || 'Student',
    lastName: lName || 'User',
    role: 'student',
    subscriptionTier: 'free',
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ token, user: formatUser(newUser) });
});

// Auth: Me
app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = (req as any).user as UserRecord;
  res.json(formatUser(user));
});

// Auth: Logout
app.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// Auth: Forgot password
app.post('/api/auth/forgot-password', (req, res) => {
  res.json({ message: 'Password reset link sent (demo)' });
});

// Levels
app.get('/api/levels', (req, res) => {
  res.json(levels);
});

app.get('/api/levels/user/current', (req, res) => {
  res.json({
    levelId: 'level-4',
    levelName: 'Intermediate',
    levelCode: 'B1+',
    completedLessons: 12,
    totalStudyTime: 1080,
    currentXp: 2400,
    progressPercent: 48,
    nextLevel: levels[4],
  });
});

// Courses
app.get('/api/courses', (req, res) => {
  res.json(courses);
});

app.get('/api/courses/:id', (req, res) => {
  const course = courses.find(c => c.id === req.params.id);
  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }
  const courseLessons = lessons.filter(l => l.courseId === req.params.id);
  res.json({ ...course, lessons: courseLessons });
});

// Lessons
app.get('/api/lessons', (req, res) => {
  const { course_id, courseId } = req.query;
  const filterId = (course_id || courseId) as string;
  if (filterId) {
    return res.json(lessons.filter(l => l.courseId === filterId));
  }
  res.json(lessons);
});

app.get('/api/lessons/:id', (req, res) => {
  const lesson = lessons.find(l => l.id === req.params.id);
  if (!lesson) {
    return res.status(404).json({ message: 'Lesson not found' });
  }
  res.json(lesson);
});

app.put('/api/lessons/:id/progress', (req, res) => {
  const { status } = req.body;
  const lesson = lessons.find(l => l.id === req.params.id);
  if (lesson && status) {
    lesson.status = status;
  }
  res.json({ lessonId: req.params.id, status });
});

// Notes
app.get('/api/notes', (req, res) => {
  const { search, category } = req.query as { search?: string; category?: string };
  let result = [...notes];
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(n => n.title?.toLowerCase().includes(q) || n.content?.toLowerCase().includes(q));
  }
  if (category && category !== 'all') {
    result = result.filter(n => n.category === category);
  }
  result.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
  res.json(result);
});

app.post('/api/notes', (req, res) => {
  const { title, content, category, tags, isPinned } = req.body;
  const newNote = {
    id: `note-${Date.now()}`,
    userId: 'demo-user-1',
    title: title || 'Untitled Note',
    content: content || '',
    category: category || 'general',
    tags: tags || [],
    isPinned: Boolean(isPinned),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  notes.unshift(newNote);
  res.status(201).json(newNote);
});

app.put('/api/notes/:id', (req, res) => {
  const idx = notes.findIndex(n => n.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ message: 'Note not found' });
  }
  notes[idx] = {
    ...notes[idx],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  res.json(notes[idx]);
});

app.put('/api/notes/:id/pin', (req, res) => {
  const idx = notes.findIndex(n => n.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ message: 'Note not found' });
  }
  const isPinned = req.body.is_pinned !== undefined ? Boolean(req.body.is_pinned) : !notes[idx].isPinned;
  notes[idx].isPinned = isPinned;
  notes[idx].updatedAt = new Date().toISOString();
  res.json(notes[idx]);
});

app.delete('/api/notes/:id', (req, res) => {
  notes = notes.filter(n => n.id !== req.params.id);
  res.json({ message: 'Note deleted' });
});

// Schedule
app.get('/api/schedule', (req, res) => {
  const { status, type } = req.query as { status?: string; type?: string };
  let result = [...schedule];
  if (status) result = result.filter(s => s.status === status);
  if (type) result = result.filter(s => s.lessonType === type);
  result.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  res.json(result);
});

app.get('/api/schedule/today', (req, res) => {
  const todayPrefix = new Date().toISOString().split('T')[0];
  const todayEntries = schedule.filter(s => s.startTime.startsWith(todayPrefix));
  res.json(todayEntries.length > 0 ? todayEntries : schedule.slice(0, 3));
});

app.get('/api/schedule/week', (req, res) => {
  res.json(schedule);
});

app.get('/api/schedule/upcoming', (req, res) => {
  const upcoming = schedule.find(s => s.status === 'planned');
  res.json(upcoming || schedule[0] || null);
});

app.post('/api/schedule', (req, res) => {
  const newEntry = {
    id: `sch-${Date.now()}`,
    userId: 'demo-user-1',
    status: 'planned',
    lessonType: 'lesson',
    ...req.body,
  };
  schedule.push(newEntry);
  res.status(201).json(newEntry);
});

app.put('/api/schedule/:id', (req, res) => {
  const idx = schedule.findIndex(s => s.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ message: 'Schedule entry not found' });
  }
  schedule[idx] = { ...schedule[idx], ...req.body };
  res.json(schedule[idx]);
});

app.delete('/api/schedule/:id', (req, res) => {
  schedule = schedule.filter(s => s.id !== req.params.id);
  res.json({ message: 'Schedule entry deleted' });
});

// Statistics
app.get('/api/statistics', (req, res) => {
  res.json({
    totalStudyHours: 48,
    completedLessons: 12,
    currentStreakDays: 7,
    vocabularyLearned: 284,
    grammarTopicsMastered: 16,
    averageScore: 92,
    weeklyActivity: [
      { day: 'Mon', hours: 1.5, lessonsCount: 2 },
      { day: 'Tue', hours: 2.0, lessonsCount: 2 },
      { day: 'Wed', hours: 1.0, lessonsCount: 1 },
      { day: 'Thu', hours: 2.5, lessonsCount: 3 },
      { day: 'Fri', hours: 1.5, lessonsCount: 2 },
      { day: 'Sat', hours: 3.0, lessonsCount: 3 },
      { day: 'Sun', hours: 0.5, lessonsCount: 1 },
    ],
    skillsProgress: [
      { skill: 'Reading', percent: 85 },
      { skill: 'Listening', percent: 78 },
      { skill: 'Writing', percent: 70 },
      { skill: 'Speaking', percent: 65 },
      { skill: 'Grammar', percent: 80 },
    ],
  });
});

app.get('/api/statistics/dashboard', (req, res) => {
  res.json({
    completedLessons: 12,
    totalStudyTime: 1080,
    currentLevel: { id: 'level-4', name: 'Intermediate', code: 'B1+' },
    currentXp: 2400,
    weeklyProgress: [
      { day: 'Mon', minutes: 45 },
      { day: 'Tue', minutes: 60 },
      { day: 'Wed', minutes: 30 },
      { day: 'Thu', minutes: 75 },
      { day: 'Fri', minutes: 50 },
      { day: 'Sat', minutes: 90 },
      { day: 'Sun', minutes: 15 },
    ],
  });
});

app.get('/api/statistics/weekly', (req, res) => {
  res.json([
    { day: 'Mon', hours: 1.5, lessonsCount: 2 },
    { day: 'Tue', hours: 2.0, lessonsCount: 2 },
    { day: 'Wed', hours: 1.0, lessonsCount: 1 },
    { day: 'Thu', hours: 2.5, lessonsCount: 3 },
    { day: 'Fri', hours: 1.5, lessonsCount: 2 },
    { day: 'Sat', hours: 3.0, lessonsCount: 3 },
    { day: 'Sun', hours: 0.5, lessonsCount: 1 },
  ]);
});

app.get('/api/statistics/monthly', (req, res) => {
  res.json([
    { week: 'Week 1', hours: 8, lessonsCount: 6 },
    { week: 'Week 2', hours: 10, lessonsCount: 8 },
    { week: 'Week 3', hours: 12, lessonsCount: 10 },
    { week: 'Week 4', hours: 11, lessonsCount: 9 },
  ]);
});

// Users
app.get('/api/users/profile', authMiddleware, (req, res) => {
  const user = (req as any).user;
  res.json({
    ...formatUser(user),
    progress: {
      levelId: 'level-4',
      levelName: 'Intermediate',
      levelCode: 'B1+',
      completedLessons: 12,
      totalStudyTime: 1080,
      currentXp: 2400,
      progressPercent: 48,
    },
  });
});

app.put('/api/users/profile', authMiddleware, (req, res) => {
  const user = (req as any).user as UserRecord;
  const { firstName, lastName, email } = req.body;
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (email) user.email = email;
  res.json(formatUser(user));
});

app.get('/api/users/stats', (req, res) => {
  res.json({
    completedLessons: 12,
    studyHours: 48,
    currentStreak: 7,
    currentXp: 2400,
  });
});

// Admin
app.get('/api/admin/users', (req, res) => {
  res.json({
    users: users.map(formatUser),
    pagination: { page: 1, limit: 20, total: users.length, totalPages: 1 },
  });
});

app.get('/api/admin/stats/overview', (req, res) => {
  res.json({
    totals: {
      users: users.length,
      courses: courses.length,
      lessons: lessons.length,
      activeUsers: users.filter(u => u.isActive).length,
    },
    usersByRole: [
      { role: 'admin', count: '1' },
      { role: 'teacher', count: '1' },
      { role: 'student', count: String(users.length - 2) },
    ],
    courseStats: {
      published: String(courses.filter(c => c.isPublished).length),
      unpublished: '0',
    },
  });
});

// ==================== VITE / STATIC SERVING ====================
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      root: __dirname,
      configFile: path.resolve(__dirname, 'vite.config.ts'),
      server: { middlewareMode: true, host: '0.0.0.0' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EduPlatform server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
