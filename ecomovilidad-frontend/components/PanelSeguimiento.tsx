'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useUbicacionEnVivo } from '@/hooks/useUbicacionEnVivo';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import {
  Navigation, MapPin, Users, Clock, Wifi, WifiOff,
  ChevronDown, ChevronUp, Bus, Route
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────

interface ViajeDto {
  id: string;
  rutaId: string;
  vehiculoId: string;
  conductorId: string;
  estado: string;
  fechaInicio: string | null;
  fechaFin: string | null;
  creadoEn: string;
}

interface EstudianteEnViajeDto {
  id: string;
  estudianteId: string;
  nombreEstudiante: string;
  paradaAsignada: string;
  estado: string;
}

// ═══════════════════════════════════════════════════════════════════
// PANEL SEGUIMIENTO EN VIVO
// ═══════════════════════════════════════════════════════════════════

export default function PanelSeguimiento() {
  const [viajes, setViajes] = useState<ViajeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [viajeActivo, setViajeActivo] = useState<ViajeDto | null>(null);
  const [estudiantes, setEstudiantes] = useState<EstudianteEnViajeDto[]>([]);
  const [showEstudiantes, setShowEstudiantes] = useState(false);

  // WebSocket tracking
  const { ubicacion, conectado } = useUbicacionEnVivo(viajeActivo?.id ?? null);

  // Cargar viajes
  const cargarViajes = useCallback(async () => {
    setLoading(true);
    const { data } = await api.get<ViajeDto[]>('/api/Viajes');
    if (data) {
      setViajes(data);
      // Auto-seleccionar el primer viaje EnCurso
      const enCurso = data.find(v => v.estado === 'EnCurso');
      if (enCurso && !viajeActivo) setViajeActivo(enCurso);
    }
    setLoading(false);
  }, [viajeActivo]);

  useEffect(() => { cargarViajes(); }, [cargarViajes]);

  // Cargar estudiantes del viaje activo
  useEffect(() => {
    if (!viajeActivo) return;
    api.get<EstudianteEnViajeDto[]>(`/api/Viajes/${viajeActivo.id}/estudiantes`)
      .then(({ data }) => { if (data) setEstudiantes(data); });
  }, [viajeActivo]);

  const viajesEnCurso = viajes.filter(v => v.estado === 'EnCurso');

  return (
    <div className="flex flex-col gap-3">
      {/* Status WebSocket */}
      <div className="flex items-center gap-2 rounded-lg bg-slate-900/50 px-3 py-2">
        {conectado ? (
          <>
            <Wifi size={12} className="text-emerald-400" />
            <span className="text-[11px] text-emerald-400 font-medium">Tiempo real activo</span>
          </>
        ) : (
          <>
            <WifiOff size={12} className="text-slate-500" />
            <span className="text-[11px] text-slate-500 font-medium">Sin conexión en vivo</span>
          </>
        )}
      </div>

      {/* Viajes en curso */}
      {loading ? (
        [1, 2].map(i => (
          <div key={i} className="h-[60px] animate-pulse rounded-xl bg-slate-900/70" />
        ))
      ) : viajesEnCurso.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-center">
          <Bus size={28} className="mb-2 text-slate-700" />
          <p className="text-sm text-slate-500">Sin viajes en curso</p>
          <p className="mt-1 text-[11px] text-slate-600">Inicia un viaje para hacer seguimiento</p>
        </div>
      ) : (
        viajesEnCurso.map(v => (
          <Card
            key={v.id}
            interactive
            padding="sm"
            className={viajeActivo?.id === v.id ? 'ring-emerald-500/40' : ''}
          >
            <button
              onClick={() => setViajeActivo(v)}
              className="w-full text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-sm font-semibold text-slate-200">Viaje en curso</p>
                </div>
                <Badge variant="success">EnCurso</Badge>
              </div>
              {v.fechaInicio && (
                <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
                  <Clock size={10} />
                  Iniciado: {new Date(v.fechaInicio).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </button>
          </Card>
        ))
      )}

      {/* Detalle viaje activo */}
      {viajeActivo && (
        <Card padding="md" className="mt-1">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
            Detalle del viaje
          </h4>

          {/* Ubicación en vivo */}
          {ubicacion && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 mb-3">
              <Navigation size={12} className="text-emerald-400" />
              <span className="text-xs text-emerald-300">
                {ubicacion.lat.toFixed(5)}, {ubicacion.lon.toFixed(5)}
              </span>
            </div>
          )}

          {/* Estudiantes toggle */}
          <button
            onClick={() => setShowEstudiantes(!showEstudiantes)}
            className="flex w-full items-center justify-between rounded-lg bg-slate-950/50 px-3 py-2 text-sm text-slate-300 hover:bg-slate-950 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Users size={14} className="text-sky-400" />
              Estudiantes ({estudiantes.length})
            </span>
            {showEstudiantes ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showEstudiantes && estudiantes.length > 0 && (
            <div className="mt-2 space-y-1.5">
              {estudiantes.map(e => (
                <div key={e.id} className="flex items-center justify-between rounded-lg bg-slate-950/40 px-3 py-2">
                  <div>
                    <p className="text-xs font-medium text-slate-300">{e.nombreEstudiante}</p>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1">
                      <MapPin size={8} /> {e.paradaAsignada}
                    </p>
                  </div>
                  <Badge
                    variant={
                      e.estado === 'DESCENDIDO' ? 'success'
                        : e.estado === 'EN_TRANSPORTE' ? 'info'
                        : e.estado === 'AUSENTE' ? 'error'
                        : 'default'
                    }
                  >
                    {e.estado}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
