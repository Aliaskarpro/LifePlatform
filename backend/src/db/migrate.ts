import { pool } from './pool';

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Enable uuid-ossp for uuid generation
    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    // Create levels table
    await client.query(`
      CREATE TABLE IF NOT EXISTS levels (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        order_index INT NOT NULL,
        min_lessons_required INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        avatar_url VARCHAR(255),
        role VARCHAR(50) DEFAULT 'student',
        subscription_tier VARCHAR(50) DEFAULT 'free',
        is_active BOOLEAN DEFAULT true,
        reset_token VARCHAR(255),
        reset_token_expires TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Create user_progress table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        level_id UUID REFERENCES levels(id) ON DELETE SET NULL,
        completed_lessons INT DEFAULT 0,
        total_study_time INT DEFAULT 0,
        current_xp INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id)
      );
    `);

    // Create courses table
    await client.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        level_id UUID REFERENCES levels(id) ON DELETE SET NULL,
        teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
        total_lessons INT DEFAULT 0,
        cover_image VARCHAR(255),
        is_published BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Create lessons table
    await client.query(`
      CREATE TABLE IF NOT EXISTS lessons (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        content TEXT,
        duration_minutes INT DEFAULT 0,
        order_index INT NOT NULL,
        materials JSONB,
        homework TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Create schedule table
    await client.query(`
      CREATE TABLE IF NOT EXISTS schedule (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        teacher_name VARCHAR(255),
        level_id UUID REFERENCES levels(id) ON DELETE SET NULL,
        start_time TIMESTAMPTZ NOT NULL,
        end_time TIMESTAMPTZ NOT NULL,
        location VARCHAR(255),
        meeting_url VARCHAR(255),
        lesson_type VARCHAR(50) DEFAULT 'lesson',
        status VARCHAR(50) DEFAULT 'planned',
        color VARCHAR(50),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Create lesson_progress table
    await client.query(`
      CREATE TABLE IF NOT EXISTS lesson_progress (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'planned',
        completed_at TIMESTAMPTZ,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, lesson_id)
      );
    `);

    // Create notes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        schedule_id UUID REFERENCES schedule(id) ON DELETE SET NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        category VARCHAR(100),
        tags TEXT[],
        is_pinned BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Create sessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Create notifications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        message TEXT,
        type VARCHAR(50),
        is_read BOOLEAN DEFAULT false,
        data JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Create indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_courses_level_id ON courses(level_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_courses_teacher_id ON courses(teacher_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_schedule_user_id ON schedule(user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_id ON lesson_progress(user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);`);
    
    // Insert default levels if they don't exist
    await client.query(`
      INSERT INTO levels (name, code, description, order_index, min_lessons_required)
      VALUES 
        ('Beginner', 'A1', 'Beginner Level', 1, 10),
        ('Elementary', 'A2', 'Elementary Level', 2, 15),
        ('Pre-Intermediate', 'B1', 'Pre-Intermediate Level', 3, 20),
        ('Intermediate', 'B1+', 'Intermediate Level', 4, 25),
        ('Upper-Intermediate', 'B2', 'Upper-Intermediate Level', 5, 30),
        ('Advanced', 'C1', 'Advanced Level', 6, 40)
      ON CONFLICT (code) DO NOTHING;
    `);

    await client.query('COMMIT');
    console.log('Migration successful');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
  } finally {
    client.release();
    pool.end();
  }
}

migrate();
