import { User, Level, Course, Lesson, ScheduleEntry, Note } from '../types';

// ==================== DEMO USER ====================
export const MOCK_USER: User = {
  id: 'demo-user-1',
  email: 'demo@example.com',
  firstName: 'Alex',
  lastName: 'Johnson',
  role: 'student',
  subscriptionTier: 'free',
  createdAt: '2024-01-15T10:00:00Z',
};

// ==================== MOCK TOKEN ====================
export const MOCK_TOKEN = 'mock-jwt-token-demo-mode';

// ==================== LEVELS ====================
export const MOCK_LEVELS: Level[] = [
  { id: 'level-1', name: 'Beginner', code: 'A1', description: 'Basic understanding of the language', orderIndex: 1, minLessonsRequired: 10 },
  { id: 'level-2', name: 'Elementary', code: 'A2', description: 'Simple everyday expressions', orderIndex: 2, minLessonsRequired: 15 },
  { id: 'level-3', name: 'Pre-Intermediate', code: 'B1', description: 'Simple sentences on familiar topics', orderIndex: 3, minLessonsRequired: 20 },
  { id: 'level-4', name: 'Intermediate', code: 'B1+', description: 'Clear points on familiar subjects', orderIndex: 4, minLessonsRequired: 25 },
  { id: 'level-5', name: 'Upper-Intermediate', code: 'B2', description: 'Complex text & fluent interaction', orderIndex: 5, minLessonsRequired: 30 },
  { id: 'level-6', name: 'Advanced', code: 'C1', description: 'Flexible and effective language use', orderIndex: 6, minLessonsRequired: 40 },
];

// ==================== USER PROGRESS ====================
export const MOCK_PROGRESS = {
  levelId: 'level-4',
  levelName: 'Intermediate',
  levelCode: 'B1+',
  completedLessons: 12,
  totalStudyTime: 1080,
  currentXp: 2400,
  progressPercent: 48,
  nextLevel: MOCK_LEVELS[4],
};

// ==================== COURSES ====================
export const MOCK_COURSES: Course[] = [
  {
    id: 'course-1',
    title: 'English for Tech Professionals',
    description: 'Master technical vocabulary and communication skills for the IT industry.',
    levelId: 'level-4',
    levelName: 'Intermediate',
    totalLessons: 10,
    isPublished: true,
    completedLessons: 5,
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
  },
];

// ==================== LESSONS ====================
export const MOCK_LESSONS: Lesson[] = [
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
    content: '# Technical Presentations\n\nStructure and deliver technical presentations effectively.',
    durationMinutes: 60, orderIndex: 8, status: 'planned',
  },
  {
    id: 'lesson-9', courseId: 'course-2', courseTitle: 'Business Communications',
    title: 'Professional Email Writing', description: 'Write clear and effective business emails',
    content: '# Professional Emails\n\nLearn email etiquette and structure.',
    durationMinutes: 45, orderIndex: 1, status: 'completed',
  },
  {
    id: 'lesson-10', courseId: 'course-2', courseTitle: 'Business Communications',
    title: 'Meeting Facilitation', description: 'Lead and participate in business meetings',
    content: '# Meeting Language\n\nPhrases for opening, managing, and closing meetings.',
    durationMinutes: 60, orderIndex: 2, status: 'completed',
  },
  {
    id: 'lesson-11', courseId: 'course-2', courseTitle: 'Business Communications',
    title: 'Negotiation Skills', description: 'Negotiate professionally in English',
    content: '# Negotiation\n\nKey strategies and language for business negotiations.',
    durationMinutes: 60, orderIndex: 3, status: 'missed',
  },
  {
    id: 'lesson-12', courseId: 'course-2', courseTitle: 'Business Communications',
    title: 'Report Writing', description: 'Write professional business reports',
    content: '# Report Writing\n\nStructure and language for formal reports.',
    durationMinutes: 45, orderIndex: 4, status: 'planned',
  },
];

// ==================== SCHEDULE ====================
const now = new Date();
const d = (offsetDays: number, hour: number): string => {
  const date = new Date(now);
  date.setDate(date.getDate() + offsetDays);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};

