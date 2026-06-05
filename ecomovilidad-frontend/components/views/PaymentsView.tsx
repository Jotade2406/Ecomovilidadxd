'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  CreditCard, CheckCircle2, Clock, AlertCircle,
  Plus, X, Loader2, RefreshCw, ChevronDown,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────

interface Pago {
  id: string;
  estudianteId: string;
  nombreEstudiante: string;
  tipoPlan: 'MENSUAL' | 'ANUAL';
  estado: 'PENDIENTE' | 'PAGADO' | 'VENCIDO';
  monto: number;
  fechaVencimiento: string;
  fechaPago: string | null;
  referenciaPago: string | null;
  fechaCreacion: string;
}

interface Estudiante { id: string; nombre: string; }

const ESTADO_META = {
  PENDIENTE: { label: 'Pendiente', color: 'text-amber-400',  bg: 'bg-amber-500/10 ring-amber-500/30',   icon: Clock },
  PAGADO:    { label: 'Pagado',    color: 'text-emerald-400', bg: 'bg-emerald-500/10 ring-emerald-500/30', icon: CheckCircle2 },
  VENCIDO:   { label: 'Vencido',  color: 'text-rose-400',    bg: 'bg-rose-500/10 ring-rose-500/30',      icon: AlertCircle },
};

const ADMIN_ROLES = ['Admin', 'AdminInstitucion'];

// ─── Sub-components ──────────────────────────────────────────────────

