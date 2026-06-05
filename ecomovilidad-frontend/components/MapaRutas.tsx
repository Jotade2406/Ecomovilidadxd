'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Globe, PanelLeftClose, PanelLeftOpen, Plus, X, Loader2,
  Trash2, Save, MapPin, Navigation, Route, RefreshCw, AlertTriangle,
  CheckCircle2, ChevronRight, Flag, LogOut, Link2, Radio
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import AsignacionesPanel from '@/components/AsignacionesPanel';
import PanelSeguimiento from '@/components/PanelSeguimiento';
import { useNotificacion } from '@/hooks/useNotificacion';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
L.Icon.Default.mergeOptions({ iconUrl: markerIcon.src, iconRetinaUrl: markerIcon2x.src, shadowUrl: markerShadow.src });

// ─── Leaflet Custom Icons (Lucide SVGs) ────────────────────────────
const mkIcon = (bg: string, sz: number, ring: string, svg: string) =>
  L.divIcon({
    html: `<div style="width:${sz}px;height:${sz}px;border-radius:50%;background:${bg};border:3px solid rgba(255,255,255,.9);box-shadow:0 0 0 3px ${ring},0 4px 12px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;">${svg}</div>`,
    className: '', iconSize: [sz, sz], iconAnchor: [sz / 2, sz / 2],
  });

const mapPinSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>`;
const flagSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>`;

// Origen: Emerald-500
const origenIcon  = mkIcon('linear-gradient(135deg,#34d399,#10b981)', 28, 'rgba(16,185,129,.3)', mapPinSvg);
// Destino: Sky-500
const destinoIcon = mkIcon('linear-gradient(135deg,#7dd3fc,#0ea5e9)', 28, 'rgba(14,165,233,.3)', flagSvg);
// Saved: simple dot
const savedIcon   = mkIcon('#94a3b8', 14, 'rgba(148,163,184,.2)', '');

// ─── Types ─────────────────────────────────────────────────────────
interface CoordenadaDto { latitud: number; longitud: number; orden?: number }
interface RutaDto {
  id: string; nombre: string; origen: CoordenadaDto; destino: CoordenadaDto;
  estado: string; color: string; puntosIntermedios: CoordenadaDto[];
  distanciaTotalKm: number; fechaCreacion: string;
}
type LL = [number, number];

// ─── Constants ─────────────────────────────────────────────────────
const RUTAS_EP = '/api/Rutas';
const OSRM = 'https://router.project-osrm.org/route/v1/driving';
const CENTER: LL = [-17.7833, -63.1821];

const COLORS = [
  { val: '#3b82f6', name: 'Azul' },
  { val: '#10b981', name: 'Esmeralda' },
  { val: '#8b5cf6', name: 'Violeta' },
  { val: '#f59e0b', name: 'Ámbar' },
  { val: '#ef4444', name: 'Rojo' },
  { val: '#ec4899', name: 'Rosa' }
];

// ─── Helpers ───────────────────────────────────────────────────────
const toLL = (c: CoordenadaDto): LL => [c.latitud, c.longitud];
const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

const estadoBadge: Record<string, string> = {
  Borrador:   'bg-amber-500/20 text-amber-400 ring-amber-500/20',
  Activa:     'bg-emerald-500/20 text-emerald-400 ring-emerald-500/20',
  Suspendida: 'bg-red-500/20 text-red-400 ring-red-500/20',
  Finalizada: 'bg-slate-600/20 text-slate-400 ring-slate-600/20',
};

// ─── Map Click Handler ─────────────────────────────────────────────
function ClickHandler({ on, orig, setO, setD }: {
  on: boolean; orig: LL | null; setO: (l: LL) => void; setD: (l: LL) => void;
}) {
  useMapEvents({
    click(e) {
      if (!on) return;
      const l: LL = [e.latlng.lat, e.latlng.lng];
      !orig ? setO(l) : setD(l);
    },
  });
  return null;
}