export const MOCK_SCHEDULE: ScheduleEntry[] = [
  { id: 'sch-1', userId: 'demo-user-1', lessonId: 'lesson-1', title: 'Tech Vocabulary - Week 1', teacherName: 'Sarah Mitchell', levelName: 'Intermediate', startTime: d(-14, 10), endTime: d(-14, 11), lessonType: 'lesson', status: 'completed', color: '#6366f1' },
  { id: 'sch-2', userId: 'demo-user-1', lessonId: 'lesson-2', title: 'SDLC Discussion', teacherName: 'Sarah Mitchell', levelName: 'Intermediate', startTime: d(-12, 14), endTime: d(-12, 15), lessonType: 'lesson', status: 'completed', color: '#6366f1' },
  { id: 'sch-3', userId: 'demo-user-1', lessonId: 'lesson-3', title: 'Code Review Practice', teacherName: 'Sarah Mitchell', levelName: 'Intermediate', startTime: d(-10, 10), endTime: d(-10, 11), lessonType: 'lesson', status: 'completed', color: '#6366f1' },
  { id: 'sch-4', userId: 'demo-user-1', lessonId: 'lesson-4', title: 'Technical Interview Prep', teacherName: 'James Peterson', levelName: 'Intermediate', startTime: d(-7, 14), endTime: d(-7, 16), lessonType: 'lesson', status: 'completed', color: '#6366f1' },
  { id: 'sch-5', userId: 'demo-user-1', lessonId: 'lesson-9', title: 'Business Email Writing', teacherName: 'Sarah Mitchell', levelName: 'Pre-Intermediate', startTime: d(-5, 10), endTime: d(-5, 11), lessonType: 'lesson', status: 'completed', color: '#10b981' },
  { id: 'sch-6', userId: 'demo-user-1', lessonId: 'lesson-10', title: 'Meeting Facilitation Workshop', teacherName: 'James Peterson', levelName: 'Pre-Intermediate', startTime: d(-3, 14), endTime: d(-3, 15), lessonType: 'lesson', status: 'completed', color: '#10b981' },
  { id: 'sch-7', userId: 'demo-user-1', lessonId: 'lesson-11', title: 'Negotiation Skills', teacherName: 'James Peterson', levelName: 'Pre-Intermediate', startTime: d(-2, 16), endTime: d(-2, 17), lessonType: 'lesson', status: 'missed', color: '#10b981' },
  { id: 'sch-8', userId: 'demo-user-1', lessonId: 'lesson-5', title: 'API Documentation', teacherName: 'Sarah Mitchell', levelName: 'Intermediate', startTime: d(-1, 10), endTime: d(-1, 11), lessonType: 'lesson', status: 'in_progress', color: '#6366f1' },
  { id: 'sch-9', userId: 'demo-user-1', lessonId: 'lesson-6', title: 'Bug Reporting Session', teacherName: 'Sarah Mitchell', levelName: 'Intermediate', startTime: d(1, 10), endTime: d(1, 11), lessonType: 'lesson', status: 'planned', color: '#6366f1', meetingUrl: 'https://meet.google.com/abc-defg-hij' },
  { id: 'sch-10', userId: 'demo-user-1', lessonId: 'lesson-12', title: 'Negotiation Practice', teacherName: 'James Peterson', levelName: 'Pre-Intermediate', startTime: d(2, 14), endTime: d(2, 15), lessonType: 'lesson', status: 'planned', color: '#10b981' },
  { id: 'sch-11', userId: 'demo-user-1', lessonId: 'lesson-7', title: 'Agile & Scrum Meetings', teacherName: 'Sarah Mitchell', levelName: 'Intermediate', startTime: d(3, 10), endTime: d(3, 11), lessonType: 'lesson', status: 'planned', color: '#6366f1' },
  { id: 'sch-12', userId: 'demo-user-1', title: 'Self-Study: Vocabulary Review', levelName: 'Intermediate', startTime: d(5, 9), endTime: d(5, 10), lessonType: 'self_study', status: 'planned', color: '#f59e0b' },
  { id: 'sch-13', userId: 'demo-user-1', lessonId: 'lesson-8', title: 'Technical Presentations', teacherName: 'Sarah Mitchell', levelName: 'Intermediate', startTime: d(7, 10), endTime: d(7, 12), lessonType: 'lesson', status: 'planned', color: '#6366f1', meetingUrl: 'https://zoom.us/j/987654' },
  { id: 'sch-14', userId: 'demo-user-1', title: 'English Grammar Test', teacherName: 'Sarah Mitchell', levelName: 'Intermediate', startTime: d(10, 14), endTime: d(10, 15), lessonType: 'exam', status: 'planned', color: '#ef4444' },
];

