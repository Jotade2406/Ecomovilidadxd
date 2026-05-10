'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

// ─── Types ──────────────────────────────────────────────────────────

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notificacion {
  id: string;
  message: string;
  type: NotificationType;
  duration: number;
}

interface NotificacionContextValue {
  notificaciones: Notificacion[];
  showNotificacion: (message: string, type?: NotificationType, duration?: number) => void;
  dismissNotificacion: (id: string) => void;
}

// ─── Context ────────────────────────────────────────────────────────

const NotificacionContext = createContext<NotificacionContextValue | undefined>(undefined);

export function NotificacionProvider({ children }: { children: ReactNode }) {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);

  const showNotificacion = useCallback(
    (message: string, type: NotificationType = 'info', duration: number = 5000) => {
      const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const notif: Notificacion = { id, message, type, duration };

      setNotificaciones((prev) => [...prev, notif]);

      // Auto-dismiss
      if (duration > 0) {
        setTimeout(() => {
          setNotificaciones((prev) => prev.filter((n) => n.id !== id));
        }, duration);
      }
    },
    []
  );

  const dismissNotificacion = useCallback((id: string) => {
    setNotificaciones((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <NotificacionContext.Provider
      value={{ notificaciones, showNotificacion, dismissNotificacion }}
    >
      {children}
    </NotificacionContext.Provider>
  );
}

export function useNotificacionContext(): NotificacionContextValue {
  const ctx = useContext(NotificacionContext);
  if (!ctx) throw new Error('useNotificacionContext debe usarse dentro de <NotificacionProvider>');
  return ctx;
}
