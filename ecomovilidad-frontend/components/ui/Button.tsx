'use client';

import { type ReactNode, type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  children: ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary: 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/15 hover:bg-emerald-500 active:scale-[0.97]',
  secondary: 'ring-1 ring-[var(--border)] hover:bg-[var(--bg-hover)] active:scale-[0.97]',
  danger: 'bg-red-600/90 text-white hover:bg-red-500 active:scale-[0.97]',
  ghost: 'hover:bg-[var(--bg-hover)] active:scale-[0.97]',
};

const sizeStyles: Record<Size, string> = {
  sm: 'min-h-[32px] px-2.5 py-1 text-[12px] gap-1.5',
  md: 'min-h-[40px] px-4 py-2 text-[13px] gap-2',
  lg: 'min-h-[48px] px-5 py-2.5 text-[14px] gap-2',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon, iconRight, children,
  disabled, className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center font-medium rounded-lg
        transition-all duration-150 select-none
        disabled:opacity-40 disabled:pointer-events-none
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      style={{
        color: variant === 'primary' || variant === 'danger' ? undefined : 'var(--text-secondary)',
      }}
      {...props}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : icon}
      {children}
      {iconRight}
    </button>
  );
}