// ==================== NOTES ====================
export const MOCK_NOTES: Note[] = [
  {
    id: 'note-1', userId: 'demo-user-1',
    title: '📚 Tech Vocabulary List',
    content: '## Essential Tech Terms\n\n- **API** - Application Programming Interface\n- **Repository** - Storage for code (Git)\n- **Deployment** - Process of releasing software\n- **Algorithm** - Step-by-step problem solving process\n- **Refactoring** - Improving code without changing functionality\n\n## Phrases to Remember\n- "We need to refactor this module"\n- "The deployment pipeline failed"',
    category: 'Vocabulary',
    tags: ['vocab', 'tech', 'important'],
    isPinned: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'note-2', userId: 'demo-user-1',
    title: '✅ Homework - Email Draft',
    content: '## Task: Write a professional email\n\n**TODO:**\n- [ ] Complete the email body\n- [ ] Add specific metrics\n- [ ] Review tone and formality\n\nTo: manager@company.com\nSubject: Project Update - Sprint 3\n\nDear Sarah,\n\nI hope this email finds you well...',
    category: 'Homework',
    tags: ['homework', 'email', 'business'],
    isPinned: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'note-3', userId: 'demo-user-1',
    title: '🎯 Interview Preparation Notes',
    content: '## Common Technical Interview Questions\n\n### Behavioral Questions\n- "Tell me about yourself"\n- "Describe a challenging project"\n\n### My Answers (Draft)\n**Tell me about yourself:**\n"I am a software developer with 3 years of experience..."',
    category: 'Interview',
    tags: ['interview', 'preparation', 'career'],
    isPinned: false,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'note-4', userId: 'demo-user-1',
    title: '📝 Meeting Phrases',
    content: '## Useful Meeting Phrases\n\n### Opening a Meeting\n- "Shall we get started?"\n- "Let\'s go through the agenda"\n\n### Asking for Clarification\n- "Could you elaborate on that?"\n- "I\'m not sure I follow, could you explain?"\n\n### Wrapping Up\n- "To summarize what we\'ve discussed..."\n- "Let\'s schedule a follow-up meeting"',
    category: 'Vocabulary',
    tags: ['meetings', 'phrases', 'business'],
    isPinned: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'note-5', userId: 'demo-user-1',
    title: '🔤 Grammar - Conditionals',
    content: '## Conditional Sentences in Business English\n\n### First Conditional (Real Future)\n- "If we deploy by Friday, we will meet the deadline"\n\n### Second Conditional (Hypothetical)\n- "If we had more resources, we could deliver faster"\n\n### Third Conditional (Past Regret)\n- "If we had tested more thoroughly, we wouldn\'t have had the bug"',
    category: 'Grammar',
    tags: ['grammar', 'conditionals', 'writing'],
    isPinned: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ==================== STATISTICS ====================
export const MOCK_STATS = {
  totalLessons: 16,
  completedLessons: 7,
  missedLessons: 1,
  plannedLessons: 8,
  completionRate: 88,
  totalStudyTime: 1080,
  currentXp: 2400,
  levelName: 'Intermediate',
  levelCode: 'B1+',
  nextLevelName: 'Upper-Intermediate',
  nextLevelRequired: 30,
  weeklyData: [
    { week: 'Sep 01', completed: 2, missed: 0, planned: 0 },
    { week: 'Sep 08', completed: 3, missed: 1, planned: 0 },
    { week: 'Sep 15', completed: 2, missed: 0, planned: 0 },
    { week: 'Sep 22', completed: 0, missed: 0, planned: 8 },
  ],
  monthlyData: [
    { month: 'Jun 2026', completed: 8, missed: 2, planned: 0 },
    { month: 'Jul 2026', completed: 10, missed: 1, planned: 0 },
    { month: 'Aug 2026', completed: 6, missed: 0, planned: 0 },
    { month: 'Sep 2026', completed: 7, missed: 1, planned: 8 },
  ],
};

// ==================== HELPERS ====================
export const getTodaySchedule = () => {
  const today = new Date();
  return MOCK_SCHEDULE.filter(s => {
    const date = new Date(s.startTime);
    return date.toDateString() === today.toDateString();
  });
};

export const getUpcomingLesson = () => {
  const now = new Date();
  return MOCK_SCHEDULE
    .filter(s => new Date(s.startTime) > now && s.status === 'planned')
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0] || null;
};

export const getWeekSchedule = () => {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  return MOCK_SCHEDULE.filter(s => {
    const d = new Date(s.startTime);
    return d >= weekStart && d < weekEnd;
  });
};