// ─── Spinner ───────────────────────────────────────────────────────
function Spinner({ size = 14, className = '' }: { size?: number; className?: string }) {
  return <Loader2 className={`animate-spin ${className}`} size={size} />;
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════
export default function MapaRutas() {
  const { isAuthenticated, isLoading: authLoading, logout, user } = useAuth();
  const router = useRouter();

  // ─── Auth guard ─────────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // ─── State ──────────────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'rutas' | 'asignaciones' | 'seguimiento'>('rutas');
  const [rutas, setRutas]       = useState<RutaDto[]>([]);
  const [loadingR, setLoadingR] = useState(true);
  const [backendDown, setBackendDown] = useState(false);

  const [creando, setCreando]   = useState(false);
  const [origen, setOrigen]     = useState<LL | null>(null);
  const [destino, setDestino]   = useState<LL | null>(null);
  const [nombre, setNombre]     = useState('');
  const [color, setColor]       = useState(COLORS[0].val);

  const [osrmPts, setOsrmPts]   = useState<LL[]>([]);
  const [dist, setDist]         = useState<number | null>(null);
  const [loadO, setLoadO]       = useState(false);

  const [saving, setSaving]     = useState(false);
  const [err, setErr]           = useState<string | null>(null);
  const [delId, setDelId]       = useState<string | null>(null);

  // ─── Load rutas ─────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoadingR(true); setBackendDown(false);
    try {
      const { data, error, status } = await api.get<RutaDto[]>(RUTAS_EP);
      if (status === 401) return; // api.ts handles redirect
      if (error || !data) throw new Error(error ?? 'Error cargando rutas');
      setRutas(data);
    } catch {
      setBackendDown(true); setRutas([]);
    } finally { setLoadingR(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ─── OSRM preview ──────────────────────────────────────────────
  useEffect(() => {
    if (!origen || !destino) { setOsrmPts([]); setDist(null); return; }
    const ac = new AbortController();
    setLoadO(true); setErr(null);
    fetch(
      `${OSRM}/${origen[1]},${origen[0]};${destino[1]},${destino[0]}?overview=full&geometries=geojson`,
      { signal: ac.signal },
    )
      .then(r => r.json())
      .then(d => {
        if (d.code !== 'Ok' || !d.routes?.length) { setErr('OSRM no encontró ruta'); return; }
        const rt = d.routes[0];
        setOsrmPts(rt.geometry.coordinates.map(([lo, la]: [number, number]) => [la, lo] as LL));
        setDist(Math.round((rt.distance / 1000) * 100) / 100);
      })
      .catch(e => { if (e.name !== 'AbortError') setErr('Error OSRM'); })
      .finally(() => setLoadO(false));
    return () => ac.abort();
  }, [origen, destino]);

  // ─── Reset ──────────────────────────────────────────────────────
  const reset = () => {
    setCreando(false); setOrigen(null); setDestino(null);
    setNombre(''); setColor(COLORS[0].val); setOsrmPts([]); setDist(null); setErr(null);
  };

  // ─── Save (NO truncation — full OSRM geometry) ─────────────────
  const guardar = async () => {
    if (!origen || !destino || !nombre.trim()) return;
    setSaving(true); setErr(null);
    try {
      const { data: created, error } = await api.post<RutaDto>(RUTAS_EP, {
        nombre: nombre.trim(),
        origenLatitud: origen[0], origenLongitud: origen[1],
        destinoLatitud: destino[0], destinoLongitud: destino[1],
        color: color,
      });
      if (error || !created) throw new Error(error || 'Error al crear ruta');

      // Send ALL intermediate points with orden index — no .slice(0,20)
      const puntos = osrmPts.slice(1, -1);
      const payload = puntos.map((pt, i) => ({ latitud: pt[0], longitud: pt[1], orden: i }));
      if (payload.length > 0) {
        const { error: ptErr } = await api.post(`${RUTAS_EP}/${created.id}/puntos-intermedios`, payload);
        if (ptErr) throw new Error('Error guardando geometría');
      }

      reset();
      await load();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Error al guardar');
    } finally { setSaving(false); }
  };

  // ─── Delete ─────────────────────────────────────────────────────
  const eliminar = async (id: string) => {
    setDelId(id);
    try {
      const { error } = await api.delete(`${RUTAS_EP}/${id}`);
      if (error) throw new Error(error);
      await load();
    } catch { setErr('Error al eliminar'); }
    finally { setDelId(null); }
  };

  const paso = !origen ? 1 : !destino ? 2 : 3;

  // ─── Build polyline: [Origen + sorted intermedios + Destino] ───
  const buildRoutePositions = (r: RutaDto): LL[] => {
    const sorted = [...r.puntosIntermedios].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
    return [toLL(r.origen), ...sorted.map(toLL), toLL(r.destino)];
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-950">

      {/* ═══════════ COLLAPSIBLE SIDEBAR ═══════════ */}
      <aside
        className={`relative flex shrink-0 flex-col border-r border-slate-800/60 bg-slate-950 transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'w-96' : 'w-0 overflow-hidden border-r-0'
        }`}
      >
        <div className="flex h-full w-96 flex-col">
          {/* ── Header ── */}
          <header className="flex items-center justify-between px-5 pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 ring-1 ring-emerald-500/25">
                <Globe className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight text-slate-100">EcoMovilidad AI</h1>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${backendDown ? 'bg-red-500' : 'bg-emerald-500'} animate-pulse`} />
                  <span className="text-[10px] font-medium text-slate-500">
                    {backendDown ? 'Backend offline' : 'Conectado'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={logout}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut size={16} />
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-colors"
                title="Ocultar panel"
              >
                <PanelLeftClose size={18} />
              </button>
            </div>
          </header>

          <div className="h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent" />

          {/* ── Tab Bar ── */}
          <div className="flex border-b border-slate-800/60">
            {[
              { key: 'rutas' as const, label: 'Rutas', icon: <Route size={13} /> },
              { key: 'asignaciones' as const, label: 'Asignaciones', icon: <Link2 size={13} /> },
              { key: 'seguimiento' as const, label: 'En Vivo', icon: <Radio size={13} /> },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[11px] font-semibold transition-colors ${
                  activeTab === tab.key
                    ? 'text-emerald-400 border-b-2 border-emerald-500 bg-emerald-500/5'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* ── Tab Content: Asignaciones ── */}
          {activeTab === 'asignaciones' && (
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <AsignacionesPanel />
            </div>
          )}

          {/* ── Tab Content: Seguimiento ── */}
          {activeTab === 'seguimiento' && (
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <PanelSeguimiento />
            </div>
          )}

          {/* ── Tab Content: Rutas (original) ── */}
          {activeTab === 'rutas' && (<>
          {/* ── New Route Button ── */}
          <div className="px-5 pt-4 pb-3">
            <button
              id="btn-nueva-ruta"
              onClick={() => creando ? reset() : (setCreando(true), setErr(null))}
              className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                creando
                  ? 'bg-slate-800/80 text-slate-400 ring-1 ring-slate-700 hover:bg-slate-700'
                  : 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 active:scale-[.98]'
              }`}
            >
              {creando
                ? <><X size={15} /> Cancelar</>
                : <><Plus size={15} /> Nueva Ruta</>
              }
            </button>
          </div>

          {/* ── Creation Panel ── */}
          {creando && (
            <div className="mx-5 mb-3 overflow-hidden rounded-xl bg-slate-900/70 ring-1 ring-slate-800">
              {/* Step bar */}
              <div className="flex border-b border-slate-800/80">
                {[
                  { n: 1, label: 'Origen', icon: <MapPin size={11} /> },
                  { n: 2, label: 'Destino', icon: <Flag size={11} /> },
                  { n: 3, label: 'Guardar', icon: <Save size={11} /> },
                ].map(s => (
                  <div
                    key={s.n}
                    className={`flex flex-1 items-center justify-center gap-1 py-2.5 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                      paso === s.n ? 'bg-emerald-500/10 text-emerald-400'
                        : paso > s.n ? 'text-emerald-600' : 'text-slate-600'
                    }`}
                  >
                    {s.icon} {s.label}
                  </div>
                ))}
              </div>

              <div className="space-y-3 p-4">
                <p className="flex items-center gap-1.5 text-xs text-slate-400">
                  <ChevronRight size={12} className="text-emerald-500" />
                  {paso === 1 && 'Haz clic en el mapa → Origen'}
                  {paso === 2 && 'Haz clic en el mapa → Destino'}
                  {paso === 3 && 'Personaliza y guarda tu ruta'}
                </p>

                {origen && (
                  <div className="flex items-center gap-2 rounded-lg bg-slate-950/60 px-3 py-2">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30">
                      <MapPin size={8} />
                    </span>
                    <span className="text-xs text-slate-300">{origen[0].toFixed(5)}, {origen[1].toFixed(5)}</span>
                  </div>
                )}
                {destino && (
                  <div className="flex items-center gap-2 rounded-lg bg-slate-950/60 px-3 py-2">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-sky-400 ring-1 ring-sky-500/30">
                      <Flag size={8} />
                    </span>
                    <span className="text-xs text-slate-300">{destino[0].toFixed(5)}, {destino[1].toFixed(5)}</span>
                  </div>
                )}

                {loadO && (
                  <div className="flex items-center gap-2 text-xs text-amber-400">
                    <Spinner size={12} className="text-amber-400" /> Calculando ruta…
                  </div>
                )}

                {dist !== null && (
                  <div className="flex items-center justify-between rounded-lg bg-emerald-500/10 px-3 py-2">
                    <span className="text-xs text-emerald-300">Distancia</span>
                    <span className="text-sm font-bold text-emerald-400">{dist} km</span>
                  </div>
                )}

                {paso === 3 && !loadO && (
                  <div className="space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between rounded-lg bg-slate-950/50 p-2 ring-1 ring-slate-800">
                      <span className="text-xs text-slate-400 ml-1">Color:</span>
                      <div className="flex gap-1.5">
                        {COLORS.map(c => (
                          <button
                            key={c.val}
                            onClick={() => setColor(c.val)}
                            className={`h-5 w-5 rounded-full transition-all duration-200 ${
                              color === c.val ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : 'opacity-70 hover:opacity-100 hover:scale-110'
                            }`}
                            style={{ backgroundColor: c.val }}
                            title={c.name}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <input
                      id="input-nombre-ruta"
                      type="text"
                      placeholder="Nombre de la ruta…"
                      value={nombre}
                      onChange={e => setNombre(e.target.value)}
                      autoFocus
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 transition-colors"
                    />
                    <button
                      id="btn-guardar-ruta"
                      onClick={guardar}
                      disabled={saving || !nombre.trim()}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/15 hover:bg-emerald-500 disabled:opacity-40 disabled:shadow-none active:scale-[.98] transition-all"
                    >
                      {saving
                        ? <><Spinner size={14} className="text-white" /> Guardando…</>
                        : <><Save size={14} /> Guardar Ruta</>
                      }
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Error banner ── */}
          {err && (
            <div className="mx-5 mb-3 rounded-lg bg-red-500/10 px-3 py-2 ring-1 ring-red-500/20">
              <p className="flex items-center gap-1.5 text-xs text-red-400"><AlertTriangle size={12} /> {err}</p>
            </div>
          )}

          {/* ── Backend down ── */}
          {backendDown && !loadingR && (
            <div className="mx-5 mb-3 rounded-xl bg-amber-500/10 px-4 py-3 ring-1 ring-amber-500/20">
              <div className="flex items-start gap-2">
                <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-400" />
                <div>
                  <p className="text-xs font-semibold text-amber-300">Backend no disponible</p>
                  <p className="mt-0.5 text-[11px] text-amber-400/70">Verifica .NET y Docker.</p>
                  <button onClick={load} className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition-colors">
                    <RefreshCw size={10} /> Reintentar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Route List ── */}
          <div className="flex min-h-0 flex-1 flex-col px-5">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                <Route size={11} /> Rutas guardadas
              </h2>
              {!loadingR && (
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-400">{rutas.length}</span>
              )}
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto pb-4 scrollbar-thin scrollbar-thumb-slate-800">
              {loadingR ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="h-[72px] animate-pulse rounded-xl bg-slate-900/70" style={{ animationDelay: `${i * 80}ms` }} />
                ))
              ) : rutas.length === 0 && !backendDown ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <Route size={28} className="mb-2 text-slate-700" />
                  <p className="text-sm text-slate-500">Sin rutas aún</p>
                  <p className="mt-1 text-[11px] text-slate-600">Crea tu primera ruta</p>
                </div>
              ) : (
                rutas.map((r, idx) => (
                  <div
                    key={r.id}
                    className="group rounded-xl bg-slate-900/60 p-3.5 ring-1 ring-slate-800/70 transition-all hover:bg-slate-900 hover:ring-slate-700/60"
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: r.color || '#3b82f6' }} />
                          <p className="truncate text-sm font-semibold text-slate-200">{r.nombre}</p>
                        </div>
                        <div className="mt-1.5 flex items-center gap-2">
                          <span className="text-xs font-medium text-slate-400">{r.distanciaTotalKm} km</span>
                          <span className="text-slate-700">·</span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${estadoBadge[r.estado] || 'bg-slate-800 text-slate-400 ring-slate-700'}`}>
                            {r.estado}
                          </span>
                        </div>
                        <p className="mt-1 text-[10px] text-slate-600">{fmtDate(r.fechaCreacion)}</p>
                      </div>
                      <button
                        id={`btn-eliminar-${r.id}`}
                        onClick={() => eliminar(r.id)}
                        disabled={delId === r.id}
                        title="Eliminar ruta"
                        className="shrink-0 rounded-lg p-2 text-red-400/50 opacity-0 transition-all hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100 disabled:opacity-50"
                      >
                        {delId === r.id ? <Spinner size={14} className="text-red-400" /> : <Trash2 size={15} />}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          </>)}{/* end activeTab === rutas */}

          {/* ── Footer ── */}
          <footer className="border-t border-slate-800/60 px-5 py-3">
            <p className="flex items-center gap-1.5 text-[10px] text-slate-600">
              <CheckCircle2 size={10} className="text-emerald-600" />
              EcoMovilidad AI · Santa Cruz, Bolivia
            </p>
          </footer>
        </div>
      </aside>

      {/* ═══════════ MAP AREA ═══════════ */}
      <div className="relative flex-1">
        {/* Toggle sidebar button (visible when sidebar is closed) */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute left-4 top-4 z-[1000] flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900/90 text-slate-300 shadow-xl ring-1 ring-slate-700/50 backdrop-blur-sm hover:bg-slate-800 hover:text-white transition-all"
            title="Mostrar panel"
          >
            <PanelLeftOpen size={18} />
          </button>
        )}

        <MapContainer center={CENTER} zoom={13} className="h-full w-full" scrollWheelZoom zoomControl={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler on={creando && paso < 3} orig={origen} setO={setOrigen} setD={setDestino} />

          {/* Saved routes */}
          {rutas.map(r => (
            <div key={r.id}>
              <Polyline
                positions={buildRoutePositions(r)}
                pathOptions={{ color: r.color || '#3b82f6', weight: 4, opacity: 0.85, lineCap: 'round', lineJoin: 'round' }}
              />
              <Marker position={toLL(r.origen)} icon={savedIcon}>
                <Popup>
                  <strong>{r.nombre}</strong><br />
                  <span style={{ fontSize: 12, color: '#64748b' }}>{r.distanciaTotalKm} km · {r.estado}</span>
                </Popup>
              </Marker>
            </div>
          ))}

          {/* OSRM preview (glow + solid) */}
          {osrmPts.length > 1 && (
            <>
              <Polyline positions={osrmPts} pathOptions={{ color: color, weight: 10, opacity: 0.2, lineCap: 'round' }} />
              <Polyline positions={osrmPts} pathOptions={{ color: color, weight: 5, opacity: 0.9, lineCap: 'round', lineJoin: 'round' }} />
            </>
          )}

          {origen  && <Marker position={origen}  icon={origenIcon}><Popup><strong>📍 Origen</strong></Popup></Marker>}
          {destino && <Marker position={destino} icon={destinoIcon}><Popup><strong>📍 Destino</strong></Popup></Marker>}
        </MapContainer>

        {/* Floating step indicator */}
        {creando && (
          <div className="pointer-events-none absolute left-1/2 top-5 z-[1000] -translate-x-1/2">
            <div className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold shadow-xl backdrop-blur-md ${
              paso === 3
                ? 'bg-emerald-500/90 text-white'
                : 'bg-slate-900/85 text-slate-200 ring-1 ring-slate-700/50'
            }`}>
              {paso === 1 && <><MapPin size={13} className="text-emerald-400" /> Haz clic en el mapa → Origen</>}
              {paso === 2 && <><Flag size={13} className="text-sky-400" /> Haz clic en el mapa → Destino</>}
              {paso === 3 && <><CheckCircle2 size={13} /> Ruta calculada — guárdala en el panel</>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
