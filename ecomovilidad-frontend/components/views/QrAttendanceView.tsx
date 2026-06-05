'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { ROLES } from '@/lib/navigation';
import {
  QrCode, CheckCircle2, Clock, Users, Loader2,
  RefreshCw, ChevronDown, MapPin, Scan,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────

interface Viaje {
  id: string; rutaId: string; vehiculoId: string; conductorId: string;
  estado: string; nombreRuta: string; placaVehiculo: string; nombreConductor: string;
}

interface EstudianteEnViaje {
  id: string; viajeId: string; estudianteId: string; nombreEstudiante: string;
  paradaAsignada: string; estado: string;
}

interface Asistencia {
  id: string; estudianteId: string; nombreEstudiante: string;
  viajeId: string; tipo: 'IDA' | 'VUELTA'; horaRegistro: string; codigoQrEscaneado: string;
}

// ─── QR Visual (decorativo pero convincente) ─────────────────────────

function QrPlaceholder({ value, size = 168 }: { value: string; size?: number }) {
  const seed = value.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const cells = Array.from({ length: 49 }, (_, i) => ((seed * (i + 1) * 37) % 100) > 45);
  const cell = Math.floor((size - 24) / 7);

  return (
    <div className="inline-flex flex-col items-center">
      <div className="rounded-2xl p-3" style={{ background: '#FFFFFF', border: '4px solid #111827' }}>
        <div className="relative" style={{ width: size, height: size }}>
          {/* Finder patterns */}
          {[{ top: 0, left: 0 }, { top: 0, right: 0 }, { bottom: 0, left: 0 }].map((pos, i) => (
            <div key={i} className="absolute flex items-center justify-center rounded-md"
              style={{ width: cell * 3, height: cell * 3, border: `${cell * 0.4}px solid #111827`, ...pos }}>
              <div className="rounded-sm" style={{ width: cell, height: cell, background: '#111827' }} />
            </div>
          ))}
          {/* Data cells */}
          <div className="absolute grid gap-[2px]" style={{ top: cell * 3 + 2, left: cell * 3 + 2, right: 0, bottom: 0, gridTemplateColumns: `repeat(7, ${cell}px)` }}>
            {cells.map((filled, i) => (
              <div key={i} className="rounded-[1px]" style={{ width: cell, height: cell, background: filled ? '#111827' : 'transparent' }} />
            ))}
          </div>
          {/* Brand center */}
          <div className="absolute flex items-center justify-center rounded-lg" style={{ bottom: 6, right: 6, width: cell * 2.2, height: cell * 2.2, background: '#10B981' }}>
            <span className="font-black text-white" style={{ fontSize: cell * 0.9 }}>E</span>
          </div>
        </div>
      </div>
      <p className="mt-2 font-mono text-[10px] tracking-widest text-slate-500">{value.slice(0, 16)}</p>
    </div>
  );
}

// ─── Vista Chofer / Admin — Registrar asistencia ─────────────────────

function ChoferView() {
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [selectedViajeId, setSelectedViajeId] = useState('');
  const [estudiantes, setEstudiantes] = useState<EstudianteEnViaje[]>([]);
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [loadingViajes, setLoadingViajes] = useState(true);
  const [loadingEstudiantes, setLoadingEstudiantes] = useState(false);
  const [marking, setMarking] = useState<string | null>(null);

  // Fetch active trips
  useEffect(() => {
    api.get<Viaje[]>('/api/Viajes').then(({ data }) => {
      const activos = (data ?? []).filter((v) => v.estado === 'EnCurso');
      setViajes(activos);
      if (activos.length === 1) setSelectedViajeId(activos[0].id);
      setLoadingViajes(false);
    });
  }, []);

  const loadEstudiantes = useCallback(async (viajeId: string) => {
    setLoadingEstudiantes(true);
    const [{ data: est }, { data: asist }] = await Promise.all([
      api.get<EstudianteEnViaje[]>(`/api/Viajes/${viajeId}/estudiantes`),
      api.get<Asistencia[]>(`/api/Asistencia/viaje/${viajeId}`),
    ]);
    setEstudiantes(est ?? []);
    setAsistencias(asist ?? []);
    setLoadingEstudiantes(false);
  }, []);

  useEffect(() => {
    if (selectedViajeId) loadEstudiantes(selectedViajeId);
    else { setEstudiantes([]); setAsistencias([]); }
  }, [selectedViajeId, loadEstudiantes]);

  const selectedViaje = viajes.find((v) => v.id === selectedViajeId);

  const asistenciaDe = (estudianteId: string) =>
    asistencias.filter((a) => a.estudianteId === estudianteId);

  const tieneIda    = (id: string) => asistenciaDe(id).some((a) => a.tipo === 'IDA');
  const tieneVuelta = (id: string) => asistenciaDe(id).some((a) => a.tipo === 'VUELTA');

  const handleMarcar = async (est: EstudianteEnViaje, tipo: 'IDA' | 'VUELTA') => {
    if (!selectedViaje) return;
    const key = `${est.estudianteId}-${tipo}`;
    setMarking(key);
    await api.post('/api/Asistencia', {
      estudianteId: est.estudianteId,
      viajeId: selectedViajeId,
      conductorId: selectedViaje.conductorId,
      tipo,
      codigoQrEscaneado: `QR-${est.estudianteId.slice(0, 8)}`,
    });
    await loadEstudiantes(selectedViajeId);
    setMarking(null);
  };

  return (
    <div className="h-full overflow-auto" style={{ background: 'var(--bg-base)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-700/60 bg-slate-900/90 px-6 py-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-emerald-500/10 p-2">
            <Scan size={18} className="text-emerald-500" />
          </div>
          <div>
            <h1 className="text-[15px] font-bold text-slate-100">Marcar Asistencia</h1>
            <p className="text-[12px] text-slate-500">Registro de IDA y VUELTA por viaje</p>
          </div>
        </div>
        {selectedViajeId && (
          <button onClick={() => loadEstudiantes(selectedViajeId)}
            className="rounded-lg border border-slate-700 p-2 text-slate-400 hover:text-slate-200 transition">
            <RefreshCw size={14} />
          </button>
        )}
      </div>

      <div className="mx-auto max-w-2xl space-y-5 p-6">
        {/* Selector de viaje */}
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
            Viaje en curso
          </label>
          {loadingViajes ? (
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <Loader2 size={14} className="animate-spin" /> Cargando viajes…
            </div>
          ) : viajes.length === 0 ? (
            <div className="rounded-xl border border-slate-700/60 bg-slate-800/30 px-4 py-6 text-center">
              <Radio size={28} className="mx-auto mb-2 text-slate-600" />
              <p className="text-sm text-slate-500">No hay viajes en curso ahora</p>
              <p className="mt-1 text-xs text-slate-600">Inicia un viaje desde Asignaciones</p>
            </div>
          ) : (
            <div className="relative">
              <select value={selectedViajeId} onChange={(e) => setSelectedViajeId(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-200 outline-none focus:border-emerald-500/60">
                <option value="">Seleccionar viaje…</option>
                {viajes.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.nombreRuta ?? 'Sin ruta'} · {v.placaVehiculo ?? 'Sin vehículo'} · {v.nombreConductor ?? 'Sin conductor'}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3 top-3.5 text-slate-500" />
            </div>
          )}
        </div>

        {/* Lista de estudiantes */}
        {selectedViajeId && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Asignados', value: estudiantes.length, icon: Users, color: 'text-slate-400' },
                { label: 'Con IDA', value: estudiantes.filter((e) => tieneIda(e.estudianteId)).length, icon: CheckCircle2, color: 'text-emerald-400' },
                { label: 'Con VUELTA', value: estudiantes.filter((e) => tieneVuelta(e.estudianteId)).length, icon: CheckCircle2, color: 'text-blue-400' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="rounded-xl border border-slate-700/60 bg-slate-800/50 p-3 text-center">
                  <Icon size={16} className={`mx-auto mb-1 ${color}`} />
                  <p className="text-xl font-bold text-slate-200">{value}</p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              ))}
            </div>

            {/* Student rows */}
            {loadingEstudiantes ? (
              <div className="flex h-32 items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
              </div>
            ) : estudiantes.length === 0 ? (
              <div className="rounded-xl border border-slate-700/60 bg-slate-800/30 px-4 py-8 text-center text-sm text-slate-500">
                No hay estudiantes asignados a este viaje
              </div>
            ) : (
              <div className="space-y-2">
                {estudiantes.map((est) => {
                  const ida    = tieneIda(est.estudianteId);
                  const vuelta = tieneVuelta(est.estudianteId);
                  return (
                    <div key={est.id} className="flex items-center gap-3 rounded-xl border border-slate-700/40 bg-slate-800/40 px-4 py-3">
                      {/* Avatar */}
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-sm font-semibold text-emerald-400">
                        {est.nombreEstudiante?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-slate-200">{est.nombreEstudiante}</p>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <MapPin size={10} />{est.paradaAsignada ?? '—'}
                        </div>
                      </div>
                      {/* Botones IDA / VUELTA */}
                      <div className="flex shrink-0 gap-2">
                        <button onClick={() => handleMarcar(est, 'IDA')} disabled={ida || marking === `${est.estudianteId}-IDA`}
                          className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${ida ? 'bg-emerald-500/15 text-emerald-400 cursor-default' : 'bg-slate-700 text-slate-300 hover:bg-emerald-600/20 hover:text-emerald-400'} disabled:opacity-60`}
                        >
                          {marking === `${est.estudianteId}-IDA` ? <Loader2 size={11} className="animate-spin" /> : ida ? '✓ IDA' : 'IDA'}
                        </button>
                        <button onClick={() => handleMarcar(est, 'VUELTA')} disabled={vuelta || marking === `${est.estudianteId}-VUELTA`}
                          className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${vuelta ? 'bg-blue-500/15 text-blue-400 cursor-default' : 'bg-slate-700 text-slate-300 hover:bg-blue-600/20 hover:text-blue-400'} disabled:opacity-60`}
                        >
                          {marking === `${est.estudianteId}-VUELTA` ? <Loader2 size={11} className="animate-spin" /> : vuelta ? '✓ VUELTA' : 'VUELTA'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Vista Estudiante / Cliente — Mi QR ─────────────────────────────

function EstudianteView() {
  const { user } = useAuth();
  const qrCode = user?.email ?? 'ECO-ESTUDIANTE';

  return (
    <div className="h-full overflow-auto" style={{ background: 'var(--bg-base)' }}>
      <div className="flex items-center gap-3 border-b border-slate-700/60 bg-slate-900/90 px-6 py-4">
        <div className="rounded-lg bg-emerald-500/10 p-2">
          <QrCode size={18} className="text-emerald-500" />
        </div>
        <div>
          <h1 className="text-[15px] font-bold text-slate-100">Mi QR de Asistencia</h1>
          <p className="text-[12px] text-slate-500">Muéstralo al conductor al subir al bus</p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 p-8">
        {/* QR Card */}
        <div className="w-full max-w-xs rounded-2xl border border-slate-700/60 bg-slate-800/50 p-6 text-center shadow-xl shadow-black/20">
          <p className="mb-4 text-xs font-medium uppercase tracking-wider text-slate-500">Tu código personal</p>
          <div className="flex justify-center">
            <QrPlaceholder value={qrCode} size={200} />
          </div>
          <div className="mt-4 rounded-xl bg-slate-900/60 px-4 py-3">
            <p className="text-xs text-slate-500">Usuario</p>
            <p className="mt-0.5 text-sm font-medium text-slate-200">{user?.email}</p>
          </div>
        </div>

        {/* Instrucciones */}
        <div className="w-full max-w-xs space-y-3">
          {[
            { icon: Scan,          text: 'Muestra este QR al conductor al abordar',    color: 'text-emerald-400' },
            { icon: CheckCircle2,  text: 'Se registra tu asistencia IDA y VUELTA',     color: 'text-blue-400'    },
            { icon: Clock,         text: 'El historial se guarda automáticamente',     color: 'text-amber-400'   },
          ].map(({ icon: Icon, text, color }) => (
            <div key={text} className="flex items-start gap-3 rounded-xl border border-slate-700/40 bg-slate-800/30 px-4 py-3">
              <Icon size={16} className={`mt-0.5 shrink-0 ${color}`} />
              <p className="text-sm text-slate-400">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Placeholder icon for empty trip state ───────────────────────────
function Radio({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" /><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" />
      <circle cx="12" cy="12" r="2" /><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5" /><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19" />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════

export default function QrAttendanceView() {
  const { user } = useAuth();
  const role = user?.role ?? '';

  if (role === ROLES.CHOFER || role === ROLES.ADMIN || role === ROLES.ADMIN_INSTITUCION) {
    return <ChoferView />;
  }
  return <EstudianteView />;
}
