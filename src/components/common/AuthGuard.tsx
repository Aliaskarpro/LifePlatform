import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useLifeStore } from '../../store/lifeStore';

interface AuthGuardProps {
  children?: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading, initAuth } = useAuthStore();
  const isLifeDataLoaded = useLifeStore((s) => s.isLoaded);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  if (isLoading || (isAuthenticated && !isLifeDataLoaded)) {
    return <div className="flex h-screen w-screen items-center justify-center bg-slate-900 text-white">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
