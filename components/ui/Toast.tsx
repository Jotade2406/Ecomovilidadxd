'use client';

import { useEffect, useState } from 'react';
import { useNotificacionContext, type Notificacion } from '@/context/NotificacionContext';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const iconMap = {
  success: <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />,
  error: <XCircle size={18} className="text-red-400 shrink-0" />,
  warning: <AlertTriangle size={18} className="text-amber-400 shrink-0" />,
  info: <Info size={18} className="text-sky-400 shrink-0" />,
};

const bgMap = {
  success: 'bg-emerald-500/10 ring-emerald-500/25 border-emerald-500/20',
  error: 'bg-red-500/10 ring-red-500/25 border-red-500/20',
  warning: 'bg-amber-500/10 ring-amber-500/25 border-amber-500/20',
  info: 'bg-sky-500/10 ring-sky-500/25 border-sky-500/20',
};

function ToastItem({ notif, onDismiss }: { notif: Notificacion; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(onDismiss, 300);
  };

  return (
    <div
      className={`
        flex items-start gap-3 rounded-xl px-4 py-3 ring-1 border backdrop-blur-md shadow-xl
        transition-all duration-300 ease-out min-w-[320px] max-w-[420px]
        ${bgMap[notif.type]}
        ${visible && !exiting ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}
      `}
    >
      {iconMap[notif.type]}
      <p className="flex-1 text-sm text-slate-200 leading-snug">{notif.message}</p>
      <button
        onClick={handleDismiss}
        className="shrink-0 rounded-md p-0.5 text-slate-500 hover:text-slate-300 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const { notificaciones, dismissNotificacion } = useNotificacionContext();

  if (notificaciones.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2">
      {notificaciones.map((n) => (
        <ToastItem key={n.id} notif={n} onDismiss={() => dismissNotificacion(n.id)} />
      ))}
    </div>
  );
}
