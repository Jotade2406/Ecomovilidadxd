'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import {
  ArrowLeftRight, CheckCircle2, Clock, XCircle, Bus,
  Send, AlertTriangle, Loader2, RefreshCw, ChevronDown, MapPin,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────

interface Estudiante { id: string; nombre: string; }
interface Vehiculo   { id: string; placa: string; capacidad: number; estado: string; }

interface SolicitudCambioBus {
  id: string; estudianteId: string; busActualId: string; busDeseadoId: string;
  motivo: string; estado: string; fechaSolicitud: string; notas: string | null;
}

interface SolicitudEmergencia {
  id: string; estudianteId: string; descripcion: string; ubicacion: string;
  estado: string; fechaSolicitud: string; fechaAtencion: string | null;
}

const ADMIN_ROLES = ['Admin', 'AdminInstitucion'];

const ESTADO_META: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDIENTE: { label: 'Pendiente',  color: 'text-amber-400',   icon: Clock },
  APROBADA:  { label: 'Aprobada',   color: 'text-emerald-400', icon: CheckCircle2 },
  RECHAZADA: { label: 'Rechazada',  color: 'text-rose-400',    icon: XCircle },
  CANCELADA: { label: 'Cancelada',  color: 'text-slate-400',   icon: XCircle },
  ATENDIDA:  { label: 'Atendida',   color: 'text-emerald-400', icon: CheckCircle2 },
};

const MOTIVOS = [
  'El bus no pasó por mi parada',
  'Cambio de domicilio temporal',
  'Horario incompatible con mis clases',
  'Problemas de capacidad en mi bus actual',
  'Otro motivo',
];

