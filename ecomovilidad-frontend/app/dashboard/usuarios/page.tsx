'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  Users, GraduationCap, Bus, User, ShieldCheck, Loader2,
  RefreshCw, Sparkles, Copy, Check, UserPlus, ChevronDown, X,
} from 'lucide-react';

// ─── Tipos ───────────────────────────────────────────────────────────

interface UsuarioItem {
  email: string;
  nombre: string;
  role: string;
}

interface CredencialesGeneradas {
  email: string;
  password: string;
  generadaPorIA: boolean;
  nombre: string;
  rol: string;
}

// ─── Meta de roles ───────────────────────────────────────────────────

const ROLE_META: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  AdminInstitucion: { label: 'Admin',      color: 'text-violet-400',  bg: 'bg-violet-500/10 ring-violet-500/30',  icon: ShieldCheck    },
  Chofer:           { label: 'Conductor',  color: 'text-blue-400',    bg: 'bg-blue-500/10 ring-blue-500/30',      icon: Bus            },
  Estudiante:       { label: 'Estudiante', color: 'text-emerald-400', bg: 'bg-emerald-500/10 ring-emerald-500/30',icon: GraduationCap  },
  Cliente:          { label: 'Cliente',    color: 'text-amber-400',   bg: 'bg-amber-500/10 ring-amber-500/30',    icon: User           },
};

const ROLES_CREABLES = ['Estudiante', 'Chofer', 'Cliente'] as const;

