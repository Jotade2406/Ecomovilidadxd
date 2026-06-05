'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useViajeActual, type ViajeDto } from '@/hooks/useViajeActual';
import { useUbicacionEnVivo } from '@/hooks/useUbicacionEnVivo';
import { useTheme, TILE_LAYERS } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { enviar } from '@/lib/stompClient';
import Badge from '@/components/ui/Badge';
import Dropdown from '@/components/shared/Dropdown';
import {
  Wifi, WifiOff, Bus, MapPin, Users, Navigation,
  Phone, User, Radio, AlertTriangle, Loader2, RefreshCw,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Play,
} from 'lucide-react';

const LeafletMap = dynamic(() => import('./LeafletMap'), { ssr: false });

type LL = [number, number];

const estadoVariant = (e: string) => {
  if (e === 'EnCurso') return 'success' as const;
  if (e === 'Programado') return 'info' as const;
  if (e === 'Cancelado') return 'error' as const;
  return 'default' as const;
};
const estEstVariant = (e: string) => {
  if (e === 'EN_TRANSPORTE') return 'info' as const;
  if (e === 'DESCENDIDO') return 'success' as const;
  if (e === 'AUSENTE') return 'error' as const;
  return 'default' as const;
};

export default function EnVivoTab() {
  const { viajes, viajeActivo, estudiantes, loading, error, seleccionarViaje, recargar } =
    useViajeActual();
  const { ubicacion, conectado } = useUbicacionEnVivo(viajeActivo?.id ?? null);
  const { isDark, theme } = useTheme();
  const { user } = useAuth();
  const tileLayer = TILE_LAYERS[theme];

  const isChofer = user?.role === 'Chofer';

  const [panelOpen, setPanelOpen] = useState(true);
  const [showEst, setShowEst] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const [broadcasting, setBroadcasting] = useState(false);
  const [markingEst, setMarkingEst] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const gpsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [simulating, setSimulating] = useState(false);
  const simulIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [simPos, setSimPos] = useState<LL | null>(null);

  // Ruta en mapa
  const [rutaData, setRutaData] = useState<{
    origen: LL;
    destino: LL;
    puntos: LL[];
    color: string;
  } | null>(null);

  // Estado del conductor
  const [miConductorId, setMiConductorId] = useState<string | null>(null);
  const [miAsignacion, setMiAsignacion] = useState<{ rutaId: string; vehiculoId: string; conductorId: string } | null>(null);
  const [iniciando, setIniciando] = useState(false);
  const [iniciarError, setIniciarError] = useState<string | null>(null);

  // GPS broadcast para Chofer
  const broadcastGPS = useCallback(() => {
    if (!viajeActivo?.id) return;
    navigator.geolocation?.getCurrentPosition((pos) => {
      enviar(`/app/ubicacion/${viajeActivo.id}`, {
        viajeId: viajeActivo.id,
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
        timestamp: new Date().toISOString(),
      });
    });
  }, [viajeActivo]);

  useEffect(() => {
    if (!broadcasting || !viajeActivo) return;
    broadcastGPS();
    gpsIntervalRef.current = setInterval(broadcastGPS, 5000);
    return () => {
      if (gpsIntervalRef.current) clearInterval(gpsIntervalRef.current);
    };
  }, [broadcasting, viajeActivo, broadcastGPS]);

  // GPS simulado: interpolación suave directamente en el estado local (no requiere WebSocket)
  const handleSimular = useCallback(() => {
    if (simulating) {
      clearInterval(simulIntervalRef.current!);
      simulIntervalRef.current = null;
      setSimulating(false);
      setSimPos(null);
      return;
    }
    if (!rutaData) return;

    // Interpolar N pasos entre cada par de puntos consecutivos
    const STEPS = 40;
    const interpolated: LL[] = [];
    for (let i = 0; i < rutaData.puntos.length - 1; i++) {
      const [lat1, lon1] = rutaData.puntos[i];
      const [lat2, lon2] = rutaData.puntos[i + 1];
      for (let s = 0; s <= STEPS; s++) {
        const t = s / STEPS;
        interpolated.push([lat1 + (lat2 - lat1) * t, lon1 + (lon2 - lon1) * t]);
      }
    }

    let idx = 0;
    setSimulating(true);
    simulIntervalRef.current = setInterval(() => {
      if (idx >= interpolated.length) {
        clearInterval(simulIntervalRef.current!);
        simulIntervalRef.current = null;
        setSimulating(false);
        setSimPos(null);
        return;
      }
      setSimPos([...interpolated[idx]] as LL);
      idx++;
    }, 250); // 250 ms por paso → ~10 s por segmento de ruta
  }, [simulating, rutaData]);

  // Limpiar simulación al desmontar o cambiar viaje
  useEffect(() => {
    return () => {
      if (simulIntervalRef.current) clearInterval(simulIntervalRef.current);
    };
  }, [viajeActivo?.id]);

  // Cargar ruta del viaje activo para dibujarla en el mapa
  useEffect(() => {
    if (!viajeActivo?.rutaId) { setRutaData(null); return; }
    api.get<{
      origen: { latitud: number; longitud: number };
      destino: { latitud: number; longitud: number };
      puntosIntermedios: Array<{ latitud: number; longitud: number }>;
      color: string;
    }>(`/api/Rutas/${viajeActivo.rutaId}`).then(({ data }) => {
      if (!data) return;
      setRutaData({
        origen: [data.origen.latitud, data.origen.longitud],
        destino: [data.destino.latitud, data.destino.longitud],
        puntos: [
          [data.origen.latitud, data.origen.longitud],
          ...data.puntosIntermedios.map((p): LL => [p.latitud, p.longitud]),
          [data.destino.latitud, data.destino.longitud],
        ],
        color: data.color ?? '#10b981',
      });
    });
  }, [viajeActivo?.rutaId]);

  // Cargar perfil y asignación del conductor
  useEffect(() => {
    if (!isChofer) return;
    api.get<{ id: string; nombre: string; licencia: string; turnos: string }>('/api/Flota/conductores/mi-perfil')
      .then(({ data }) => { if (data) setMiConductorId(data.id); });
  }, [isChofer]);

  useEffect(() => {
    if (!miConductorId) return;
    api.get<Array<{ rutaId: string; vehiculoId: string; conductorId: string; estado: string }>>('/api/Asignaciones/activas')
      .then(({ data }) => {
        if (data) {
          const mia = data.find((a) => a.conductorId === miConductorId) ?? null;
          setMiAsignacion(mia);
        }
      });
  }, [miConductorId]);

  const handleIniciarViaje = async () => {
    if (!miAsignacion) return;
    setIniciando(true);
    setIniciarError(null);
    const { error: apiErr } = await api.post('/api/Viajes/iniciar', {
      rutaId: miAsignacion.rutaId,
      vehiculoId: miAsignacion.vehiculoId,
      conductorId: miAsignacion.conductorId,
    });
    if (apiErr) {
      setIniciarError(apiErr);
    } else {
      await recargar();
    }
    setIniciando(false);
  };

  const handleMarcarEstudiante = async (
    estudianteId: string,
    action: 'transporte' | 'descendido'
  ) => {
    if (!viajeActivo) return;
    setMarkingEst(`${estudianteId}-${action}`);
    await api.patch(`/api/Viajes/${viajeActivo.id}/estudiantes/${estudianteId}/${action}`, {});
    await recargar();
    setLastUpdated(new Date());
    setMarkingEst(null);
  };

  // Carga inicial
  useEffect(() => {
    recargar().then(() => setLastUpdated(new Date()));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps


  // Polling de datos cuando no hay WebSocket activo
  useEffect(() => {
    if (conectado || !viajeActivo) return;
    const i = setInterval(async () => {
      await recargar();
      setLastUpdated(new Date());
    }, 5000);
    return () => clearInterval(i);
  }, [conectado, viajeActivo, recargar]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await recargar();
    setLastUpdated(new Date());
    setMapKey((p) => p + 1);
    setRefreshing(false);
  };

  const viajeItems = useMemo(
    () =>
      viajes.map((v) => ({
        value: v.id,
        label: `${v.estado === 'EnCurso' ? '🟢 ' : ''}${v.placaVehiculo ?? 'Viaje'} — ${
          v.estado
        } ${
          v.fechaInicio
            ? new Date(v.fechaInicio).toLocaleTimeString('es-BO', {
                hour: '2-digit',
                minute: '2-digit',
              })
            : ''
        }`,
        icon:
          v.estado === 'EnCurso' ? (
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          ) : undefined,
      })),
    [viajes]
  );

  const abordo = estudiantes.filter((e) => e.estado === 'EN_TRANSPORTE').length;
  const total = estudiantes.length;
  const busPos: LL | null = simPos ?? (ubicacion ? [ubicacion.lat, ubicacion.lon] : null);

  // Indicador de conexión
  const ConexionIndicador = () => {
    if (conectado) {
      return (
        <>
          <Wifi size={13} className="text-emerald-500" />
          <span className="text-[11px] text-emerald-500 font-medium">Tiempo real activo</span>
        </>
      );
    }
    if (viajeActivo) {
      return (
        <>
          <RefreshCw size={13} className="text-amber-400 animate-spin" />
          <span className="text-[11px] text-amber-400 font-medium">
            Actualizando{' '}
            {lastUpdated
              ? `· ${lastUpdated.toLocaleTimeString('es-BO', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}`
              : '…'}
          </span>
        </>
      );
    }
    return (
      <>
        <WifiOff size={13} style={{ color: 'var(--text-muted)' }} />
        <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
          Sin viaje activo
        </span>
      </>
    );
  };

  return (
    <div className="relative flex h-full">
      {/* ═══════════ PANEL ═══════════ */}
      <div
        className="relative shrink-0 flex flex-col overflow-hidden"
        style={{
          width: panelOpen ? 340 : 0,
          transition: 'width 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          borderRight: panelOpen ? '1px solid var(--border)' : 'none',
        }}
      >
        <div
          className="flex flex-col h-full w-[340px] overflow-y-auto"
          style={{ background: 'var(--bg-surface)' }}
        >
          <div className="p-4 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2
                className="text-[15px] font-semibold flex items-center gap-2"
                style={{ color: 'var(--text-primary)' }}
              >
                <Radio size={16} className="text-emerald-500" />
                En Vivo
              </h2>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                title="Actualizar"
                className="p-1.5 rounded-md transition-all disabled:opacity-50"
                style={{ color: 'var(--text-muted)' }}
              >
                <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              </button>
            </div>

            {/* Indicador de conexión */}
            <div
              className="flex items-center gap-2 rounded-lg px-3 py-2"
              style={{
                background: isDark ? 'var(--bg-base)' : 'var(--bg-hover)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <ConexionIndicador />
            </div>

            {/* Selector de viaje */}
            <Dropdown
              label="Viaje"
              placeholder="Elegir un viaje..."
              items={viajeItems}
              value={viajeActivo?.id ?? null}
              onChange={(val) => {
                const v = viajes.find((x) => x.id === val);
                if (v) seleccionarViaje(v);
              }}
            />
          </div>

          <div className="h-px" style={{ background: 'var(--border-subtle)' }} />

          {/* Contenido del panel */}
          <div className="flex-1 p-4">
            {loading ? (
              <div className="flex flex-col items-center py-10 gap-2">
                <Loader2 size={20} className="animate-spin text-emerald-500" />
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  Cargando viajes...
                </p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center py-10 text-center gap-2">
                <AlertTriangle size={28} className="text-amber-500" />
                <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                  Error al cargar
                </p>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  {error}
                </p>
                <button
                  onClick={handleRefresh}
                  className="text-[11px] font-medium text-emerald-500 hover:text-emerald-400 flex items-center gap-1"
                >
                  <RefreshCw size={10} /> Reintentar
                </button>
              </div>
            ) : !viajeActivo ? (
              <div className="flex flex-col items-center py-10 text-center gap-2">
                <Bus size={28} style={{ color: 'var(--text-muted)' }} />
                <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                  {viajes.length === 0
                    ? 'No hay viajes registrados'
                    : 'Selecciona un viaje para seguimiento'}
                </p>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  {viajes.length > 0
                    ? `${viajes.length} viaje(s) disponibles en el selector`
                    : isChofer && miAsignacion
                      ? 'Tienes una asignación activa — inicia el viaje'
                      : 'Inicia un viaje desde Asignaciones'}
                </p>
                {isChofer && miAsignacion && (
                  <button
                    onClick={handleIniciarViaje}
                    disabled={iniciando}
                    className="mt-2 flex items-center gap-2 rounded-lg px-4 py-2 text-[12px] font-semibold text-white transition-all active:scale-95 disabled:opacity-60"
                    style={{ background: 'var(--primary)' }}
                  >
                    {iniciando ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
                    {iniciando ? 'Iniciando…' : 'Iniciar Viaje'}
                  </button>
                )}
                <button
                  onClick={handleRefresh}
                  className="mt-1 text-[11px] font-medium text-emerald-500 hover:text-emerald-400 flex items-center gap-1"
                >
                  <RefreshCw size={10} /> Actualizar
                </button>
              </div>
            ) : (
              <div className="space-y-3 animate-fade-in">
                {/* Estado del viaje */}
                <div className="flex items-center gap-2">
                  {viajeActivo.estado === 'EnCurso' && (
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                  <h3
                    className="text-[14px] font-semibold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Viaje{' '}
                    {viajeActivo.estado === 'EnCurso'
                      ? 'en curso'
                      : viajeActivo.estado.toLowerCase()}
                  </h3>
                  <div className="ml-auto">
                    <Badge variant={estadoVariant(viajeActivo.estado)}>
                      {viajeActivo.estado}
                    </Badge>
                  </div>
                </div>

                {/* Vehículo */}
                <div className="flex items-center gap-3">
                  <span className="text-lg">🚌</span>
                  <div>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      Vehículo
                    </p>
                    <p
                      className="text-[13px] font-medium"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {viajeActivo.placaVehiculo || 'Sin placa'}
                    </p>
                  </div>
                </div>

                {/* Conductor */}
                <div className="flex items-center gap-3">
                  <User size={16} style={{ color: 'var(--text-muted)' }} />
                  <div>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      Conductor
                    </p>
                    <p
                      className="text-[13px] font-medium"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {viajeActivo.nombreConductor || 'Sin asignar'}
                    </p>
                    {viajeActivo.telefonoConductor && (
                      <p
                        className="flex items-center gap-1 text-[10px]"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <Phone size={9} /> {viajeActivo.telefonoConductor}
                      </p>
                    )}
                  </div>
                </div>

                {/* Posición GPS en vivo */}
                {ubicacion && (
                  <div
                    className="rounded-lg px-3 py-2"
                    style={{ background: isDark ? 'var(--bg-base)' : 'var(--bg-hover)' }}
                  >
                    <div className="flex items-center gap-1.5">
                      <Navigation size={11} className="text-emerald-500" />
                      <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                        {ubicacion.lat.toFixed(5)}, {ubicacion.lon.toFixed(5)}
                      </span>
                    </div>
                    <p className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {new Date(ubicacion.timestamp).toLocaleTimeString('es-BO')}
                    </p>
                  </div>
                )}

                {/* Conteo estudiantes */}
                <div
                  className="flex items-center justify-between rounded-lg px-3 py-2"
                  style={{ background: isDark ? 'var(--bg-base)' : 'var(--bg-hover)' }}
                >
                  <span
                    className="flex items-center gap-1.5 text-[11px]"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <Users size={13} className="text-sky-400" /> Estudiantes a bordo
                  </span>
                  <span className="text-[13px] font-bold text-sky-400">
                    {abordo}/{total}
                  </span>
                </div>

                {/* Toggle lista de estudiantes */}
                <button
                  onClick={() => setShowEst(!showEst)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-[12px] transition-colors"
                  style={{
                    background: isDark ? 'var(--bg-base)' : 'var(--bg-hover)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <span className="flex items-center gap-1.5">
                    <Users size={13} className="text-sky-400" /> Ver estudiantes ({total})
                  </span>
                  {showEst ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>

                {/* Botón Iniciar Viaje para Chofer (cuando tiene asignación y no hay viaje EnCurso) */}
                {isChofer && miAsignacion && !viajes.some((v) => v.estado === 'EnCurso' && v.conductorId === miConductorId) && (
                  <div className="space-y-1">
                    <button
                      onClick={handleIniciarViaje}
                      disabled={iniciando}
                      className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-[12px] font-semibold text-white transition-all active:scale-95 disabled:opacity-60"
                      style={{ background: 'var(--primary)' }}
                    >
                      {iniciando ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Play size={13} />
                      )}
                      {iniciando ? 'Iniciando…' : 'Iniciar Viaje'}
                    </button>
                    {iniciarError && (
                      <p className="text-[10px] text-red-400 text-center">{iniciarError}</p>
                    )}
                  </div>
                )}

                {/* Botón GPS para Chofer */}
                {isChofer && viajeActivo.estado === 'EnCurso' && (
                  <button
                    onClick={() => setBroadcasting(!broadcasting)}
                    className={`flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-[12px] font-semibold transition-all ${
                      broadcasting
                        ? 'bg-red-500/15 text-red-400 ring-1 ring-red-500/30'
                        : 'text-white'
                    }`}
                    style={!broadcasting ? { background: 'var(--primary)' } : {}}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        broadcasting ? 'bg-red-400 animate-pulse' : 'bg-white'
                      }`}
                    />
                    {broadcasting ? 'Detener GPS' : 'Activar GPS en vivo'}
                  </button>
                )}

                {/* Botón de simulación de recorrido (demo) — solo Chofer y Admin */}
                {viajeActivo.estado === 'EnCurso' && rutaData && (isChofer || user?.role === 'AdminInstitucion') && (
                  <button
                    onClick={handleSimular}
                    className={`flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-[12px] font-semibold transition-all ${
                      simulating
                        ? 'bg-violet-500/15 text-violet-400 ring-1 ring-violet-500/30'
                        : 'bg-violet-500/10 text-violet-400 hover:bg-violet-500/20'
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        simulating ? 'bg-violet-400 animate-pulse' : 'bg-violet-500'
                      }`}
                    />
                    {simulating ? 'Detener simulación' : '🎬 Simular recorrido'}
                  </button>
                )}

                {/* Lista de estudiantes */}
                {showEst && (
                  <div className="max-h-[300px] overflow-y-auto space-y-1 animate-fade-in">
                    {estudiantes.length === 0 ? (
                      <p
                        className="py-4 text-center text-[11px]"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        Sin estudiantes asignados
                      </p>
                    ) : (
                      estudiantes.map((est) => (
                        <div
                          key={est.id}
                          className="rounded-lg px-3 py-2 transition-colors"
                          style={{
                            background: isDark ? 'rgba(0,0,0,0.2)' : 'var(--bg-hover)',
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p
                                className="text-[12px] font-medium"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                {est.nombreEstudiante}
                              </p>
                              <p
                                className="flex items-center gap-1 text-[10px] mt-0.5"
                                style={{ color: 'var(--text-muted)' }}
                              >
                                <MapPin size={8} /> {est.paradaAsignada}
                              </p>
                            </div>
                            <Badge variant={estEstVariant(est.estado)}>{est.estado}</Badge>
                          </div>
                          {isChofer && (
                            <div className="mt-2 flex gap-1.5">
                              <button
                                onClick={() =>
                                  handleMarcarEstudiante(est.estudianteId, 'transporte')
                                }
                                disabled={
                                  est.estado === 'EN_TRANSPORTE' ||
                                  markingEst === `${est.estudianteId}-transporte`
                                }
                                className="flex-1 rounded-md py-1 text-[10px] font-medium transition bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 disabled:opacity-40"
                              >
                                {markingEst === `${est.estudianteId}-transporte`
                                  ? '…'
                                  : '↑ A bordo'}
                              </button>
                              <button
                                onClick={() =>
                                  handleMarcarEstudiante(est.estudianteId, 'descendido')
                                }
                                disabled={
                                  est.estado === 'DESCENDIDO' ||
                                  markingEst === `${est.estudianteId}-descendido`
                                }
                                className="flex-1 rounded-md py-1 text-[10px] font-medium transition bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-40"
                              >
                                {markingEst === `${est.estudianteId}-descendido`
                                  ? '…'
                                  : '↓ Bajó'}
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toggle del panel (verde, siempre visible) */}
      <button
        onClick={() => setPanelOpen(!panelOpen)}
        className="absolute z-[1000] flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg transition-all duration-150 active:scale-95"
        style={{
          left: panelOpen ? 340 : 0,
          top: '50%',
          transform: 'translateY(-50%)',
          transition: 'left 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          width: 24,
          height: 56,
          borderRadius: '0 8px 8px 0',
        }}
        title={panelOpen ? 'Ocultar panel' : 'Mostrar panel'}
      >
        {panelOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

      {/* Mapa */}
      <div className="flex-1 min-h-0 relative">
        <LeafletMap
          mapKey={mapKey}
          theme={theme}
          tileLayer={tileLayer}
          busPos={busPos}
          rutaData={rutaData}
          ubicacion={ubicacion}
        />

        {/* Indicador de bus en movimiento */}
        {busPos && (
          <div className="absolute top-3 right-3 z-[1000]">
            <div
              className="flex items-center gap-2 rounded-full px-3 py-1.5 shadow-lg"
              style={{
                background: isDark ? 'rgba(17,24,39,0.9)' : 'rgba(255,255,255,0.9)',
                border: '1px solid var(--border)',
              }}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
              </span>
              <span
                className="text-[11px] font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                🚌 En movimiento
              </span>
            </div>
          </div>
        )}

        {/* Overlay cuando no hay viaje */}
        {!viajeActivo && !loading && (
          <div
            className="absolute inset-0 z-[500] flex items-center justify-center"
            style={{
              background: isDark ? 'rgba(10,15,30,0.7)' : 'rgba(250,250,250,0.7)',
            }}
          >
            <div className="text-center">
              <Bus size={36} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
              <p className="text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                {viajes.length === 0
                  ? 'Sin viajes activos — Inicia uno desde Asignaciones'
                  : 'Selecciona un viaje en el panel izquierdo'}
              </p>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-[12px] font-medium text-white transition-all active:scale-95 disabled:opacity-50"
                style={{ background: 'var(--primary)' }}
              >
                <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
                Actualizar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
