const fs = require('fs');
const path = require('path');

const root = path.join(__dirname);

const dirs = [
  'public/icons',
  'src/types',
  'src/config',
  'src/services',
  'src/store',
  'src/hooks',
  'src/utils',
  'src/layouts',
  'src/components/ui',
  'src/components/dashboard',
  'src/components/calendar',
  'src/components/schedule',
  'src/components/notes',
  'src/components/classes',
  'src/components/statistics',
  'src/components/account',
  'src/components/common',
  'src/pages/auth'
];

dirs.forEach(d => fs.mkdirSync(path.join(root, d), { recursive: true }));

const files = {
  'tsconfig.node.json': `{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}`,
  'postcss.config.js': `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`,
  '.env.example': `VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
VITE_APP_NAME=EduPlatform`,
  'index.html': `<!DOCTYPE html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <meta name="theme-color" content="#0f172a" />
    <title>EduPlatform</title>
  </head>
  <body class="bg-background text-text antialiased">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
  'public/manifest.json': `{
  "name": "EduPlatform",
  "short_name": "EduPlatform",
  "description": "Modern Learning Management System",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#6366f1",
  "orientation": "portrait-primary",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}`,
  'src/index.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-slate-900 text-slate-100;
  }
}
`,
  'src/utils/cn.ts': `import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}`,
  'src/main.tsx': `import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)`,
  'src/types/index.ts': `export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  role: 'student' | 'teacher' | 'admin';
  subscriptionTier: 'free' | 'premium' | 'enterprise';
  createdAt: string;
}

export interface Level {
  id: string;
  name: string;
  code: string;
  description: string;
  orderIndex: number;
  minLessonsRequired: number;
}

export interface UserProgress {
  levelId: string;
  levelName: string;
  levelCode: string;
  completedLessons: number;
  totalStudyTime: number;
  currentXp: number;
  progressPercent: number;
  nextLevel?: Level;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  levelId: string;
  levelName?: string;
  totalLessons: number;
  coverImage?: string;
  isPublished: boolean;
  completedLessons?: number;
}

export interface Lesson {
  id: string;
  courseId: string;
  courseTitle?: string;
  title: string;
  description: string;
  content: string;
  durationMinutes: number;
  orderIndex: number;
  materials?: Material[];
  homework?: string;
  status?: LessonStatus;
  completedAt?: string;
}

export type LessonStatus = 'planned' | 'in_progress' | 'completed' | 'missed';

export interface Material {
  type: 'pdf' | 'video' | 'link' | 'doc';
  title: string;
  url: string;
}

export interface ScheduleEntry {
  id: string;
  userId: string;
  lessonId?: string;
  title: string;
  description?: string;
  teacherName?: string;
  levelId?: string;
  levelName?: string;
  startTime: string;
  endTime: string;
  location?: string;
  meetingUrl?: string;
  lessonType: 'lesson' | 'exam' | 'consultation' | 'self_study';
  status: 'planned' | 'in_progress' | 'completed' | 'missed' | 'cancelled';
  color?: string;
}

export interface Note {
  id: string;
  userId: string;
  scheduleId?: string;
  title: string;
  content: string;
  category?: string;
  tags: string[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Statistics {
  totalLessons: number;
  completedLessons: number;
  missedLessons: number;
  plannedLessons: number;
  completionRate: number;
  totalStudyTime: number;
  weeklyData: WeeklyData[];
  monthlyData: MonthlyData[];
}

export interface WeeklyData {
  week: string;
  completed: number;
  missed: number;
  planned: number;
}

export interface MonthlyData {
  month: string;
  completed: number;
  missed: number;
  planned: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}`,
  'src/config/api.ts': `export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
export const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';`
};

Object.entries(files).forEach(([file, content]) => {
  fs.writeFileSync(path.join(root, file), content);
});

console.log('Setup basic files completed.');
