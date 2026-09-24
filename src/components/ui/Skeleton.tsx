import React from 'react';
import { cn } from '../../utils/cn';

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn('animate-pulse rounded-md bg-slate-700/50', className)} {...props} />
);

export const SkeletonLine: React.FC<{ className?: string }> = ({ className }) => (
  <Skeleton className={cn('h-4 w-full', className)} />
);

export const SkeletonCard: React.FC = () => (
  <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 space-y-4">
    <Skeleton className="h-6 w-1/3" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
  </div>
);
