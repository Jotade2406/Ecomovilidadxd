'use client';

import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

const pad = { sm: 'p-3', md: 'p-4', lg: 'p-5' };

export default function Card({ children, className = '', interactive = false, padding = 'md' }: CardProps) {
  return (
    <div
      className={`rounded-xl ${pad[padding]} ${interactive ? 'cursor-pointer transition-all duration-150 hover:-translate-y-[1px]' : ''} ${className}`}
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        boxShadow: interactive ? '0 1px 3px var(--shadow-color)' : undefined,
      }}
    >
      {children}
    </div>
  );
}
