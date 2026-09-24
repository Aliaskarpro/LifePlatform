import { pool } from './pool';
import bcrypt from 'bcryptjs';

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check if demo user already exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      ['demo@example.com']
    );
    if (existingUser.rows.length > 0) {
      console.log('Demo user already exists, skipping seed');
      await client.query('ROLLBACK');
      return;
    }

    // Create demo user
    const passwordHash = await bcrypt.hash('Demo1234!', 12);
    const userResult = await client.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, subscription_tier)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      ['demo@example.com', passwordHash, 'Alex', 'Johnson', 'student', 'free']
    );
    const userId = userResult.rows[0].id;
    console.log(`Created demo user: ${userId}`);

    // Get levels
    const levelsResult = await client.query('SELECT id, code FROM levels ORDER BY order_index');
    const levels = levelsResult.rows;
    const intermediateLevel = levels.find((l: any) => l.code === 'B1+') || levels[3];
    const levelId = intermediateLevel?.id;

    // Set user progress
    if (levelId) {
      await client.query(
        `INSERT INTO user_progress (user_id, level_id, completed_lessons, total_study_time, current_xp)
         VALUES ($1, $2, 12, 1080, 2400)
         ON CONFLICT (user_id) DO NOTHING`,
        [userId, levelId]
      );
    }

    // Course 1: English for Tech (Intermediate)
    const course1Result = await client.query(
      `INSERT INTO courses (title, description, level_id, total_lessons)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [
        'English for Tech Professionals',
        'Master technical vocabulary and communication skills for the IT industry. Learn how to discuss software, algorithms, and project management in English.',
        levelId,
        10,
      ]
    );
    const course1Id = course1Result.rows[0].id;

    // Course 2: Business English
    const preIntLevel = levels.find((l: any) => l.code === 'B1') || levels[2];
    const course2Result = await client.query(
      `INSERT INTO courses (title, description, level_id, total_lessons)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [
        'Business Communications',
        'Write professional emails, conduct meetings in English, and deliver presentations with confidence.',
        preIntLevel?.id || levelId,
        8,
      ]
    );
    const course2Id = course2Result.rows[0].id;

    // Course 3: Conversational English
    const upperIntLevel = levels.find((l: any) => l.code === 'B2') || levels[4];
    const course3Result = await client.query(
      `INSERT INTO courses (title, description, level_id, total_lessons)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [
        'Advanced Conversation',
        'Improve your fluency and confidence through structured conversational practice, debates, and discussions on complex topics.',
        upperIntLevel?.id || levelId,
        6,
      ]
    );
    const course3Id = course3Result.rows[0].id;

    // Lessons for Course 1
    const course1Lessons = [
      { title: 'Introduction to Tech Vocabulary', desc: 'Learn foundational tech terms used in IT companies', content: '# Introduction\n\nIn this lesson, we cover the most essential tech vocabulary...\n\n## Key Terms\n- Algorithm\n- Repository\n- Deployment\n- API (Application Programming Interface)\n\n## Practice\nUse these words in context sentences.', duration: 45, hw: 'Write 5 sentences using new vocabulary' },
      { title: 'Software Development Lifecycle', desc: 'Discuss SDLC phases in English', content: '# Software Development Lifecycle\n\nLearn how to discuss project phases professionally.\n\n## Phases\n1. Planning\n2. Design\n3. Development\n4. Testing\n5. Deployment\n6. Maintenance', duration: 60, hw: 'Describe your last project using SDLC terminology' },
      { title: 'Code Review English', desc: 'Language for code reviews and feedback', content: '# Code Review Communication\n\nLearn professional phrases for code review.\n\n## Useful Phrases\n- "I noticed that..."\n- "It might be worth considering..."\n- "Great approach, though..."', duration: 45, hw: 'Review a code snippet and write 3 feedback comments' },
      { title: 'Technical Interviews', desc: 'Prepare for English-language tech interviews', content: '# Technical Interview English\n\nMaster the language of technical interviews.', duration: 90, hw: 'Record yourself answering 3 common interview questions' },
      { title: 'API Documentation Reading', desc: 'Navigate and understand API docs in English', content: '# Reading API Documentation\n\nLearn how to efficiently read and understand API documentation.', duration: 45, hw: 'Read the GitHub REST API docs and summarize endpoints' },
      { title: 'Bug Reporting', desc: 'Write clear bug reports in English', content: '# Writing Effective Bug Reports\n\nLearn the structure and language of professional bug reports.', duration: 30, hw: 'Write a bug report for a real issue you encountered' },
      { title: 'Agile & Scrum Meetings', desc: 'Participate in standup meetings and sprints', content: '# Agile Communication\n\nMaster the language used in Agile/Scrum environments.', duration: 60, hw: 'Prepare your standup update for tomorrow' },
      { title: 'Technical Presentations', desc: 'Present technical solutions confidently', content: '# Technical Presentations\n\nStructure and deliver technical presentations effectively.', duration: 60, hw: 'Prepare a 5-minute presentation on a technical topic' },
      { title: 'Remote Team Communication', desc: 'Communicate effectively in distributed teams', content: '# Remote Team Communication\n\nBest practices for async and sync communication.', duration: 45, hw: 'Write a project update email to your distributed team' },
      { title: 'Final Project: Tech Pitch', desc: 'Pitch a technical product in English', content: '# Final Project\n\nApply all skills learned to pitch a technical product.', duration: 90, hw: 'Prepare and record your 3-minute product pitch' },
    ];

    const lessonIds: string[] = [];
    for (let i = 0; i < course1Lessons.length; i++) {
      const l = course1Lessons[i];
      const res = await client.query(
        `INSERT INTO lessons (course_id, title, description, content, duration_minutes, order_index, homework)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [course1Id, l.title, l.desc, l.content, l.duration, i + 1, l.hw]
      );
      lessonIds.push(res.rows[0].id);
    }

    // Lessons for Course 2
    const course2Lessons = [
      { title: 'Professional Email Writing', desc: 'Write clear and effective business emails', content: '# Professional Emails\n\nLearn email etiquette and structure.', duration: 45 },
      { title: 'Meeting Facilitation', desc: 'Lead and participate in business meetings', content: '# Meeting Language\n\nPhrases for opening, managing, and closing meetings.', duration: 60 },
      { title: 'Negotiation Skills', desc: 'Negotiate professionally in English', content: '# Negotiation\n\nKey strategies and language for business negotiations.', duration: 60 },
      { title: 'Report Writing', desc: 'Write professional business reports', content: '# Report Writing\n\nStructure and language for formal reports.', duration: 45 },
      { title: 'Presentation Skills', desc: 'Deliver impactful business presentations', content: '# Presentations\n\nFrom slides to delivery - complete presentation skills.', duration: 90 },
      { title: 'Networking in English', desc: 'Build professional connections confidently', content: '# Professional Networking\n\nConversation starters and networking language.', duration: 45 },
      { title: 'Conflict Resolution', desc: 'Handle workplace conflicts professionally', content: '# Conflict Resolution\n\nDiplomatic language for difficult conversations.', duration: 60 },
      { title: 'Cross-Cultural Communication', desc: 'Navigate cultural differences in business', content: '# Cross-Cultural Communication\n\nUnderstand cultural nuances in international business.', duration: 45 },
    ];

    const course2LessonIds: string[] = [];
    for (let i = 0; i < course2Lessons.length; i++) {
      const l = course2Lessons[i];
      const res = await client.query(
        `INSERT INTO lessons (course_id, title, description, content, duration_minutes, order_index)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [course2Id, l.title, l.desc, l.content, l.duration, i + 1]
      );
      course2LessonIds.push(res.rows[0].id);
    }

    // Lesson Progress
    const progressData = [
      { lessonId: lessonIds[0], status: 'completed' },
      { lessonId: lessonIds[1], status: 'completed' },
      { lessonId: lessonIds[2], status: 'completed' },
      { lessonId: lessonIds[3], status: 'completed' },
      { lessonId: lessonIds[4], status: 'in_progress' },
      { lessonId: lessonIds[5], status: 'planned' },
      { lessonId: course2LessonIds[0], status: 'completed' },
      { lessonId: course2LessonIds[1], status: 'completed' },
      { lessonId: course2LessonIds[2], status: 'missed' },
      { lessonId: course2LessonIds[3], status: 'planned' },
    ];

    for (const p of progressData) {
      const completedAt = p.status === 'completed' ? new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000) : null;
      await client.query(
        `INSERT INTO lesson_progress (user_id, lesson_id, status, completed_at)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, lesson_id) DO NOTHING`,
        [userId, p.lessonId, p.status, completedAt]
      );
    }

    // Schedule - create entries for past 2 weeks + next 2 weeks
    const now = new Date();
    const scheduleEntries = [
      // Past entries (completed)
      { daysOffset: -14, hour: 10, title: 'Tech Vocabulary - Week 1', lessonIdx: 0, status: 'completed', teacher: 'Sarah Mitchell', color: '#6366f1' },
      { daysOffset: -12, hour: 14, title: 'SDLC Discussion', lessonIdx: 1, status: 'completed', teacher: 'Sarah Mitchell', color: '#6366f1' },
      { daysOffset: -10, hour: 10, title: 'Code Review Practice', lessonIdx: 2, status: 'completed', teacher: 'Sarah Mitchell', color: '#6366f1' },
      { daysOffset: -7, hour: 14, title: 'Technical Interview Prep', lessonIdx: 3, status: 'completed', teacher: 'James Peterson', color: '#6366f1' },
      { daysOffset: -5, hour: 10, title: 'Business Email Writing', lessonIdx: null, status: 'completed', teacher: 'Sarah Mitchell', color: '#10b981', courseTitle: 'Business' },
      { daysOffset: -3, hour: 14, title: 'API Documentation', lessonIdx: 4, status: 'completed', teacher: 'Sarah Mitchell', color: '#6366f1' },
      { daysOffset: -2, hour: 16, title: 'Meeting Facilitation', lessonIdx: null, status: 'missed', teacher: 'James Peterson', color: '#10b981' },
      { daysOffset: -1, hour: 10, title: 'Bug Reporting Session', lessonIdx: 5, status: 'in_progress', teacher: 'Sarah Mitchell', color: '#6366f1' },
      // Future entries
      { daysOffset: 1, hour: 10, title: 'Agile & Scrum Meetings', lessonIdx: 6, status: 'planned', teacher: 'Sarah Mitchell', color: '#6366f1' },
      { daysOffset: 2, hour: 14, title: 'Negotiation Skills', lessonIdx: null, status: 'planned', teacher: 'James Peterson', color: '#10b981' },
      { daysOffset: 3, hour: 10, title: 'Technical Presentations', lessonIdx: 7, status: 'planned', teacher: 'Sarah Mitchell', color: '#6366f1' },
      { daysOffset: 5, hour: 16, title: 'Self-Study: Vocabulary Review', lessonIdx: null, status: 'planned', teacher: null, color: '#f59e0b' },
      { daysOffset: 7, hour: 10, title: 'Remote Team Communication', lessonIdx: 8, status: 'planned', teacher: 'Sarah Mitchell', color: '#6366f1' },
      { daysOffset: 8, hour: 14, title: 'Report Writing Workshop', lessonIdx: null, status: 'planned', teacher: 'James Peterson', color: '#10b981' },
      { daysOffset: 10, hour: 10, title: 'Advanced Conversation Practice', lessonIdx: null, status: 'planned', teacher: 'Sarah Mitchell', color: '#8b5cf6' },
      { daysOffset: 12, hour: 14, title: 'Final Tech Pitch Preparation', lessonIdx: 9, status: 'planned', teacher: 'Sarah Mitchell', color: '#6366f1' },
    ];

    for (const entry of scheduleEntries) {
      const startTime = new Date(now);
      startTime.setDate(startTime.getDate() + entry.daysOffset);
      startTime.setHours(entry.hour, 0, 0, 0);
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour

      const lessonId = entry.lessonIdx !== null && entry.lessonIdx !== undefined
        ? lessonIds[entry.lessonIdx]
        : null;

      await client.query(
        `INSERT INTO schedule (user_id, lesson_id, title, teacher_name, level_id, start_time, end_time, lesson_type, status, color)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [userId, lessonId, entry.title, entry.teacher, levelId, startTime, endTime, 'lesson', entry.status, entry.color]
      );
    }

    // Notes
    const notes = [
      {
        title: '📚 Tech Vocabulary List',
        content: '## Essential Tech Terms\n\n- **API** - Application Programming Interface\n- **Repository** - Storage for code (Git)\n- **Deployment** - Process of releasing software\n- **Algorithm** - Step-by-step problem solving process\n- **Refactoring** - Improving code without changing functionality\n- **CI/CD** - Continuous Integration / Continuous Deployment\n\n## Phrases to Remember\n- "We need to refactor this module"\n- "The deployment pipeline failed"\n- "Let\'s schedule a code review"',
        category: 'Vocabulary',
        tags: ['vocab', 'tech', 'important'],
        isPinned: true,
      },
      {
        title: '✅ Homework - Email Draft',
        content: '## Task: Write a professional email\n\nTo: manager@company.com\nSubject: Project Update - Sprint 3\n\nDear Sarah,\n\nI hope this email finds you well. I wanted to provide you with an update on our progress...\n\n**TODO:**\n- [ ] Complete the email body\n- [ ] Add specific metrics\n- [ ] Review tone and formality',
        category: 'Homework',
        tags: ['homework', 'email', 'business'],
        isPinned: true,
      },
      {
        title: '🎯 Interview Preparation Notes',
        content: '## Common Technical Interview Questions\n\n### Behavioral Questions\n- "Tell me about yourself"\n- "Describe a challenging project"\n- "How do you handle tight deadlines?"\n\n### Technical Discussion\n- Explain your tech stack\n- Discuss architecture decisions\n- Talk about testing approach\n\n### My Answers (Draft)\n**Tell me about yourself:**\n"I am a software developer with 3 years of experience..."',
        category: 'Interview',
        tags: ['interview', 'preparation', 'career'],
        isPinned: false,
      },
      {
        title: '📝 Meeting Phrases',
        content: '## Useful Meeting Phrases\n\n### Opening a Meeting\n- "Shall we get started?"\n- "Let\'s go through the agenda"\n- "As you can see from the slides..."\n\n### Asking for Clarification\n- "Could you elaborate on that?"\n- "I\'m not sure I follow, could you explain?"\n\n### Wrapping Up\n- "To summarize what we\'ve discussed..."\n- "Let\'s schedule a follow-up meeting"\n- "I\'ll send out the meeting minutes"',
        category: 'Vocabulary',
        tags: ['meetings', 'phrases', 'business'],
        isPinned: false,
      },
      {
        title: '🔤 Grammar - Conditional Sentences',
        content: '## Conditional Sentences in Business English\n\n### First Conditional (Real Future)\n- "If we deploy by Friday, we will meet the deadline"\n- "If the client approves, we\'ll start development"\n\n### Second Conditional (Hypothetical)\n- "If we had more resources, we could deliver faster"\n- "If I were the project manager, I would..."\n\n### Third Conditional (Past Regret)\n- "If we had tested more thoroughly, we wouldn\'t have had the bug"\n\n## Practice Exercises\nCreate 3 sentences for each conditional type related to your work.',
        category: 'Grammar',
        tags: ['grammar', 'conditionals', 'writing'],
        isPinned: false,
      },
    ];

    for (const note of notes) {
      await client.query(
        `INSERT INTO notes (user_id, title, content, category, tags, is_pinned)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, note.title, note.content, note.category, note.tags, note.isPinned]
      );
    }

    await client.query('COMMIT');
    console.log('✅ Seed completed successfully!');
    console.log('Demo credentials: demo@example.com / Demo1234!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
}

seed();