function EstadoBadge({ estado }: { estado: string }) {
  const m = ESTADO_META[estado] ?? { label: estado, color: 'text-slate-400', icon: Clock };
  const Icon = m.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${m.color}`}>
      <Icon size={11} />{m.label}
    </span>
  );
}

// ─── Vista Admin ─────────────────────────────────────────────────────

function AdminView() {
  const [tab, setTab] = useState<'cambio' | 'emergencia'>('cambio');
  const [cambios, setCambios] = useState<SolicitudCambioBus[]>([]);
  const [emergencias, setEmergencias] = useState<SolicitudEmergencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [{ data: c }, { data: e }] = await Promise.all([
      api.get<SolicitudCambioBus[]>('/api/Solicitudes/cambio-bus'),
      api.get<SolicitudEmergencia[]>('/api/Solicitudes/emergencia'),
    ]);
    setCambios(c ?? []);
    setEmergencias(e ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleResolver = async (id: string, aprobada: boolean) => {
    setResolving(id);
    await api.patch(`/api/Solicitudes/cambio-bus/${id}/resolver`, {
      estado: aprobada ? 'APROBADA' : 'RECHAZADA',
      notas: aprobada ? 'Aprobado por el administrador' : 'Rechazado por el administrador',
    });
    await fetchAll();
    setResolving(null);
  };

  const handleAtender = async (id: string) => {
    setResolving(id);
    await api.patch(`/api/Solicitudes/emergencia/${id}/atender`, {});
    await fetchAll();
    setResolving(null);
  };

  return (
    <div className="h-full overflow-auto" style={{ background: 'var(--bg-base)' }}>
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-700/60 bg-slate-900/90 px-6 py-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-emerald-500/10 p-2">
            <ArrowLeftRight size={18} className="text-emerald-500" />
          </div>
          <div>
            <h1 className="text-[15px] font-bold text-slate-100">Solicitudes</h1>
            <p className="text-[12px] text-slate-500">Cambios de bus y emergencias</p>
          </div>
        </div>
        <button onClick={fetchAll} className="rounded-lg border border-slate-700 p-2 text-slate-400 hover:text-slate-200 transition">
          <RefreshCw size={14} />
        </button>
      </div>

      <div className="mx-auto max-w-3xl p-6 space-y-4">
        {/* Tabs */}
        <div className="flex gap-1 rounded-xl border border-slate-700/60 bg-slate-800/50 p-1">
          {[
            { key: 'cambio',     label: `Cambio de Bus (${cambios.length})` },
            { key: 'emergencia', label: `Emergencias (${emergencias.length})` },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key as typeof tab)}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${tab === key ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
          </div>
        ) : tab === 'cambio' ? (
          cambios.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-500">No hay solicitudes de cambio de bus</p>
          ) : (
            <div className="space-y-3">
              {cambios.map((s) => (
                <div key={s.id} className="rounded-xl border border-slate-700/40 bg-slate-800/40 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-slate-200">{s.motivo}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {new Date(s.fechaSolicitud).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                      {s.notas && <p className="mt-1 text-xs text-slate-400">Nota: {s.notas}</p>}
                    </div>
                    <EstadoBadge estado={s.estado} />
                  </div>
                  {s.estado === 'PENDIENTE' && (
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => handleResolver(s.id, true)} disabled={resolving === s.id}
                        className="flex-1 rounded-lg bg-emerald-600/20 py-2 text-xs font-medium text-emerald-400 hover:bg-emerald-600/30 transition disabled:opacity-50">
                        {resolving === s.id ? <Loader2 size={12} className="mx-auto animate-spin" /> : 'Aprobar'}
                      </button>
                      <button onClick={() => handleResolver(s.id, false)} disabled={resolving === s.id}
                        className="flex-1 rounded-lg bg-rose-500/10 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/20 transition disabled:opacity-50">
                        Rechazar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        ) : (
          emergencias.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-500">No hay solicitudes de emergencia</p>
          ) : (
            <div className="space-y-3">
              {emergencias.map((e) => (
                <div key={e.id} className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 text-rose-400 text-sm font-medium">
                        <AlertTriangle size={14} /> Emergencia
                      </div>
                      <p className="mt-1 text-sm text-slate-300">{e.descripcion}</p>
                      {e.ubicacion && (
                        <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                          <MapPin size={10} />{e.ubicacion}
                        </div>
                      )}
                      <p className="mt-1 text-xs text-slate-500">
                        {new Date(e.fechaSolicitud).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <EstadoBadge estado={e.estado} />
                  </div>
                  {e.estado === 'PENDIENTE' && (
                    <button onClick={() => handleAtender(e.id)} disabled={resolving === e.id}
                      className="mt-3 w-full rounded-lg bg-emerald-600/20 py-2 text-xs font-medium text-emerald-400 hover:bg-emerald-600/30 transition disabled:opacity-50">
                      {resolving === e.id ? <Loader2 size={12} className="mx-auto animate-spin" /> : 'Marcar como atendida'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

// ─── Vista Estudiante / Cliente ──────────────────────────────────────

function EstudianteView() {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [solicitudes, setSolicitudes] = useState<SolicitudCambioBus[]>([]);
  const [emergencias, setEmergencias] = useState<SolicitudEmergencia[]>([]);

  const [estudianteId, setEstudianteId] = useState('');
  const [esEmergencia, setEsEmergencia] = useState(false);
  const [busActualId, setBusActualId] = useState('');
  const [busDeseadoId, setBusDeseadoId] = useState('');
  const [motivo, setMotivo] = useState('');
  const [motivoCustom, setMotivoCustom] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get<Estudiante[]>('/api/Comunidad/estudiantes'),
      api.get<Vehiculo[]>('/api/Flota/vehiculos'),
      api.get<SolicitudCambioBus[]>('/api/Solicitudes/cambio-bus'),
      api.get<SolicitudEmergencia[]>('/api/Solicitudes/emergencia'),
    ]).then(([{ data: e }, { data: v }, { data: c }, { data: em }]) => {
      setEstudiantes(e ?? []);
      setVehiculos((v ?? []).filter((veh) => veh.estado !== 'INACTIVO'));
      setSolicitudes(c ?? []);
      setEmergencias(em ?? []);
    });
  }, []);

  const handleSubmit = async () => {
    setError('');
    if (!estudianteId) { setError('Selecciona un estudiante'); return; }
    setEnviando(true);
    if (esEmergencia) {
      if (!descripcion.trim()) { setError('Describe la emergencia'); setEnviando(false); return; }
      const { error: err } = await api.post('/api/Solicitudes/emergencia', {
        estudianteId, descripcion, ubicacion,
      });
      if (err) { setError(err); setEnviando(false); return; }
    } else {
      if (!busActualId || !busDeseadoId || !motivo) { setError('Completa todos los campos'); setEnviando(false); return; }
      const { error: err } = await api.post('/api/Solicitudes/cambio-bus', {
        estudianteId, busActualId, busDeseadoId,
        motivo: motivo === 'Otro motivo' ? motivoCustom : motivo,
      });
      if (err) { setError(err); setEnviando(false); return; }
    }
    setSuccess(esEmergencia ? '¡Emergencia reportada! El administrador la atenderá pronto.' : '¡Solicitud enviada! El administrador la revisará en las próximas 24 horas.');
    setEnviando(false);
  };

  if (success) {
    return (
      <div className="flex h-full items-center justify-center p-6" style={{ background: 'var(--bg-base)' }}>
        <div className="max-w-sm space-y-4 rounded-2xl border border-slate-700 bg-slate-800/80 p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
            <CheckCircle2 size={36} className="text-emerald-500" />
          </div>
          <h2 className="text-lg font-bold text-slate-100">¡Listo!</h2>
          <p className="text-sm text-slate-400">{success}</p>
          <button onClick={() => { setSuccess(''); setMotivo(''); setBusActualId(''); setBusDeseadoId(''); setDescripcion(''); setUbicacion(''); }}
            className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 transition">
            Nueva solicitud
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto" style={{ background: 'var(--bg-base)' }}>
      <div className="flex items-center gap-3 border-b border-slate-700/60 bg-slate-900/90 px-6 py-4">
        <div className="rounded-lg bg-emerald-500/10 p-2">
          <ArrowLeftRight size={18} className="text-emerald-500" />
        </div>
        <div>
          <h1 className="text-[15px] font-bold text-slate-100">Cambio de Bus</h1>
          <p className="text-[12px] text-slate-500">Solicita un cambio o bus de emergencia</p>
        </div>
      </div>

      <div className="mx-auto max-w-xl space-y-5 p-6">
        {/* Toggle emergencia */}
        <button onClick={() => setEsEmergencia(!esEmergencia)}
          className={`flex w-full items-center gap-3 rounded-xl border p-4 transition ${esEmergencia ? 'border-rose-500/40 bg-rose-500/8' : 'border-slate-700/60 bg-slate-800/50'}`}
        >
          <div className={`rounded-lg p-2 ${esEmergencia ? 'bg-rose-500/15' : 'bg-slate-700/50'}`}>
            <AlertTriangle size={16} className={esEmergencia ? 'text-rose-400' : 'text-slate-400'} />
          </div>
          <div className="flex-1 text-left">
            <p className={`text-sm font-semibold ${esEmergencia ? 'text-rose-400' : 'text-slate-200'}`}>Bus de Emergencia</p>
            <p className="text-xs text-slate-500">Activa si el bus te dejó o hubo una falla</p>
          </div>
          <div className={`relative h-5 w-10 rounded-full transition ${esEmergencia ? 'bg-rose-500' : 'bg-slate-700'}`}>
            <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${esEmergencia ? 'left-5' : 'left-0.5'}`} />
          </div>
        </button>

        {/* Selector estudiante */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-400">Estudiante</label>
          <div className="relative">
            <select value={estudianteId} onChange={(e) => setEstudianteId(e.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-200 outline-none focus:border-emerald-500/60">
              <option value="">Seleccionar estudiante…</option>
              {estudiantes.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-3.5 text-slate-500" />
          </div>
        </div>

        {esEmergencia ? (
          <>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Descripción de la emergencia</label>
              <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
                placeholder="¿Qué pasó? El bus no llegó, hubo un accidente..." rows={3}
                className="w-full resize-none rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-200 outline-none focus:border-rose-500/60" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Ubicación actual</label>
              <input value={ubicacion} onChange={(e) => setUbicacion(e.target.value)}
                placeholder="Av. Banzer y 4to Anillo..."
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-200 outline-none focus:border-rose-500/60" />
            </div>
          </>
        ) : (
          <>
            {/* Bus actual */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Bus actual</label>
              <div className="relative">
                <select value={busActualId} onChange={(e) => setBusActualId(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-200 outline-none focus:border-emerald-500/60">
                  <option value="">Seleccionar bus actual…</option>
                  {vehiculos.map((v) => <option key={v.id} value={v.id}>{v.placa} (cap. {v.capacidad})</option>)}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-3 top-3.5 text-slate-500" />
              </div>
            </div>
            {/* Bus deseado */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Bus al que quiero cambiarme</label>
              <div className="relative">
                <select value={busDeseadoId} onChange={(e) => setBusDeseadoId(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-200 outline-none focus:border-emerald-500/60">
                  <option value="">Seleccionar bus deseado…</option>
                  {vehiculos.filter((v) => v.id !== busActualId).map((v) => (
                    <option key={v.id} value={v.id}>{v.placa} (cap. {v.capacidad})</option>
                  ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-3 top-3.5 text-slate-500" />
              </div>
            </div>
            {/* Motivo */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Motivo</label>
              <div className="space-y-1.5">
                {MOTIVOS.map((m) => (
                  <button key={m} type="button" onClick={() => setMotivo(m)}
                    className={`w-full rounded-xl border px-4 py-2.5 text-left text-sm transition ${motivo === m ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'}`}>
                    {m}
                  </button>
                ))}
              </div>
              {motivo === 'Otro motivo' && (
                <textarea value={motivoCustom} onChange={(e) => setMotivoCustom(e.target.value)}
                  placeholder="Describe el motivo..." rows={2}
                  className="mt-2 w-full resize-none rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-200 outline-none focus:border-emerald-500/60" />
              )}
            </div>
          </>
        )}

        {error && <p className="text-xs text-rose-400">{error}</p>}

        <button onClick={handleSubmit} disabled={enviando}
          className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition disabled:opacity-50 ${esEmergencia ? 'bg-rose-600 hover:bg-rose-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}>
          {enviando ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
          {enviando ? 'Enviando…' : esEmergencia ? 'Reportar Emergencia' : 'Enviar Solicitud'}
        </button>

        {/* Historial */}
        {(solicitudes.length > 0 || emergencias.length > 0) && (
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-500">Solicitudes recientes</p>
            <div className="space-y-2">
              {solicitudes.slice(0, 5).map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-xl border border-slate-700/40 bg-slate-800/30 px-4 py-3">
                  <div>
                    <p className="text-sm text-slate-300">{s.motivo}</p>
                    <p className="text-xs text-slate-500">{new Date(s.fechaSolicitud).toLocaleDateString('es-BO')}</p>
                  </div>
                  <EstadoBadge estado={s.estado} />
                </div>
              ))}
              {emergencias.slice(0, 3).map((e) => (
                <div key={e.id} className="flex items-center justify-between rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3">
                  <div>
                    <div className="flex items-center gap-1 text-xs text-rose-400">
                      <AlertTriangle size={10} /> Emergencia
                    </div>
                    <p className="text-sm text-slate-300">{e.descripcion}</p>
                  </div>
                  <EstadoBadge estado={e.estado} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════

export default function BusChangeRequestView() {
  const { user } = useAuth();
  if (ADMIN_ROLES.includes(user?.role ?? '')) return <AdminView />;
  return <EstudianteView />;
}