function RoleBadge({ role }: { role: string }) {
  const meta = ROLE_META[role] ?? { label: role, color: 'text-slate-400', bg: 'bg-slate-500/10 ring-slate-500/30', icon: User };
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${meta.bg} ${meta.color}`}>
      <Icon size={11} />
      {meta.label}
    </span>
  );
}

// ─── Botón copiar ────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="ml-2 rounded-md p-1 transition-colors hover:bg-slate-600/50"
      title="Copiar"
    >
      {copied
        ? <Check size={13} className="text-emerald-400" />
        : <Copy size={13} className="text-slate-400" />}
    </button>
  );
}

// ─── Panel de creación con IA ────────────────────────────────────────

type PanelStep = 'form' | 'generating' | 'preview' | 'creating' | 'done';

function CrearUsuarioPanel({ onCreado }: { onCreado: () => void }) {
  const [step, setStep] = useState<PanelStep>('form');
  const [nombre, setNombre] = useState('');
  const [rol, setRol] = useState<string>('Estudiante');
  const [creds, setCreds] = useState<CredencialesGeneradas | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const reset = () => {
    setStep('form');
    setNombre('');
    setRol('Estudiante');
    setCreds(null);
    setErrorMsg(null);
  };

  const handleGenerar = async () => {
    if (!nombre.trim()) return;
    setErrorMsg(null);
    setStep('generating');

    const { data, error } = await api.post<CredencialesGeneradas>(
      '/api/Usuarios/generar-credenciales',
      { nombre: nombre.trim(), rol }
    );

    if (error || !data) {
      setErrorMsg(error ?? 'Error generando credenciales');
      setStep('form');
      return;
    }
    setCreds(data);
    setStep('preview');
  };

  const handleCrear = async () => {
    if (!creds) return;
    setStep('creating');

    const { error } = await api.post('/api/Usuarios/crear', {
      nombre: creds.nombre,
      rol: creds.rol,
      email: creds.email,
      password: creds.password,
    });

    if (error) {
      setErrorMsg(error);
      setStep('preview');
      return;
    }
    setStep('done');
    onCreado();
  };

  // ── Paso: formulario ─────────────────────────────────────────────
  if (step === 'form') {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Nombre completo</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Juan Carlos Pérez"
            className="w-full rounded-lg border border-slate-600 bg-slate-700/60 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/30 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Rol</label>
          <div className="relative">
            <select
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              className="w-full appearance-none rounded-lg border border-slate-600 bg-slate-700/60 px-3 py-2 pr-8 text-sm text-slate-200 outline-none focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/30 transition-all"
            >
              {ROLES_CREABLES.map((r) => (
                <option key={r} value={r}>{ROLE_META[r]?.label ?? r}</option>
              ))}
            </select>
            <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        {errorMsg && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400 ring-1 ring-red-500/20">
            {errorMsg}
          </p>
        )}

        <button
          onClick={handleGenerar}
          disabled={!nombre.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-500/15 px-4 py-2.5 text-sm font-semibold text-violet-300 ring-1 ring-violet-500/30 transition-all hover:bg-violet-500/25 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          <Sparkles size={15} />
          Generar credenciales con IA
        </button>
      </div>
    );
  }

  // ── Paso: generando ──────────────────────────────────────────────
  if (step === 'generating') {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
        <div className="relative">
          <Sparkles size={28} className="text-violet-400 animate-pulse" />
        </div>
        <p className="text-sm font-medium text-slate-300">La IA está generando las credenciales…</p>
        <p className="text-xs text-slate-500">Esto tarda unos segundos</p>
        <Loader2 size={16} className="animate-spin text-violet-400 mt-1" />
      </div>
    );
  }

  // ── Paso: preview ────────────────────────────────────────────────
  if (step === 'preview' && creds) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          {creds.generadaPorIA
            ? <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-semibold text-violet-400 ring-1 ring-violet-500/30"><Sparkles size={9} /> Generado por IA</span>
            : <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/15 px-2 py-0.5 text-[10px] font-semibold text-slate-400 ring-1 ring-slate-500/30">Generado localmente</span>
          }
        </div>

        <div className="rounded-xl border border-slate-600/60 bg-slate-800/60 divide-y divide-slate-700/50">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Usuario</p>
              <p className="text-sm font-semibold text-slate-200 mt-0.5">{creds.nombre}</p>
            </div>
            <RoleBadge role={creds.rol} />
          </div>

          <div className="flex items-center justify-between px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Email</p>
              <p className="text-sm font-mono text-emerald-400 mt-0.5 truncate">{creds.email}</p>
            </div>
            <CopyButton text={creds.email} />
          </div>

          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Contraseña</p>
              <p className="text-sm font-mono text-sky-400 mt-0.5">{creds.password}</p>
            </div>
            <CopyButton text={creds.password} />
          </div>
        </div>

        {errorMsg && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400 ring-1 ring-red-500/20">
            {errorMsg}
          </p>
        )}

        <div className="flex gap-2">
          <button
            onClick={reset}
            className="flex items-center gap-1.5 rounded-lg border border-slate-600 px-3 py-2 text-xs font-medium text-slate-400 transition hover:border-slate-500 hover:text-slate-300"
          >
            <X size={12} /> Cancelar
          </button>
          <button
            onClick={handleGenerar}
            className="flex items-center gap-1.5 rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-xs font-medium text-violet-400 transition hover:bg-violet-500/20"
          >
            <RefreshCw size={12} /> Regenerar
          </button>
          <button
            onClick={handleCrear}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-600 active:scale-[0.98]"
          >
            <UserPlus size={13} /> Crear cuenta
          </button>
        </div>
      </div>
    );
  }

  // ── Paso: creando ────────────────────────────────────────────────
  if (step === 'creating') {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-8">
        <Loader2 size={24} className="animate-spin text-emerald-400" />
        <p className="text-sm text-slate-400">Creando cuenta…</p>
      </div>
    );
  }

  // ── Paso: listo ──────────────────────────────────────────────────
  if (step === 'done' && creds) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center gap-2 py-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/30">
            <Check size={22} className="text-emerald-400" />
          </div>
          <p className="text-sm font-semibold text-slate-200">Cuenta creada exitosamente</p>
          <p className="text-xs text-slate-500">Comparte estas credenciales con el usuario</p>
        </div>

        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 divide-y divide-slate-700/50">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Email</p>
              <p className="text-sm font-mono text-emerald-400 truncate">{creds.email}</p>
            </div>
            <CopyButton text={creds.email} />
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Contraseña</p>
              <p className="text-sm font-mono text-sky-400">{creds.password}</p>
            </div>
            <CopyButton text={creds.password} />
          </div>
        </div>

        <button
          onClick={reset}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-slate-100"
        >
          <UserPlus size={14} /> Agregar otro usuario
        </button>
      </div>
    );
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL
// ═══════════════════════════════════════════════════════════════════

export default function UsuariosPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'AdminInstitucion';

  const [users, setUsers] = useState<UsuarioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [panelOpen, setPanelOpen] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    // Admins usan el nuevo endpoint filtrado por tenant
    const endpoint = isAdmin ? '/api/Usuarios' : '/api/Auth/users';
    const { data, error: err } = await api.get<UsuarioItem[]>(endpoint);
    if (err || !data) {
      setError(err ?? 'Error al cargar usuarios');
    } else {
      setUsers(data);
    }
    setLoading(false);
  }, [isAdmin]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const filtered = users.filter(
    (u) =>
      u.nombre.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  const count = (role: string) => users.filter((u) => u.role === role).length;

  return (
    <div className="flex gap-0 h-full">

      {/* ── Lista principal ─────────────────────────────────────── */}
      <div className="flex-1 min-w-0 space-y-6 p-6 overflow-auto">

        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-slate-100">Usuarios</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              {isAdmin ? 'Usuarios de tu institución' : 'Usuarios del sistema'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchUsers}
              className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-300 transition hover:border-slate-600 hover:text-slate-100"
            >
              <RefreshCw size={14} />
              Actualizar
            </button>
            {isAdmin && (
              <button
                onClick={() => setPanelOpen((p) => !p)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  panelOpen
                    ? 'bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/30'
                    : 'bg-violet-500 text-white hover:bg-violet-600'
                }`}
              >
                <UserPlus size={14} />
                {panelOpen ? 'Cerrar panel' : 'Agregar usuario'}
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Total', value: users.length, icon: Users, color: 'bg-slate-700/50 text-slate-400' },
            { label: 'Estudiantes', value: count('Estudiante'), icon: GraduationCap, color: 'bg-emerald-500/10 text-emerald-400' },
            { label: 'Conductores', value: count('Chofer'), icon: Bus, color: 'bg-blue-500/10 text-blue-400' },
            { label: 'Admins', value: count('AdminInstitucion'), icon: ShieldCheck, color: 'bg-violet-500/10 text-violet-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-xl border border-slate-700/60 bg-slate-800/50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">{label}</p>
                <div className={`rounded-lg p-2 ${color}`}><Icon size={16} /></div>
              </div>
              <p className="mt-3 text-3xl font-bold text-slate-100">{value}</p>
            </div>
          ))}
        </div>

        {/* Búsqueda */}
        <input
          type="text"
          placeholder="Buscar por nombre, email o rol…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30"
        />

        {/* Tabla */}
        <div className="overflow-hidden rounded-xl border border-slate-700/60">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
            </div>
          ) : error ? (
            <div className="flex h-48 flex-col items-center justify-center gap-2 text-slate-500">
              <p>{error}</p>
              <button onClick={fetchUsers} className="text-sm text-emerald-500 hover:underline">Reintentar</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center gap-2 text-slate-500">
              <Users size={28} className="opacity-40" />
              <p className="text-sm">
                {users.length === 0 ? 'Aún no hay usuarios — ¡agrega el primero!' : 'No se encontraron usuarios'}
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-slate-700/60 bg-slate-800/80">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-400">Usuario</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-400 hidden sm:table-cell">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-400">Rol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40 bg-slate-800/30">
                {filtered.map((u) => {
                  const initials = u.nombre.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');
                  const meta = ROLE_META[u.role];
                  return (
                    <tr key={u.email} className="transition hover:bg-slate-700/20">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                            style={{ background: `${meta?.color.replace('text-', '') ?? '#10b981'}20`, color: 'inherit' }}
                          >
                            <span className={meta?.color ?? 'text-emerald-400'}>{initials || '?'}</span>
                          </div>
                          <div>
                            <p className="font-medium text-slate-200">{u.nombre}</p>
                            <p className="text-xs text-slate-500 sm:hidden">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-400 hidden sm:table-cell">{u.email}</td>
                      <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Panel lateral de creación ─────────────────────────── */}
      {isAdmin && (
        <div
          className="shrink-0 overflow-hidden border-l border-slate-700/60 transition-all duration-300"
          style={{ width: panelOpen ? 360 : 0 }}
        >
          <div className="w-[360px] h-full overflow-y-auto p-5 space-y-5" style={{ background: 'var(--bg-surface, #1e293b)' }}>
            <div>
              <h2 className="text-[15px] font-semibold text-slate-100 flex items-center gap-2">
                <Sparkles size={16} className="text-violet-400" />
                Agregar usuario con IA
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Ingresá el nombre y rol — la IA genera el email y contraseña automáticamente.
              </p>
            </div>
            <div className="h-px bg-slate-700/60" />
            <CrearUsuarioPanel
              onCreado={() => {
                fetchUsers();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
