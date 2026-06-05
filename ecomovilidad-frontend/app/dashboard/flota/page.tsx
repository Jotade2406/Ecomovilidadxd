'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import {
  Bus, Plus, Loader2, RefreshCw, Fuel, Users2,
  Hash, Truck, UserCheck, X, Check,
} from 'lucide-react';

// ─── Tipos ───────────────────────────────────────────────────────────

interface Vehiculo {
  id: string;
  placa: string;
  capacidad: number;
  fuelRate: number;
}

interface Conductor {
  id: string;
  nombre: string;
  licencia: string;
  turnos: string;
}

// ─── Formulario inline ────────────────────────────────────────────────

function CrearVehiculoForm({ onCreado }: { onCreado: () => void }) {
  const [placa, setPlaca]       = useState('');
  const [capacidad, setCapacidad] = useState('');
  const [fuelRate, setFuelRate] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [ok, setOk]             = useState(false);

  const handleCrear = async () => {
    if (!placa.trim() || !capacidad || !fuelRate) return;
    setError(null);
    setLoading(true);

    const { error: err } = await api.post('/api/Flota/vehiculos', {
      placa: placa.trim().toUpperCase(),
      capacidad: parseInt(capacidad),
      fuelRate: parseFloat(fuelRate),
    });

    setLoading(false);
    if (err) { setError(err); return; }

    setOk(true);
    setPlaca(''); setCapacidad(''); setFuelRate('');
    setTimeout(() => setOk(false), 2000);
    onCreado();
  };

  const inputCls = 'w-full rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/15';

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 space-y-4">
      <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
        <Plus size={14} className="text-emerald-400" />
        Nuevo vehículo
      </h3>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            Placa
          </label>
          <input
            value={placa}
            onChange={e => setPlaca(e.target.value)}
            placeholder="Ej: ABC-1234"
            className={inputCls}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            Capacidad (personas)
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={capacidad}
            onChange={e => setCapacidad(e.target.value)}
            placeholder="Ej: 40"
            className={inputCls}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            Consumo (L/100km)
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={fuelRate}
            onChange={e => setFuelRate(e.target.value)}
            placeholder="Ej: 8.5"
            className={inputCls}
          />
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400 ring-1 ring-red-500/20">
          {error}
        </p>
      )}

      <button
        onClick={handleCrear}
        disabled={!placa.trim() || !capacidad || !fuelRate || loading}
        className="flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? <Loader2 size={14} className="animate-spin" />
         : ok ? <Check size={14} />
         : <Plus size={14} />}
        {loading ? 'Guardando...' : ok ? 'Guardado' : 'Agregar vehículo'}
      </button>
    </div>
  );
}

// ─── Tarjeta vehículo ─────────────────────────────────────────────────

function VehiculoCard({ v }: { v: Vehiculo }) {
  return (
    <div className="group rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 transition-all hover:border-white/[0.10]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 ring-1 ring-blue-500/20">
            <Truck size={17} className="text-blue-400" />
          </div>
          <div>
            <p className="font-bold text-white tracking-widest">{v.placa}</p>
            <p className="text-xs text-slate-500 mt-0.5">ID: {v.id.slice(0, 8)}…</p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-3 py-2">
          <Users2 size={12} className="text-slate-500 shrink-0" />
          <div>
            <p className="text-[10px] text-slate-600 uppercase tracking-wider">Capacidad</p>
            <p className="text-sm font-semibold text-slate-300">{v.capacidad} personas</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-3 py-2">
          <Fuel size={12} className="text-slate-500 shrink-0" />
          <div>
            <p className="text-[10px] text-slate-600 uppercase tracking-wider">Consumo</p>
            <p className="text-sm font-semibold text-slate-300">{v.fuelRate} L/100km</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tarjeta conductor ────────────────────────────────────────────────

function ConductorCard({ c }: { c: Conductor }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-5 py-4 transition-all hover:border-white/[0.10]">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 ring-1 ring-violet-500/20">
        <UserCheck size={17} className="text-violet-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-slate-200 truncate">{c.nombre}</p>
        <div className="mt-0.5 flex items-center gap-3">
          <span className="flex items-center gap-1 text-[11px] text-slate-500">
            <Hash size={9} /> {c.licencia}
          </span>
          <span className="text-[11px] text-slate-600">·</span>
          <span className="text-[11px] text-slate-500">{c.turnos}</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL
// ═══════════════════════════════════════════════════════════════════

export default function FlotaPage() {
  const [vehiculos, setVehiculos]   = useState<Vehiculo[]>([]);
  const [conductores, setConductores] = useState<Conductor[]>([]);
  const [loading, setLoading]       = useState(true);
  const [tab, setTab]               = useState<'vehiculos' | 'conductores'>('vehiculos');

  const fetchFlota = useCallback(async () => {
    setLoading(true);
    const [resV, resC] = await Promise.all([
      api.get<Vehiculo[]>('/api/Flota/vehiculos'),
      api.get<Conductor[]>('/api/Flota/conductores'),
    ]);
    if (resV.data) setVehiculos(resV.data);
    if (resC.data) setConductores(resC.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchFlota(); }, [fetchFlota]);

  return (
    <div className="min-h-full p-6 lg:p-8 space-y-6" style={{ background: 'var(--bg-base)' }}>

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Flota</h1>
          <p className="mt-1 text-sm text-slate-500">
            {vehiculos.length} vehículo{vehiculos.length !== 1 ? 's' : ''} · {conductores.length} conductor{conductores.length !== 1 ? 'es' : ''}
          </p>
        </div>
        <button
          onClick={fetchFlota}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.03] px-4 py-2 text-sm text-slate-400 transition hover:border-white/[0.12] hover:text-slate-300 disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      {/* Formulario crear vehículo */}
      <CrearVehiculoForm onCreado={fetchFlota} />

      {/* Tabs */}
      <div>
        <div className="flex gap-1 border-b border-white/[0.06] mb-5">
          {(['vehiculos', 'conductores'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${
                tab === t
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              {t === 'vehiculos' ? <Bus size={14} /> : <UserCheck size={14} />}
              {t === 'vehiculos' ? `Vehículos (${vehiculos.length})` : `Conductores (${conductores.length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 size={20} className="animate-spin text-emerald-500" />
          </div>
        ) : tab === 'vehiculos' ? (
          vehiculos.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              <Truck size={28} className="text-slate-700" />
              <p className="text-sm text-slate-500">Sin vehículos registrados</p>
              <p className="text-xs text-slate-600">Usá el formulario de arriba para agregar el primero</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {vehiculos.map(v => <VehiculoCard key={v.id} v={v} />)}
            </div>
          )
        ) : (
          conductores.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              <UserCheck size={28} className="text-slate-700" />
              <p className="text-sm text-slate-500">Sin conductores registrados</p>
              <p className="text-xs text-slate-600">Registrá un usuario con rol "Conductor" en Usuarios</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {conductores.map(c => <ConductorCard key={c.id} c={c} />)}
            </div>
          )
        )}
      </div>
    </div>
  );
}
