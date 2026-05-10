'use client';

import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

// Input — CSS variable driven, no isDark needed
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-') || 'field'}`;
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-label={label || props['aria-label']}
          className={`w-full rounded-lg h-[44px] px-3 text-[14px] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${className}`}
          style={{
            background: 'var(--bg-base)',
            border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'var(--border)'}`,
            color: 'var(--text-primary)',
          }}
          {...props}
        />
        {error && <p className="text-[11px] text-red-400 mt-0.5">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
