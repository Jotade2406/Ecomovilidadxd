'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useViajeActual, type ViajeDto } from '@/hooks/useViajeActual';
import { useUbicacionEnVivo } from '@/hooks/useUbicacionEnVivo';
import { useTheme, TILE_LAYERS } from '@/context/ThemeContext';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Dropdown from '@/components/shared/Dropdown';
import {
  Wifi,
  WifiOff,
  Bus,
  MapPin,
  Users,
  Clock,
  ChevronDown,
  ChevronUp,
  Navigation,
  Phone,
  User,
  Radio,
  AlertTriangle,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

// ─── Lazy Leaflet ───────────────────────────────────────────────────
const MapContainer = dynamic(() => import('react-leaflet').then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((m) => m.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((m) => m.Popup), { ssr: false });

type LL = [number, number];
const CENTER: LL = [-17.7833, -63.1821];

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

// ═══════════════════════════════════════════════════════════════════
// EN VIVO TAB — Panel colapsable + Mapa tracking
// ═══════════════════════════════════════════════════════════════════

export default function EnVivoTab() {
  const { viajes, viajeActivo, estudiantes, loading, error, seleccionarViaje, recargar } = useViajeActual();
  const { ubicacion, conectado, error: wsError } = useUbicacionEnVivo(viajeActivo?.id ?? null);
  const { isDark, theme } = useTheme();
  const tileLayer = TILE_LAYERS[theme];

  const [panelOpen, setPanelOpen] = useState(true);
  const [showEst, setShowEst] = useState(false);
  const [ready, setReady] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => { recargar(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { import('leaflet/dist/leaflet.css'); setTimeout(() => setReady(true), 80); }, []);

  // Polling fallback
  useEffect(() => {
    if (conectado || !viajeActivo) return;
    const i = setInterval(() => recargar(), 5000);
    return () => clearInterval(i);
  }, [conectado, viajeActivo, recargar]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await recargar();
    setMapKey((p) => p + 1);
    setRefreshing(false);
  };

  const viajeItems = useMemo(
    () => viajes.map((v) => ({
      value: v.id,
      label: `Viaje ${v.estado} — ${v.fechaInicio ? new Date(v.fechaInicio).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' }) : 'Sin iniciar'}`,
      icon: v.estado === 'EnCurso' ? <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> : undefined,
    })),
    [viajes]
  );

  const abordo = estudiantes.filter((e) => e.estado === 'EN_TRANSPORTE').length;
  const total = estudiantes.length;
  const busPos: LL | null = ubicacion ? [ubicacion.lat, ubicacion.lon] : null;

  return (
    <div className="relative flex h-full">
      {/* ═══════════ PANEL (340px ↔ 0) ═══════════ */}
      <div
        className="relative shrink-0 flex flex-col overflow-hidden"
        style={{
          width: panelOpen ? 340 : 0,
          transition: 'width 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          borderRight: panelOpen ? '1px solid var(--border)' : 'none',
        }}
      >
        <div className="flex flex-col h-full w-[340px] overflow-y-auto" style={{ background: 'var(--bg-surface)' }}>
          <div className="p-4 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
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

            {/* WS status */}
            <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: isDark ? 'var(--bg-base)' : 'var(--bg-hover)', border: '1px solid var(--border-subtle)' }}>
              {conectado ? (
                <><Wifi size={13} className="text-emerald-500" /><span className="text-[11px] text-emerald-500 font-medium">Tiempo real activo</span></>
              ) : wsError ? (
                <><AlertTriangle size={13} className="text-amber-400" /><span className="text-[11px] text-amber-400 font-medium">Conexión perdida</span></>
              ) : (
                <><WifiOff size={13} style={{ color: 'var(--text-muted)' }} /><span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>Sin conexión</span></>
              )}
            </div>

            {/* Viaje selector */}
            <Dropdown label="Viaje" placeholder="Elegir un viaje..." items={viajeItems} value={viajeActivo?.id ?? null} onChange={(val) => { const v = viajes.find((x) => x.id === val); if (v) seleccionarViaje(v); }} />
          </div>

          <div className="h-px" style={{ background: 'var(--border-subtle)' }} />

          {/* Content */}
          <div className="flex-1 p-4">
            {loading ? (
              <div className="flex flex-col items-center py-10 gap-2">
                <Loader2 size={20} className="animate-spin text-emerald-500" />
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Cargando...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center py-10 text-center">
                <AlertTriangle size={28} className="mb-2 text-amber-500" />
                <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>Error al cargar</p>
                <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>{error}</p>
                <button onClick={handleRefresh} className="mt-3 text-[11px] font-medium text-emerald-500 hover:text-emerald-400">Reintentar</button>
              </div>
            ) : !viajeActivo ? (
              <div className="flex flex-col items-center py-10 text-center">
                <Bus size={28} className="mb-2" style={{ color: 'var(--text-muted)' }} />
                <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>Sin viajes activos</p>
                <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>Selecciona un viaje para seguimiento</p>
                <button onClick={handleRefresh} className="mt-3 text-[11px] font-medium text-emerald-500 hover:text-emerald-400 flex items-center gap-1">
                  <RefreshCw size={10} /> Actualizar
                </button>
              </div>
            ) : (
              <div className="space-y-3 animate-fade-in">
                {/* Trip header */}
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Viaje {viajeActivo.estado === 'EnCurso' ? 'en curso' : viajeActivo.estado}
                  </h3>
                </div>

                {/* Vehicle */}
                <div className="flex items-center gap-3">
                  <span className="text-lg">🚌</span>
                  <div>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Vehículo</p>
                    <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{viajeActivo.placaVehiculo || 'Sin placa'}</p>
                  </div>
                </div>

                {/* Driver */}
                <div className="flex items-center gap-3">
                  <User size={16} style={{ color: 'var(--text-muted)' }} />
                  <div>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Conductor</p>
                    <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{viajeActivo.nombreConductor || 'Sin asignar'}</p>
                    {viajeActivo.telefonoConductor && (
                      <p className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        <Phone size={9} /> {viajeActivo.telefonoConductor}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Estado</span>
                  <Badge variant={estadoVariant(viajeActivo.estado)}>{viajeActivo.estado}</Badge>
                </div>

                {/* Live position */}
                {ubicacion && (
                  <div className="rounded-lg px-3 py-2" style={{ background: isDark ? 'var(--bg-base)' : 'var(--bg-hover)' }}>
                    <div className="flex items-center gap-1.5">
                      <Navigation size={11} className="text-emerald-500" />
                      <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                        {ubicacion.lat.toFixed(5)}, {ubicacion.lon.toFixed(5)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Students */}
                <div className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: isDark ? 'var(--bg-base)' : 'var(--bg-hover)' }}>
                  <span className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                    <Users size={13} className="text-sky-400" /> Estudiantes
                  </span>
                  <span className="text-[13px] font-bold text-sky-400">{abordo}/{total}</span>
                </div>

                {/* Toggle students */}
                <button
                  onClick={() => setShowEst(!showEst)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-[12px] transition-colors"
                  style={{ background: isDark ? 'var(--bg-base)' : 'var(--bg-hover)', color: 'var(--text-secondary)' }}
                >
                  <span className="flex items-center gap-1.5"><Users size={13} className="text-sky-400" /> Ver estudiantes ({total})</span>
                  {showEst ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>

                {showEst && (
                  <div className="max-h-[250px] overflow-y-auto space-y-1 animate-fade-in">
                    {estudiantes.length === 0 ? (
                      <p className="py-4 text-center text-[11px]" style={{ color: 'var(--text-muted)' }}>Sin estudiantes</p>
                    ) : (
                      estudiantes.map((est) => (
                        <div key={est.id} className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors" style={{ background: isDark ? 'rgba(0,0,0,0.2)' : 'var(--bg-hover)' }}>
                          <div>
                            <p className="text-[12px] font-medium" style={{ color: 'var(--text-primary)' }}>{est.nombreEstudiante}</p>
                            <p className="flex items-center gap-1 text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                              <MapPin size={8} /> {est.paradaAsignada}
                            </p>
                          </div>
                          <Badge variant={estEstVariant(est.estado)}>{est.estado}</Badge>
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

      {/* ═══════════ PANEL TOGGLE (verde sólido, siempre visible) ═══════════ */}
      <button
        onClick={() => setPanelOpen(!panelOpen)}
        className="absolute z-[1000] flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg transition-all duration-150 active:scale-95"
        style={{
          left: panelOpen ? 340 : 0,
          top: '50%',
          transform: 'translateY(-50%)',
          transition: 'left 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          width: 28,
          height: 52,
          borderRadius: '0 8px 8px 0',
        }}
        title={panelOpen ? 'Ocultar panel' : 'Mostrar panel'}
        aria-label={panelOpen ? 'Ocultar panel' : 'Mostrar panel'}
      >
        {panelOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      {/* ═══════════ MAPA ═══════════ */}
      <div className="flex-1 min-h-0 relative">
        {ready ? (
          <MapContainer
            key={`envivo-${mapKey}-${theme}`}
            center={busPos || CENTER}
            zoom={13}
            className="h-full w-full"
            scrollWheelZoom
            zoomControl
          >
            <TileLayer attribution={tileLayer.attribution} url={tileLayer.url} />
            {busPos && (
              <Marker position={busPos}>
                <Popup>
                  <div>
                    <strong>🚌 Bus en vivo</strong><br />
                    <span style={{ fontSize: 11, color: '#6B7280' }}>
                      {busPos[0].toFixed(5)}, {busPos[1].toFixed(5)}
                    </span>
                    {ubicacion && (
                      <>
                        <br />
                        <span style={{ fontSize: 11, color: '#10b981' }}>
                          {new Date(ubicacion.timestamp).toLocaleTimeString('es-BO')}
                        </span>
                      </>
                    )}
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        ) : (
          <div className="flex h-full items-center justify-center" style={{ background: 'var(--bg-base)' }}>
            <Loader2 size={20} className="animate-spin text-emerald-500" />
          </div>
        )}

        {/* Bus pulse overlay */}
        {busPos && (
          <div className="absolute top-3 right-3 z-[1000]">
            <div className="flex items-center gap-2 rounded-full px-3 py-1.5 glass shadow-lg" style={{ background: isDark ? 'rgba(17,24,39,0.9)' : 'rgba(255,255,255,0.9)', border: '1px solid var(--border)' }}>
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
              </span>
              <span className="text-[11px] font-medium" style={{ color: 'var(--text-primary)' }}>🚌 En movimiento</span>
            </div>
          </div>
        )}

        {/* No trip overlay */}
        {!viajeActivo && !loading && (
          <div className="absolute inset-0 z-[500] flex items-center justify-center glass-subtle" style={{ background: isDark ? 'rgba(10,15,30,0.7)' : 'rgba(250,250,250,0.7)' }}>
            <div className="text-center">
              <Bus size={36} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
              <p className="text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                Selecciona un viaje para seguimiento
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
