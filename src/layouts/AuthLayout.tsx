import React from 'react';

export const AuthLayout: React.FC<{children: React.ReactNode}> = ({ children }) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-slate-800/50 p-8 shadow-2xl border border-slate-700/50 backdrop-blur-sm">
        {children}
      </div>
    </div>
  );
};
