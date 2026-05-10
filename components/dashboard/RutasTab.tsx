'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRutas, type RutaDto, type CoordenadaDto } from '@/hooks/useRutas';
import { useNotificacion } from '@/hooks/useNotificacion';
import { useTheme, TILE_LAYERS } from '@/context/ThemeContext';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/shared/Modal';
import {
  Plus,
  Search,
  Trash2,
  Route,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
  MapPin,
  Flag,
  Check,
  RotateCcw,
} from 'lucide-react';

// ─── Lazy Leaflet ───────────────────────────────────────────────────

const MapContainer = dynamic(() => import('react-leaflet').then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((m) => m.TileLayer), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then((m) => m.Polyline), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then((m) => m.CircleMarker), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((m) => m.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((m) => m.Popup), { ssr: false });
const MapClickHandler = dynamic(() => import('./MapClickHandler'), { ssr: false });

// ─── Types & Constants ──────────────────────────────────────────────

type LL = [number, number];
const CENTER: LL = [-17.7833, -63.1821];

type CreationMode =
  | 'idle'
  | 'selecting-origin'
  | 'confirming-origin'
  | 'photo-origen'
  | 'selecting-destino'
  | 'confirming-destino'
  | 'photo-destino'
  | 'naming-route';

interface DraftRoute {
  origen: { lat: number; lon: number } | null;
  destino: { lat: number; lon: number } | null;
  osrmCoords: LL[];
  color: string;
  nombre: string;
  distanciaKm: number;
  fotoOrigen: string | null;
  fotoDestino: string | null;
}

const COLORS = [
  { val: '#10B981', name: 'Esmeralda' },
  { val: '#3B82F6', name: 'Azul' },
  { val: '#8B5CF6', name: 'Violeta' },
  { val: '#F59E0B', name: 'Ámbar' },
  { val: '#EF4444', name: 'Rojo' },
  { val: '#EC4899', name: 'Rosa' },
];

const INITIAL_DRAFT: DraftRoute = {
  origen: null, destino: null, osrmCoords: [],
  color: COLORS[0].val, nombre: '', distanciaKm: 0,
  fotoOrigen: null, fotoDestino: null,
};

const toLL = (c: CoordenadaDto): LL => [c.latitud, c.longitud];
const badgeVariant = (e: string) => {
  if (e === 'Activa') return 'success' as const;
  if (e === 'Suspendida') return 'warning' as const;
  return 'default' as const;
};
const buildPos = (r: RutaDto): LL[] => {
  const s = [...r.puntosIntermedios].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
  return [toLL(r.origen), ...s.map(toLL), toLL(r.destino)];
};

// OSRM helper
async function fetchOSRM(o: { lat: number; lon: number }, d: { lat: number; lon: number }): Promise<{ coords: LL[]; distKm: number } | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${o.lon},${o.lat};${d.lon},${d.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const json = await res.json();
    if (json.code !== 'Ok' || !json.routes?.length) return null;
    const route = json.routes[0];
    const coords: LL[] = route.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
    const distKm = Math.round((route.distance / 1000) * 10) / 10;
    return { coords, distKm };
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════
// RUTAS TAB — Wizard interactivo sobre el mapa
// ═══════════════════════════════════════════════════════════════════

export default function RutasTab() {
  const { rutas, loading, crear, eliminar } = useRutas();
  const { notificarExito, notificarError } = useNotificacion();
  const { isDark, theme } = useTheme();
  const tileLayer = TILE_LAYERS[theme];

  // Panel
  const [panelOpen, setPanelOpen] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Wizard state
  const [mode, setMode] = useState<CreationMode>('idle');
  const [draft, setDraft] = useState<DraftRoute>({ ...INITIAL_DRAFT });
  const [saving, setSaving] = useState(false);
  const [calculating, setCalculating] = useState(false);

  // Leaflet
  const [ready, setReady] = useState(false);
  useEffect(() => { import('leaflet/dist/leaflet.css'); setReady(true); }, []);

  // Filtered
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return rutas;
    return rutas.filter((r) => r.nombre.toLowerCase().includes(q) || r.estado.toLowerCase().includes(q));
  }, [rutas, search]);

  // ── Wizard handlers ───────────────────────────────────────────────

  const startCreation = () => {
    setMode('selecting-origin');
    setDraft({ ...INITIAL_DRAFT });
    setSelectedId(null);
  };

  const cancelCreation = () => {
    setMode('idle');
    setDraft({ ...INITIAL_DRAFT });
  };

  const handleMapClick = useCallback((lat: number, lon: number) => {
    if (mode === 'selecting-origin') {
      setDraft((d) => ({ ...d, origen: { lat, lon } }));
      setMode('confirming-origin');
    } else if (mode === 'selecting-destino') {
      setDraft((d) => ({ ...d, destino: { lat, lon } }));
      setMode('confirming-destino');
    }
  }, [mode]);

  const confirmOrigin = () => setMode('photo-origen');

  const resetOrigin = () => {
    setDraft((d) => ({ ...d, origen: null, fotoOrigen: null }));
    setMode('selecting-origin');
  };

  const skipPhotoOrigen = () => setMode('selecting-destino');
  const skipPhotoDestino = () => {
    if (!draft.origen || !draft.destino) return;
    calcRoute();
  };

  const calcRoute = async () => {
    if (!draft.origen || !draft.destino) return;
    setCalculating(true);
    const result = await fetchOSRM(draft.origen, draft.destino);
    setCalculating(false);
    if (result) {
      setDraft((d) => ({ ...d, osrmCoords: result.coords, distanciaKm: result.distKm }));
      setMode('naming-route');
    } else {
      setDraft((d) => ({
        ...d,
        osrmCoords: [[d.origen!.lat, d.origen!.lon], [d.destino!.lat, d.destino!.lon]],
        distanciaKm: 0,
      }));
      setMode('naming-route');
      notificarError('OSRM no disponible, ruta en línea recta');
    }
  };

  const confirmDestino = () => setMode('photo-destino');

  const resetDestino = () => {
    setDraft((d) => ({ ...d, destino: null, osrmCoords: [], fotoDestino: null }));
    setMode('selecting-destino');
  };

  const handleFileUpload = (field: 'fotoOrigen' | 'fotoDestino') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setDraft((d) => ({ ...d, [field]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const submitPhotoOrigen = () => setMode('selecting-destino');
  const submitPhotoDestino = () => calcRoute();

  const handleCrear = async () => {
    if (!draft.origen || !draft.destino || !draft.nombre.trim()) return;
    setSaving(true);
    const r = await crear({
      nombre: draft.nombre.trim(),
      origenLatitud: draft.origen.lat,
      origenLongitud: draft.origen.lon,
      destinoLatitud: draft.destino.lat,
      destinoLongitud: draft.destino.lon,
      color: draft.color,
    });
    if (r) {
      notificarExito('✅ Ruta creada exitosamente');
      cancelCreation();
    } else {
      notificarError('Error al crear ruta');
    }
    setSaving(false);
  };

  const handleEliminar = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const ok = await eliminar(deleteId);
    ok ? notificarExito('Ruta eliminada') : notificarError('Error al eliminar');
    setDeleting(false);
    setDeleteId(null);
    if (selectedId === deleteId) setSelectedId(null);
  };

  const isCreating = mode !== 'idle';
  const showCrosshair = mode === 'selecting-origin' || mode === 'selecting-destino';
  const showConfirmPanel = mode === 'confirming-origin' || mode === 'confirming-destino';
  const showPhotoPanel = mode === 'photo-origen' || mode === 'photo-destino';

  // Top banner (only for selecting modes)
  const bannerText = (() => {
    switch (mode) {
      case 'selecting-origin': return '📍 Haz click en el mapa para marcar el origen';
      case 'selecting-destino': return '🏁 Ahora haz click para marcar el destino';
      case 'naming-route': return '✏️ Nombra tu ruta y elige un color';
      default: return '';
    }
  })();

  return (
    <div className="relative flex h-full">
      {/* ═══════════ PANEL LATERAL (340px ↔ 0) ═══════════ */}
      <div
        className="relative shrink-0 flex flex-col overflow-hidden"
        style={{
          width: panelOpen ? 340 : 0,
          transition: 'width 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          borderRight: panelOpen ? '1px solid var(--border)' : 'none',
        }}
      >
        <div className="flex flex-col h-full w-[340px]" style={{ background: 'var(--bg-surface)' }}>
          {/* ── Naming panel (step 5 overlay) ─────────────────── */}
          {mode === 'naming-route' && (
            <div
              className="absolute inset-x-0 top-0 z-10 p-4 space-y-4 animate-fade-in"
              style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-[14px] font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Route size={15} className="text-emerald-500" />
                  Nueva Ruta
                </h3>
                <button onClick={cancelCreation} className="p-1 rounded-md transition-colors" style={{ color: 'var(--text-muted)' }}>
                  <X size={14} />
                </button>
              </div>

              {/* Distance badge */}
              {draft.distanciaKm > 0 && (
                <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: 'var(--primary-glow)' }}>
                  <Route size={13} className="text-emerald-500" />
                  <span className="text-[13px] font-semibold text-emerald-500">{draft.distanciaKm} km</span>
                  <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>calculados con OSRM</span>
                </div>
              )}

              {/* Name input */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>
                  Nombre de la ruta
                </label>
                <input
                  type="text"
                  placeholder="Ej: Ruta Universitaria Norte"
                  value={draft.nombre}
                  onChange={(e) => setDraft((d) => ({ ...d, nombre: e.target.value }))}
                  autoFocus
                  className="w-full rounded-lg h-10 px-3 text-[14px] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
              </div>

              {/* Color picker */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider block mb-2" style={{ color: 'var(--text-muted)' }}>
                  Color
                </label>
                <div className="flex gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c.val}
                      onClick={() => setDraft((d) => ({ ...d, color: c.val }))}
                      title={c.name}
                      className={`h-7 w-7 rounded-full transition-all duration-150 ${
                        draft.color === c.val
                          ? 'ring-2 ring-white ring-offset-2 scale-[1.2]'
                          : 'opacity-60 hover:opacity-100 hover:scale-110'
                      }`}
                      style={{
                        background: c.val,
                        '--tw-ring-offset-color': 'var(--bg-surface)',
                      } as React.CSSProperties}
                    />
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={cancelCreation}
                  className="flex-1 h-10 rounded-lg text-[13px] font-medium transition-all duration-150 active:scale-[0.97]"
                  style={{ color: 'var(--text-secondary)', background: 'var(--bg-hover)' }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCrear}
                  disabled={!draft.nombre.trim() || saving}
                  className="flex-1 h-10 rounded-lg text-[13px] font-medium text-white transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-1.5"
                  style={{ background: 'var(--primary)' }}
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  {saving ? 'Creando...' : 'Crear Ruta'}
                </button>
              </div>
            </div>
          )}

          {/* ── Panel header ──────────────────────────────────── */}
          <div className="shrink-0 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Route size={16} className="text-emerald-500" />
                Rutas
              </h2>
              <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: 'var(--primary-glow)', color: 'var(--primary)' }}>
                {rutas.length}
              </span>
            </div>

            <button
              onClick={startCreation}
              disabled={isCreating}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg h-9 text-[13px] font-medium text-white transition-all duration-150 active:scale-[0.97] disabled:opacity-50"
              style={{ background: 'var(--primary)' }}
            >
              <Plus size={14} />
              Nueva Ruta
            </button>

            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Buscar ruta..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg h-9 pl-8 pr-3 text-[13px] transition-all duration-150 focus:outline-none"
                style={{ background: isDark ? 'var(--bg-base)' : 'var(--bg-hover)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          <div className="h-px" style={{ background: 'var(--border-subtle)' }} />

          {/* ── Route list ─────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 mx-4 my-2 animate-pulse rounded-lg" style={{ background: 'var(--bg-hover)', animationDelay: `${i * 50}ms` }} />
              ))
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center px-4">
                <Route size={28} style={{ color: 'var(--text-muted)' }} className="mb-2" />
                <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>{search ? 'Sin resultados' : 'Sin rutas aún'}</p>
              </div>
            ) : (
              filtered.map((ruta) => {
                const isSelected = selectedId === ruta.id;
                return (
                  <button
                    key={ruta.id}
                    onClick={() => setSelectedId(ruta.id)}
                    className="group flex w-full items-center gap-3 px-4 py-3 text-left transition-all duration-100 relative"
                    style={{ background: isSelected ? 'var(--primary-glow)' : 'transparent', borderBottom: '1px solid var(--border-subtle)' }}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {isSelected && <span className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full bg-emerald-500" />}
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: ruta.color || '#3b82f6' }} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{ruta.nombre}</p>
                      <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{ruta.distanciaTotalKm} km</p>
                    </div>
                    <Badge variant={badgeVariant(ruta.estado)}>{ruta.estado}</Badge>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteId(ruta.id); }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-md transition-all duration-150 hover:text-red-400"
                      style={{ color: 'var(--text-muted)' }}
                      title="Eliminar"
                    >
                      <Trash2 size={13} />
                    </button>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ═══════════ PANEL TOGGLE ═══════════ */}
      <button
        onClick={() => setPanelOpen(!panelOpen)}
        className="absolute z-[1000] flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg transition-all duration-150 active:scale-95"
        style={{
          left: panelOpen ? 340 : 0,
          top: '50%',
          transform: 'translateY(-50%)',
          transition: 'left 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          width: 28, height: 52,
          borderRadius: '0 8px 8px 0',
        }}
        title={panelOpen ? 'Ocultar panel' : 'Mostrar panel'}
      >
        {panelOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      {/* ═══════════ MAPA ═══════════ */}
      <div className={`flex-1 min-h-0 relative ${showCrosshair ? 'cursor-crosshair' : ''}`}>
        {/* Top banner (selecting modes only) */}
        {isCreating && bannerText && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1001] animate-fade-in">
            <div className="flex items-center gap-3 bg-emerald-500 text-white pl-5 pr-2 py-2.5 rounded-full shadow-lg text-[13px] font-medium whitespace-nowrap">
              {calculating && <Loader2 size={14} className="animate-spin" />}
              <span>{calculating ? 'Calculando ruta con OSRM...' : bannerText}</span>
              <button onClick={cancelCreation} className="ml-1 p-1 rounded-full hover:bg-emerald-600 transition-colors" title="Cancelar">
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {ready ? (
          <MapContainer key={`rutas-${theme}`} center={CENTER} zoom={12} className="h-full w-full" scrollWheelZoom zoomControl>
            <TileLayer attribution={tileLayer.attribution} url={tileLayer.url} />
            {showCrosshair && <MapClickHandler onClick={handleMapClick} />}

            {/* Existing routes */}
            {rutas.map((r) => (
              <div key={r.id}>
                <Polyline
                  positions={buildPos(r)}
                  pathOptions={{
                    color: r.id === selectedId ? '#10B981' : (r.color || '#3b82f6'),
                    weight: r.id === selectedId ? 5 : 3,
                    opacity: r.id === selectedId ? 1 : 0.6,
                    lineCap: 'round', lineJoin: 'round',
                  }}
                />
                <Marker position={toLL(r.origen)}>
                  <Popup>
                    <strong>{r.nombre}</strong><br />
                    <span style={{ fontSize: 11, color: '#6B7280' }}>{r.distanciaTotalKm} km · {r.estado}</span>
                  </Popup>
                </Marker>
              </div>
            ))}

            {/* Draft origin — green CircleMarker */}
            {draft.origen && (
              <CircleMarker
                center={[draft.origen.lat, draft.origen.lon]}
                radius={8}
                pathOptions={{ color: '#fff', fillColor: '#10B981', fillOpacity: 1, weight: 3 }}
              />
            )}

            {/* Draft destination — red CircleMarker */}
            {draft.destino && (
              <CircleMarker
                center={[draft.destino.lat, draft.destino.lon]}
                radius={8}
                pathOptions={{ color: '#fff', fillColor: '#EF4444', fillOpacity: 1, weight: 3 }}
              />
            )}

            {/* OSRM polyline */}
            {draft.osrmCoords.length > 0 && (
              <Polyline
                positions={draft.osrmCoords}
                pathOptions={{ color: draft.color, weight: 5, opacity: 0.9, lineCap: 'round', lineJoin: 'round' }}
              />
            )}
          </MapContainer>
        ) : (
          <div className="flex h-full items-center justify-center" style={{ background: 'var(--bg-base)' }}>
            <Loader2 size={20} className="animate-spin text-emerald-500" />
          </div>
        )}

        {/* ═══ FLOATING CONFIRM PANEL ═══ */}
        {showConfirmPanel && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[2000] animate-fade-in" style={{ width: 420 }}>
            <div className="rounded-2xl p-5 shadow-2xl" style={{
              background: isDark ? '#111827' : '#FFFFFF',
              border: '2px solid #10B981',
              boxShadow: '0 0 20px rgba(16,185,129,0.3), 0 25px 50px rgba(0,0,0,0.25)',
            }}>
              <div className="flex items-start gap-3 mb-4">
                <span className="text-2xl">{mode === 'confirming-origin' ? '📍' : '🏁'}</span>
                <div className="flex-1">
                  <h3 className="text-[16px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {mode === 'confirming-origin' ? 'Origen seleccionado' : 'Destino seleccionado'}
                  </h3>
                  <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {mode === 'confirming-origin' && draft.origen
                      ? `${draft.origen.lat.toFixed(5)}, ${draft.origen.lon.toFixed(5)}`
                      : draft.destino ? `${draft.destino.lat.toFixed(5)}, ${draft.destino.lon.toFixed(5)}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={mode === 'confirming-origin' ? resetOrigin : resetDestino}
                  className="flex-1 h-11 rounded-[10px] text-[13px] font-medium transition-all duration-150 active:scale-[0.97] flex items-center justify-center gap-1.5"
                  style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                >
                  <RotateCcw size={14} /> {mode === 'confirming-origin' ? 'Cambiar origen' : 'Cambiar destino'}
                </button>
                <button
                  onClick={mode === 'confirming-origin' ? confirmOrigin : confirmDestino}
                  className="flex-1 h-11 rounded-[10px] bg-emerald-500 hover:bg-emerald-600 text-white text-[13px] font-medium transition-all duration-150 active:scale-[0.97] flex items-center justify-center gap-1.5"
                >
                  <Check size={14} /> {mode === 'confirming-origin' ? 'Confirmar origen →' : 'Confirmar destino →'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══ FLOATING PHOTO PANEL ═══ */}
        {showPhotoPanel && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[2000] animate-fade-in" style={{ width: 420 }}>
            <div className="rounded-2xl p-5 shadow-2xl" style={{
              background: isDark ? '#111827' : '#FFFFFF',
              border: '2px solid #10B981',
              boxShadow: '0 0 20px rgba(16,185,129,0.3), 0 25px 50px rgba(0,0,0,0.25)',
            }}>
              <h3 className="text-[15px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                {mode === 'photo-origen' ? '¿Agregar foto al origen?' : '¿Agregar foto al destino?'}
                <span className="text-[11px] font-normal ml-2" style={{ color: 'var(--text-muted)' }}>(opcional)</span>
              </h3>
              <label className="flex flex-col items-center justify-center gap-2 rounded-xl py-6 mt-3 mb-4 cursor-pointer transition-colors" style={{
                border: `2px dashed ${(mode === 'photo-origen' ? draft.fotoOrigen : draft.fotoDestino) ? '#10B981' : 'var(--border)'}`,
                background: (mode === 'photo-origen' ? draft.fotoOrigen : draft.fotoDestino) ? 'var(--primary-glow)' : 'var(--bg-base)',
              }}>
                {(mode === 'photo-origen' ? draft.fotoOrigen : draft.fotoDestino) ? (
                  <><Check size={20} className="text-emerald-500" /><span className="text-[12px] font-medium text-emerald-500">Foto seleccionada ✓</span></>
                ) : (
                  <><span className="text-2xl">📷</span><span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>Click para subir imagen</span></>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload(mode === 'photo-origen' ? 'fotoOrigen' : 'fotoDestino')} />
              </label>
              <div className="flex gap-3">
                <button
                  onClick={mode === 'photo-origen' ? skipPhotoOrigen : skipPhotoDestino}
                  className="flex-1 h-11 rounded-[10px] text-[13px] font-medium transition-all duration-150 active:scale-[0.97]"
                  style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                >
                  Omitir →
                </button>
                {(mode === 'photo-origen' ? draft.fotoOrigen : draft.fotoDestino) && (
                  <button
                    onClick={mode === 'photo-origen' ? submitPhotoOrigen : submitPhotoDestino}
                    className="flex-1 h-11 rounded-[10px] bg-emerald-500 hover:bg-emerald-600 text-white text-[13px] font-medium transition-all duration-150 active:scale-[0.97] flex items-center justify-center gap-1.5"
                  >
                    <Check size={14} /> Subir foto →
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════ MODAL ELIMINAR ═══════════ */}
      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Confirmar eliminación"
        footer={
          <div className="flex gap-2">
            <Button variant="ghost" size="md" onClick={() => setDeleteId(null)} className="flex-1">Cancelar</Button>
            <Button variant="danger" size="md" onClick={handleEliminar} loading={deleting} className="flex-1">Eliminar</Button>
          </div>
        }
      >
        <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
          ¿Estás seguro de que deseas eliminar esta ruta? Esta acción no se puede deshacer.
        </p>
      </Modal>
    </div>
  );
}
