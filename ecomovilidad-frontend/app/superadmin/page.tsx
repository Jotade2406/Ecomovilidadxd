'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck, Building2, Plus, Copy, Check,
  LogOut, Loader2, Users, RefreshCw, Key, Leaf, Trash2, AlertTriangle,
  Crown, ChevronDown, ChevronUp, UserCheck, Eye, EyeOff, UserPlus,
} from 'lucide-react';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5034';
const SA_TOKEN_KEY = 'sa_token';

// ─── Tipos ───────────────────────────────────────────────────────────

interface TenantInfo {
  id: string;
  nombre: string;
  codigo: string;
  estado: string;
  creadoEn: string;
  totalUsuarios: number;
}

interface AdminDisponible {
  id: string;
  email: string;
  nombre: string;
  tenantActual: string;
}

interface CreacionResult {
  tenant: TenantInfo;
  admin: { id: string; email: string; nombre: string };
  passwordAdmin: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────

function saFetch<T>(path: string, opts?: RequestInit): Promise<{ data: T | null; error: string | null }> {
  const token = typeof window !== 'undefined' ? localStorage.getItem(SA_TOKEN_KEY) : null;
  return fetch(`${BASE_URL}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts?.headers ?? {}),
    },
  })
    .then(async (r) => {
      const body = await r.json().catch(() => null);
      if (!r.ok) return { data: null, error: body?.message ?? `Error ${r.status}` };
      return { data: body as T, error: null };
    })
    .catch((e) => ({ data: null, error: e.message ?? 'Error de conexión' }));
}

// ─── Botón copiar ─────────────────────────────────────────────────────

function CopyBtn({ text, size = 13 }: { text: string; size?: number }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800); }}
      className="ml-1.5 rounded p-1 transition hover:bg-white/10"
      title="Copiar"
    >
      {copied ? <Check size={size} className="text-emerald-400" /> : <Copy size={size} className="text-slate-400" />}
    </button>
  );
}

// ─── Tarjeta de tenant ────────────────────────────────────────────────

function TenantCard({ t, isNew, onEliminar, admins, onAdminAsignado }: {
  t: TenantInfo;
  isNew?: boolean;
  onEliminar: (id: string) => Promise<string | null>;
  admins: AdminDisponible[];
  onAdminAsignado: () => void;
}) {
  const [confirmando, setConfirmando]     = useState(false);
  const [eliminando, setEliminando]       = useState(false);
  const [errElim, setErrElim]             = useState<string | null>(null);
  const [showAdmins, setShowAdmins]       = useState(false);
  const [asignando, setAsignando]         = useState<string | null>(null);
  const [errAdmin, setErrAdmin]           = useState<string | null>(null);

  const TENANT_DEMO = '00000000-0000-0000-0000-000000000001';

  // Admins sin asignar (en tenant demo) o ya asignados a esta institución
  const adminsDisponibles = admins.filter(
    a => a.tenantActual === TENANT_DEMO || a.tenantActual === t.id
  );

  const adminActual = admins.find(a => a.tenantActual === t.id);

  const handleEliminar = async () => {
    setEliminando(true);
    setErrElim(null);
    const err = await onEliminar(t.id);
    if (err) { setErrElim(err); setEliminando(false); setConfirmando(false); }
  };

  const handleAsignar = async (adminId: string) => {
    setAsignando(adminId);
    setErrAdmin(null);
    const token = localStorage.getItem('sa_token');
    const res = await fetch(
      `${BASE_URL}/api/SuperAdmin/tenants/${t.id}/asignar-admin/${adminId}`,
      { method: 'PUT', headers: { Authorization: `Bearer ${token}` } }
    );
    setAsignando(null);
    if (res.ok) {
      setShowAdmins(false);
      onAdminAsignado();
    } else {
      const body = await res.json().catch(() => null);
      setErrAdmin(body?.message ?? 'Error al asignar admin');
    }
  };

  return (
    <div className={`rounded-2xl border transition-all ${
      isNew
        ? 'border-emerald-500/50 bg-emerald-500/5 ring-1 ring-emerald-500/20'
        : 'border-slate-700/60 bg-slate-800/50'
    }`}>
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
              <Building2 size={18} className="text-emerald-400" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-100 truncate">{t.nombre}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {new Date(t.creadoEn).toLocaleDateString('es-BO', {
                  day: '2-digit', month: 'short', year: 'numeric',
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
              t.estado === 'Activo' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-500/20 text-slate-400'
            }`}>{t.estado}</span>
            {!confirmando ? (
              <button
                onClick={() => setConfirmando(true)}
                disabled={t.totalUsuarios > 0}
                title={t.totalUsuarios > 0 ? `No se puede eliminar: tiene ${t.totalUsuarios} usuario(s)` : 'Eliminar institución'}
                className="rounded-lg p-1.5 text-slate-600 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-25 disabled:cursor-not-allowed"
              >
                <Trash2 size={14} />
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-red-400 font-medium">¿Eliminar?</span>
                <button onClick={handleEliminar} disabled={eliminando}
                  className="rounded px-2 py-0.5 text-[10px] font-semibold bg-red-500/15 text-red-400 hover:bg-red-500/25 transition disabled:opacity-50">
                  {eliminando ? <Loader2 size={10} className="animate-spin inline" /> : 'Sí'}
                </button>
                <button onClick={() => { setConfirmando(false); setErrElim(null); }}
                  className="rounded px-2 py-0.5 text-[10px] font-semibold bg-slate-700/60 text-slate-400 hover:bg-slate-700 transition">
                  No
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Código + stats */}
        <div className="mt-4 rounded-xl bg-slate-900/60 px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500 mb-1">Código de acceso</p>
            <div className="flex items-center gap-1">
              <Key size={13} className="text-amber-400" />
              <span className="font-mono text-lg font-bold tracking-widest text-amber-400">{t.codigo}</span>
              <CopyBtn text={t.codigo} size={14} />
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-500 mb-1">Usuarios</p>
            <div className="flex items-center gap-1 justify-end">
              <Users size={13} className="text-slate-400" />
              <span className="text-sm font-semibold text-slate-300">{t.totalUsuarios}</span>
            </div>
          </div>
        </div>

        {/* Admin actual */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Crown size={12} className={adminActual ? 'text-violet-400' : 'text-slate-600'} />
            <span className="text-[11px] text-slate-500 truncate">
              {adminActual
                ? <><span className="text-violet-400 font-medium">{adminActual.nombre}</span> <span className="text-slate-600">({adminActual.email})</span></>
                : 'Sin administrador asignado'}
            </span>
          </div>
          <button
            onClick={() => { setShowAdmins(s => !s); setErrAdmin(null); }}
            className="flex items-center gap-1.5 shrink-0 rounded-lg border border-violet-500/25 bg-violet-500/8 px-2.5 py-1.5 text-[11px] font-medium text-violet-400 transition hover:bg-violet-500/15"
          >
            <UserCheck size={11} />
            {adminActual ? 'Cambiar admin' : 'Asignar admin'}
            {showAdmins ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
          </button>
        </div>

        {errElim && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 ring-1 ring-red-500/20">
            <AlertTriangle size={12} className="text-red-400 shrink-0" />
            <p className="text-[11px] text-red-400">{errElim}</p>
          </div>
        )}
      </div>

      {/* Panel selección de admin */}
      {showAdmins && (
        <div className="border-t border-slate-700/50 px-5 pb-5 pt-4 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-3">
            Seleccioná el administrador para {t.nombre}
          </p>
          {errAdmin && (
            <div className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 mb-2 ring-1 ring-red-500/20">
              <AlertTriangle size={11} className="text-red-400 shrink-0" />
              <p className="text-[11px] text-red-400">{errAdmin}</p>
            </div>
          )}
          {adminsDisponibles.length === 0 ? (
            <div className="rounded-lg border border-slate-700/40 bg-slate-900/30 px-4 py-3 text-center">
              <p className="text-xs text-slate-500">No hay cuentas de AdminInstitucion disponibles.</p>
              <p className="text-[11px] text-slate-600 mt-1">Creá una desde <span className="text-emerald-500/80">/register</span> eligiendo "Admin. Institución".</p>
            </div>
          ) : (
            adminsDisponibles.map(admin => {
              const esActual = admin.tenantActual === t.id;
              return (
                <div key={admin.id}
                  className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 transition ${
                    esActual
                      ? 'border-violet-500/30 bg-violet-500/8'
                      : 'border-slate-700/40 bg-slate-900/30 hover:border-slate-600/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold ${
                      esActual ? 'bg-violet-500/20 text-violet-400' : 'bg-slate-700/60 text-slate-400'
                    }`}>
                      {admin.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-200 truncate">{admin.nombre}</p>
                      <p className="text-[10px] text-slate-500 truncate">{admin.email}</p>
                    </div>
                  </div>
                  {esActual ? (
                    <span className="shrink-0 flex items-center gap-1 text-[10px] font-medium text-violet-400">
                      <Crown size={10} /> Admin actual
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAsignar(admin.id)}
                      disabled={asignando === admin.id}
                      className="shrink-0 flex items-center gap-1.5 rounded-lg bg-violet-500 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-violet-400 active:scale-[0.97] disabled:opacity-50"
                    >
                      {asignando === admin.id
                        ? <Loader2 size={10} className="animate-spin" />
                        : <Crown size={10} />}
                      Asignar
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL
// ═══════════════════════════════════════════════════════════════════

export default function SuperAdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Login state
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Dashboard state
  const [tenants, setTenants] = useState<TenantInfo[]>([]);
  const [admins, setAdmins] = useState<AdminDisponible[]>([]);
  const [loading, setLoading] = useState(false);

  // Formulario nueva institución
  const [newTenantNombre, setNewTenantNombre] = useState('');
  const [adminNombre, setAdminNombre] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [creacionResult, setCreacionResult] = useState<CreacionResult | null>(null);

  // ── Verificar si ya hay token ──────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem(SA_TOKEN_KEY);
    if (token) setLoggedIn(true);
    setCheckingAuth(false);
  }, []);

  // ── Cargar tenants ─────────────────────────────────────────────────
  const fetchTenants = useCallback(async () => {
    setLoading(true);
    const { data } = await saFetch<TenantInfo[]>('/api/SuperAdmin/tenants');
    if (data) setTenants(data);
    setLoading(false);
  }, []);

  const fetchAdmins = useCallback(async () => {
    const { data } = await saFetch<AdminDisponible[]>('/api/SuperAdmin/admins');
    if (data) setAdmins(data);
  }, []);

  useEffect(() => {
    if (loggedIn) { fetchTenants(); fetchAdmins(); }
  }, [loggedIn, fetchTenants, fetchAdmins]);

  // ── Login ──────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    const { data, error } = await saFetch<{ token: string }>('/api/SuperAdmin/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });

    if (error || !data) {
      setLoginError(error ?? 'Error desconocido');
      setLoginLoading(false);
      return;
    }

    localStorage.setItem(SA_TOKEN_KEY, data.token);
    setLoggedIn(true);
    setLoginLoading(false);
  };

  // ── Logout ─────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem(SA_TOKEN_KEY);
    setLoggedIn(false);
    setTenants([]);
    setPassword('');
  };

  // ── Crear tenant + admin ───────────────────────────────────────────
  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantNombre.trim() || !adminNombre.trim() || !adminEmail.trim() || !adminPassword) return;
    setCreateError(null);
    setCreating(true);
    setCreacionResult(null);

    const { data, error } = await saFetch<{ tenant: TenantInfo; admin: { id: string; email: string; nombre: string } }>(
      '/api/SuperAdmin/tenants/con-admin',
      {
        method: 'POST',
        body: JSON.stringify({
          nombreInstitucion: newTenantNombre.trim(),
          nombreAdmin: adminNombre.trim(),
          emailAdmin: adminEmail.trim(),
          passwordAdmin: adminPassword,
        }),
      }
    );

    if (error || !data) {
      setCreateError(error ?? 'Error al crear la institución');
      setCreating(false);
      return;
    }

    setCreacionResult({ tenant: data.tenant, admin: data.admin, passwordAdmin: adminPassword });
    setNewTenantNombre('');
    setAdminNombre('');
    setAdminEmail('');
    setAdminPassword('');
    setCreating(false);
    await fetchTenants();
    await fetchAdmins();
    setTimeout(() => setCreacionResult(null), 30000);
  };

  // ── Eliminar tenant ────────────────────────────────────────────────
  const handleEliminar = async (id: string): Promise<string | null> => {
    const { error } = await saFetch(`/api/SuperAdmin/tenants/${id}`, {
      method: 'DELETE',
    });
    if (!error) await fetchTenants();
    return error;
  };

  // ── Loading inicial ────────────────────────────────────────────────
  if (checkingAuth) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0A0F1E]">
        <Loader2 size={24} className="animate-spin text-emerald-500" />
      </div>
    );
  }

  // ══ PANTALLA DE LOGIN ═════════════════════════════════════════════

  if (!loggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0F1E] px-4">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.06),transparent_70%)]" />

        <div className="relative w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/20">
              <ShieldCheck size={28} className="text-emerald-400" />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold text-slate-100">Administración Central</h1>
              <p className="mt-1 text-sm text-slate-500">EcoMovilidad — Acceso restringido</p>
            </div>
          </div>

          <form
            onSubmit={handleLogin}
            className="rounded-2xl border border-slate-700/60 bg-slate-800/50 p-6 space-y-4 shadow-2xl shadow-black/40"
          >
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Contraseña de administrador
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoFocus
                className="w-full rounded-xl border border-slate-600 bg-slate-700/60 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/30 transition-all"
              />
            </div>

            {loginError && (
              <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400 ring-1 ring-red-500/20">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={!password || loginLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 active:scale-[0.98] disabled:opacity-50"
            >
              {loginLoading ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
              {loginLoading ? 'Verificando…' : 'Ingresar'}
            </button>
          </form>

          <p className="mt-6 text-center text-[11px] text-slate-700">
            Esta página no es accesible desde el sistema principal
          </p>
        </div>
      </div>
    );
  }

  // ══ DASHBOARD SUPERADMIN ══════════════════════════════════════════

  return (
    <div className="min-h-screen bg-[#0A0F1E]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.05),transparent_60%)]" />

      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-700/60 bg-[#0A0F1E]/90 px-6 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
            <Leaf size={15} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-100">EcoMovilidad</p>
            <p className="text-[10px] text-slate-500">Panel de Administración Central</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { fetchTenants(); fetchAdmins(); }}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-400 transition hover:border-slate-600 hover:text-slate-300"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            Actualizar
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs text-red-400 transition hover:bg-red-500/20"
          >
            <LogOut size={12} />
            Salir
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8 space-y-8">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: 'Instituciones activas', value: tenants.filter(t => t.estado === 'Activo').length, color: 'text-emerald-400' },
            { label: 'Total instituciones', value: tenants.length, color: 'text-slate-300' },
            { label: 'Total usuarios', value: tenants.reduce((s, t) => s + t.totalUsuarios, 0), color: 'text-sky-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-2xl border border-slate-700/60 bg-slate-800/40 px-5 py-4">
              <p className="text-xs text-slate-500">{label}</p>
              <p className={`mt-1 text-3xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Formulario nueva institución */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-5 sticky top-20">
              <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-4">
                <Plus size={15} className="text-emerald-400" />
                Nueva institución
              </h2>

              <form onSubmit={handleCrear} className="space-y-3">
                {/* Institución */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">
                    Nombre del colegio o empresa
                  </label>
                  <input
                    type="text"
                    value={newTenantNombre}
                    onChange={(e) => setNewTenantNombre(e.target.value)}
                    placeholder="Ej: Colegio San Juan"
                    className="w-full rounded-xl border border-slate-600 bg-slate-700/60 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                  />
                </div>

                {/* Separador admin */}
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex-1 h-px bg-slate-700/60" />
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-violet-400">
                    <UserPlus size={11} /> Administrador
                  </span>
                  <div className="flex-1 h-px bg-slate-700/60" />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    value={adminNombre}
                    onChange={(e) => setAdminNombre(e.target.value)}
                    placeholder="Ej: Carlos Mamani"
                    className="w-full rounded-xl border border-slate-600 bg-slate-700/60 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-violet-500/70 focus:ring-1 focus:ring-violet-500/30 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@colegio.com"
                    className="w-full rounded-xl border border-slate-600 bg-slate-700/60 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-violet-500/70 focus:ring-1 focus:ring-violet-500/30 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-600 bg-slate-700/60 px-3 py-2 pr-9 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-violet-500/70 focus:ring-1 focus:ring-violet-500/30 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(s => !s)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {createError && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 ring-1 ring-red-500/20">
                    <AlertTriangle size={11} className="text-red-400 shrink-0" />
                    <p className="text-[11px] text-red-400">{createError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!newTenantNombre.trim() || !adminNombre.trim() || !adminEmail.trim() || !adminPassword || creating}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 active:scale-[0.98] disabled:opacity-50"
                >
                  {creating
                    ? <><Loader2 size={14} className="animate-spin" /> Creando…</>
                    : <><Plus size={14} /> Crear institución y admin</>}
                </button>
              </form>

              {creacionResult && (
                <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3">
                  <p className="text-[11px] text-emerald-400 font-semibold">✓ Institución y admin creados</p>

                  <div>
                    <p className="text-[10px] text-slate-500 mb-1">Código de acceso</p>
                    <div className="flex items-center gap-2 rounded-lg bg-slate-900/60 px-3 py-2">
                      <Key size={12} className="text-amber-400 shrink-0" />
                      <span className="font-mono font-bold text-amber-400 tracking-widest flex-1">
                        {creacionResult.tenant.codigo}
                      </span>
                      <CopyBtn text={creacionResult.tenant.codigo} size={14} />
                    </div>
                  </div>

                  <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-3 space-y-2">
                    <p className="text-[10px] font-semibold text-violet-400 uppercase tracking-widest">Credenciales del admin</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 w-16 shrink-0">Email</span>
                      <span className="text-[11px] text-slate-200 font-mono flex-1 truncate">{creacionResult.admin.email}</span>
                      <CopyBtn text={creacionResult.admin.email} size={12} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 w-16 shrink-0">Contraseña</span>
                      <span className="text-[11px] text-slate-200 font-mono flex-1">{creacionResult.passwordAdmin}</span>
                      <CopyBtn text={creacionResult.passwordAdmin} size={12} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Lista de tenants */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              Instituciones registradas
            </h2>

            {loading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 size={22} className="animate-spin text-emerald-500" />
              </div>
            ) : tenants.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-2xl border border-slate-700/60 bg-slate-800/30">
                <Building2 size={28} className="text-slate-600" />
                <p className="text-sm text-slate-500">Aún no hay instituciones — crea la primera</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tenants.map((t) => (
                  <TenantCard
                    key={t.id}
                    t={t}
                    isNew={creacionResult?.tenant.id === t.id}
                    onEliminar={handleEliminar}
                    admins={admins}
                    onAdminAsignado={() => { fetchTenants(); fetchAdmins(); }}
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
