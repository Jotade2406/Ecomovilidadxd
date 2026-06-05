'use client';

import { type ReactNode } from 'react';
import { useTheme } from '@/context/ThemeContext';

type V = 'default' | 'success' | 'error' | 'warning' | 'info';

interface BadgeProps { children: ReactNode; variant?: V; className?: string; }

const dk: Record<V, string> = {
  default: 'bg-gray-500/15 text-gray-400 ring-gray-500/20',
  success: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/20',
  error: 'bg-red-500/15 text-red-400 ring-red-500/20',
  warning: 'bg-amber-500/15 text-amber-400 ring-amber-500/20',
  info: 'bg-sky-500/15 text-sky-400 ring-sky-500/20',
};

const lt: Record<V, string> = {
  default: 'bg-gray-100 text-gray-600 ring-gray-200',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  error: 'bg-red-50 text-red-700 ring-red-200',
  warning: 'bg-amber-50 text-amber-700 ring-amber-200',
  info: 'bg-sky-50 text-sky-700 ring-sky-200',
};

export default function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const { isDark } = useTheme();
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-px text-[10px] font-semibold ring-1 leading-snug ${isDark ? dk[variant] : lt[variant]} ${className}`}>
      {children}
    </span>
  );
}
