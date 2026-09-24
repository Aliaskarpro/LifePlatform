export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  role: 'student' | 'teacher' | 'admin';
  subscription_tier: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Level {
  id: string;
  name: string;
  code: string;
  description: string;
  order_index: number;
  min_lessons_required: number;
  created_at: Date;
}

export interface UserProgress {
  id: string;
  user_id: string;
  level_id: string;
  completed_lessons: number;
  total_study_time: number;
  current_xp: number;
  created_at: Date;
  updated_at: Date;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  level_id: string;
  total_lessons: number;
  cover_image?: string;
  is_published: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string;
  content: string;
  duration_minutes: number;
  order_index: number;
  materials?: any;
  homework?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ScheduleEntry {
  id: string;
  user_id: string;
  lesson_id?: string;
  title: string;
  description?: string;
  teacher_name?: string;
  level_id?: string;
  start_time: Date;
  end_time: Date;
  location?: string;
  meeting_url?: string;
  lesson_type: string;
  status: string;
  color?: string;
  created_at: Date;
  updated_at: Date;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  status: string;
  completed_at?: Date;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Note {
  id: string;
  user_id: string;
  schedule_id?: string;
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  is_pinned: boolean;
  created_at: Date;
  updated_at: Date;
}

import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}
