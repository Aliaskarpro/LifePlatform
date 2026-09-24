import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useLifeStore } from './store/lifeStore';
import { AuthGuard } from './components/common/AuthGuard';
import { MainLayout } from './layouts/MainLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { CalendarPage } from './pages/CalendarPage';
import { HealthPage } from './pages/HealthPage';
import { MedicalCardPage } from './pages/MedicalCardPage';
import { SleepPage } from './pages/SleepPage';
import { WorkoutsPage } from './pages/WorkoutsPage';
import { HabitsPage } from './pages/HabitsPage';
import { GoalsPage } from './pages/GoalsPage';
import { StatisticsPage } from './pages/StatisticsPage';
import { NotesPage } from './pages/NotesPage';
import { FinancePage } from './pages/FinancePage';
import { AccountPage } from './pages/AccountPage';
import { SchedulePage } from './pages/SchedulePage';
import { ClassesPage } from './pages/ClassesPage';
import { LessonDetailPage } from './pages/LessonDetailPage';
import { ToastContainer } from './components/ui/Toast';

export default function App() {
  const initAuth = useAuthStore((s) => s.initAuth);
  const theme = useLifeStore((s) => s.theme);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        document.documentElement.setAttribute('data-theme', 'light');
      }
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        <Route
          path="/login"
          element={
            <AuthLayout>
              <LoginPage />
            </AuthLayout>
          }
        />
        <Route
          path="/register"
          element={
            <AuthLayout>
              <RegisterPage />
            </AuthLayout>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <AuthLayout>
              <ForgotPasswordPage />
            </AuthLayout>
          }
        />

        <Route
          path="/"
          element={
            <AuthGuard>
              <MainLayout />
            </AuthGuard>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="health" element={<HealthPage />} />
          <Route path="medical-card" element={<MedicalCardPage />} />
          <Route path="sleep" element={<SleepPage />} />
          <Route path="workouts" element={<WorkoutsPage />} />
          <Route path="habits" element={<HabitsPage />} />
          <Route path="goals" element={<GoalsPage />} />
          <Route path="statistics" element={<StatisticsPage />} />
          <Route path="analytics" element={<Navigate to="/statistics" replace />} />
          <Route path="notes" element={<NotesPage />} />
          <Route path="finance" element={<FinancePage />} />
          <Route path="account" element={<AccountPage />} />

          {/* Backward compatibility routes */}
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="classes" element={<ClassesPage />} />
          <Route path="classes/:id" element={<LessonDetailPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
