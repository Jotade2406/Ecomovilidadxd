'use client';

import { useEffect, useState, useCallback, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
}

// Modal — Glassmorphism + spring animation
export default function Modal({ open, onClose, title, children, footer, maxWidth = 'max-w-md' }: ModalProps) {
  const [visible, setVisible] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (open) {
      setVisible(true);
      requestAnimationFrame(() => { requestAnimationFrame(() => setAnimate(true)); });
    } else {
      setAnimate(false);
      const t = setTimeout(() => setVisible(false), 250);
      return () => clearTimeout(t);
    }
  }, [open]);

  const onKey = useCallback((e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }, [onClose]);

  useEffect(() => {
    if (open) { document.addEventListener('keydown', onKey); document.body.style.overflow = 'hidden'; }
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open, onKey]);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className={`fixed inset-0 z-[9990] flex items-center justify-center p-4 transition-all duration-250 ${
        animate ? 'bg-black/60' : 'bg-black/0'
      }`}
      style={{ backdropFilter: animate ? 'blur(4px)' : 'none' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={`w-full ${maxWidth} rounded-2xl shadow-2xl transition-all duration-250 ease-out ${
          animate ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-3 scale-[0.96] opacity-0'
        }`}
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          boxShadow: '0 0 0 1px var(--primary-glow), 0 24px 48px var(--shadow-color)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 className="text-[16px] font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
          <button onClick={onClose} className="p-1 rounded-md transition-colors" style={{ color: 'var(--text-muted)' }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto px-5 py-4">{children}</div>

        {/* Footer */}
        {footer && <div className="px-5 py-3.5" style={{ borderTop: '1px solid var(--border-subtle)' }}>{footer}</div>}
      </div>
    </div>
  );
}