function EstadoBadge({ estado }: { estado: Pago['estado'] }) {
  const m = ESTADO_META[estado];
  const Icon = m.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${m.bg} ${m.color}`}>
      <Icon size={10} />
      {m.label}
    </span>
  );
}

// ─── Create Modal ───────────────────────────────────────────────────

function CreateModal({
  onClose, onCreated,
}: { onClose: () => void; onCreated: () => void }) {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [estudianteId, setEstudianteId] = useState('');
  const [tipoPlan, setTipoPlan] = useState<'MENSUAL' | 'ANUAL'>('MENSUAL');
  const [monto, setMonto] = useState('120.00');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<Estudiante[]>('/api/Comunidad/estudiantes').then(({ data }) => {
      if (data) setEstudiantes(data);
    });
    // Default due date: last day of current month
    const d = new Date();
    d.setMonth(d.getMonth() + 1, 0);
    setFechaVencimiento(d.toISOString().split('T')[0]);
  }, []);

  const handlePlan = (plan: 'MENSUAL' | 'ANUAL') => {
    setTipoPlan(plan);
    setMonto(plan === 'MENSUAL' ? '120.00' : '1200.00');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!estudianteId) { setError('Selecciona un estudiante'); return; }
    setSaving(true);
    const { error: err } = await api.post('/api/Pagos', {
      estudianteId, tipoPlan, monto: parseFloat(monto), fechaVencimiento,
    });
    if (err) { setError(err); setSaving(false); return; }
    onCreated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
          <h3 className="text-base font-semibold text-slate-100">Nuevo pago</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {/* Estudiante */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Estudiante</label>
            <div className="relative">
              <select
                value={estudianteId}
                onChange={(e) => setEstudianteId(e.target.value)}
                className="w-full appearance-none rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-500/60"
              >
                <option value="">Seleccionar estudiante…</option>
                {estudiantes.map((e) => (
                  <option key={e.id} value={e.id}>{e.nombre}</option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3 top-3 text-slate-500" />
            </div>
          </div>

          {/* Plan */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Tipo de plan</label>
            <div className="grid grid-cols-2 gap-2">
              {(['MENSUAL', 'ANUAL'] as const).map((p) => (
                <button key={p} type="button" onClick={() => handlePlan(p)}
                  className={`rounded-lg border py-2.5 text-sm font-medium transition ${tipoPlan === p ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'}`}
                >
                  {p === 'MENSUAL' ? 'Mensual' : 'Anual'}
                </button>
              ))}
            </div>
          </div>

          {/* Monto */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Monto (Bs.)</label>
            <input type="number" step="0.01" value={monto} onChange={(e) => setMonto(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-500/60"
            />
          </div>

          {/* Fecha vencimiento */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Fecha de vencimiento</label>
            <input type="date" value={fechaVencimiento} onChange={(e) => setFechaVencimiento(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-500/60"
            />
          </div>

          {error && <p className="text-xs text-rose-400">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-lg border border-slate-700 py-2.5 text-sm text-slate-400 hover:text-slate-200">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60">
              {saving ? <Loader2 size={16} className="mx-auto animate-spin" /> : 'Crear pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Confirm Modal ──────────────────────────────────────────────────

function ConfirmModal({
  pago, onClose, onConfirmed,
}: { pago: Pago; onClose: () => void; onConfirmed: () => void }) {
  const [referencia, setReferencia] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referencia.trim()) { setError('Ingresa la referencia de pago'); return; }
    setSaving(true);
    const { error: err } = await api.patch(`/api/Pagos/${pago.id}/confirmar`, { referenciaPago: referencia });
    if (err) { setError(err); setSaving(false); return; }
    onConfirmed();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
          <h3 className="text-base font-semibold text-slate-100">Confirmar pago</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-3 text-sm">
            <p className="text-slate-300 font-medium">{pago.nombreEstudiante}</p>
            <p className="text-slate-500 mt-0.5">{pago.tipoPlan} · Bs. {Number(pago.monto).toFixed(2)}</p>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Referencia de pago</label>
            <input value={referencia} onChange={(e) => setReferencia(e.target.value)}
              placeholder="N° de transacción / recibo"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-500/60"
            />
          </div>
          {error && <p className="text-xs text-rose-400">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-lg border border-slate-700 py-2.5 text-sm text-slate-400 hover:text-slate-200">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60">
              {saving ? <Loader2 size={16} className="mx-auto animate-spin" /> : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export default function PaymentsView() {
  const { user } = useAuth();
  const isAdmin = ADMIN_ROLES.includes(user?.role ?? '');

  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [showCreate, setShowCreate] = useState(false);
  const [confirmPago, setConfirmPago] = useState<Pago | null>(null);
  const [venciendoId, setVenciendoId] = useState<string | null>(null);

  const fetchPagos = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await api.get<Pago[]>('/api/Pagos');
    if (err || !data) { setError(err ?? 'Error al cargar pagos'); }
    else { setPagos(data); setError(null); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchPagos(); }, [fetchPagos]);

  const handleVencer = async (id: string) => {
    setVenciendoId(id);
    await api.patch(`/api/Pagos/${id}/vencer`, {});
    await fetchPagos();
    setVenciendoId(null);
  };

  const filtered = filterEstado === 'todos'
    ? pagos
    : pagos.filter((p) => p.estado === filterEstado);

  const totalPagado   = pagos.filter((p) => p.estado === 'PAGADO').reduce((a, p) => a + Number(p.monto), 0);
  const totalPendiente = pagos.filter((p) => p.estado === 'PENDIENTE').reduce((a, p) => a + Number(p.monto), 0);
  const countPendiente = pagos.filter((p) => p.estado === 'PENDIENTE').length;

  return (
    <div className="h-full overflow-auto" style={{ background: 'var(--bg-base)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-700/60 bg-slate-900/90 px-6 py-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-emerald-500/10 p-2">
            <CreditCard size={18} className="text-emerald-500" />
          </div>
          <div>
            <h1 className="text-[15px] font-bold text-slate-100">Pagos</h1>
            <p className="text-[12px] text-slate-500">
              {isAdmin ? 'Gestión de pagos del tenant' : 'Historial y pagos pendientes'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchPagos} className="rounded-lg border border-slate-700 p-2 text-slate-400 hover:text-slate-200 transition">
            <RefreshCw size={14} />
          </button>
          {isAdmin && (
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 transition">
              <Plus size={14} /> Nuevo pago
            </button>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-5 p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-700/60 bg-slate-800/50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Cobrado</p>
            <p className="mt-2 text-2xl font-black text-emerald-400">Bs. {totalPagado.toFixed(2)}</p>
            <p className="mt-0.5 text-xs text-slate-500">{pagos.filter((p) => p.estado === 'PAGADO').length} pagos</p>
          </div>
          <div className={`rounded-xl border p-4 ${countPendiente > 0 ? 'border-amber-500/30 bg-amber-500/5' : 'border-slate-700/60 bg-slate-800/50'}`}>
            <p className="text-xs uppercase tracking-wide text-slate-500">Por cobrar</p>
            <p className={`mt-2 text-2xl font-black ${countPendiente > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
              Bs. {totalPendiente.toFixed(2)}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">{countPendiente} pendiente{countPendiente !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Filtro */}
        <div className="flex gap-2">
          {['todos', 'PENDIENTE', 'PAGADO', 'VENCIDO'].map((f) => (
            <button key={f} onClick={() => setFilterEstado(f)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${filterEstado === f ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
            >
              {f === 'todos' ? 'Todos' : ESTADO_META[f as keyof typeof ESTADO_META]?.label ?? f}
            </button>
          ))}
        </div>

        {/* Lista */}
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
          </div>
        ) : error ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2 text-slate-500">
            <p>{error}</p>
            <button onClick={fetchPagos} className="text-sm text-emerald-500 hover:underline">Reintentar</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-slate-500 text-sm">
            No hay pagos para mostrar
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-700/60">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-700/60 bg-slate-800/80">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-400">Estudiante</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-400">Plan</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-400">Monto</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-400">Estado</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-400">Vence</th>
                  {isAdmin && <th className="px-4 py-3 text-right font-medium text-slate-400">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40 bg-slate-800/30">
                {filtered.map((p) => (
                  <tr key={p.id} className="transition hover:bg-slate-700/20">
                    <td className="px-4 py-3 font-medium text-slate-200">{p.nombreEstudiante}</td>
                    <td className="px-4 py-3 text-slate-400">{p.tipoPlan === 'MENSUAL' ? 'Mensual' : 'Anual'}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-200">
                      Bs. {Number(p.monto).toFixed(2)}
                    </td>
                    <td className="px-4 py-3"><EstadoBadge estado={p.estado} /></td>
                    <td className="px-4 py-3 text-slate-400">{p.fechaVencimiento?.split('T')[0] ?? '—'}</td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-right">
                        {p.estado === 'PENDIENTE' && (
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => setConfirmPago(p)}
                              className="rounded-lg bg-emerald-600/20 px-2.5 py-1 text-xs font-medium text-emerald-400 hover:bg-emerald-600/30 transition">
                              Confirmar
                            </button>
                            <button onClick={() => handleVencer(p.id)} disabled={venciendoId === p.id}
                              className="rounded-lg bg-slate-700 px-2.5 py-1 text-xs font-medium text-slate-400 hover:bg-slate-600 transition disabled:opacity-50">
                              {venciendoId === p.id ? '…' : 'Vencer'}
                            </button>
                          </div>
                        )}
                        {p.estado === 'PAGADO' && (
                          <span className="text-xs text-slate-600">Ref: {p.referenciaPago ?? '—'}</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreate && (
        <CreateModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); fetchPagos(); }} />
      )}
      {confirmPago && (
        <ConfirmModal pago={confirmPago} onClose={() => setConfirmPago(null)} onConfirmed={() => { setConfirmPago(null); fetchPagos(); }} />
      )}
    </div>
  );
}
