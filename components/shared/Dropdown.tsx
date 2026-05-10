'use client';

import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

export interface DropdownItem {
  value: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
}

interface DropdownProps {
  label?: string;
  placeholder?: string;
  items: DropdownItem[];
  value: string | null;
  onChange: (value: string) => void;
  className?: string;
}

export default function Dropdown({ label, placeholder = 'Seleccionar...', items, value, onChange, className = '' }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = items.find((i) => i.value === value);

  const onOutside = useCallback((e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
  }, []);
  const onKey = useCallback((e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); }, []);

  useEffect(() => {
    if (open) { document.addEventListener('mousedown', onOutside); document.addEventListener('keydown', onKey); }
    return () => { document.removeEventListener('mousedown', onOutside); document.removeEventListener('keydown', onKey); };
  }, [open, onOutside, onKey]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      {label && <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</label>}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-2 rounded-lg h-[44px] px-3 text-[14px] text-left transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
        style={{ background: 'var(--bg-base)', border: `1px solid ${open ? 'var(--primary)' : 'var(--border)'}`, color: selected ? 'var(--text-primary)' : 'var(--text-muted)' }}
      >
        <span className="truncate">
          {selected ? (
            <span className="flex items-center gap-2">{selected.icon}{selected.label}</span>
          ) : placeholder}
        </span>
        <ChevronDown size={14} className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} style={{ color: 'var(--text-muted)' }} />
      </button>

      {open && (
        <div
          className="absolute z-50 mt-1 w-full rounded-lg py-1 shadow-xl max-h-60 overflow-y-auto animate-fade-in-scale"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          {items.length === 0 ? (
            <div className="px-3 py-2.5 text-[13px]" style={{ color: 'var(--text-muted)' }}>Sin opciones</div>
          ) : (
            items.map((item) => (
              <button
                key={item.value}
                disabled={item.disabled}
                onClick={() => { onChange(item.value); setOpen(false); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-left transition-colors duration-100"
                style={{
                  color: item.disabled ? 'var(--text-muted)' : item.value === value ? 'var(--primary)' : 'var(--text-secondary)',
                  background: item.value === value ? 'var(--primary-glow)' : 'transparent',
                }}
                onMouseEnter={(e) => { if (item.value !== value) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                onMouseLeave={(e) => { if (item.value !== value) e.currentTarget.style.background = 'transparent'; }}
              >
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                <span className="truncate">{item.label}</span>
                {item.value === value && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
