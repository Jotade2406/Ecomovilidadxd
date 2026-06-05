'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useNotificacion } from '@/hooks/useNotificacion';
import { LogIn, Loader2, Leaf, MapPin, Users, Radio, Bus } from 'lucide-react';

const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

export default function LoginPage() {
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const { notificarError } = useNotificacion();
  const router = useRouter();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [emailT, setEmailT]     = useState(false);
  const [passT, setPassT]       = useState(false);

  const emailError = useMemo(() => {
    if (!emailT || !email) return undefined;
    return isValidEmail(email) ? undefined : 'Email no válido';
  }, [email, emailT]);

  const passError = useMemo(() => {
    if (!passT || !password) return undefined;
    return password.length >= 6 ? undefined : 'Mínimo 6 caracteres';
  }, [password, passT]);

  const formValid = email && password && isValidEmail(email) && password.length >= 6;

  useEffect(() => {
    if (!authLoading && isAuthenticated) router.replace('/');
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailT(true); setPassT(true);
    if (!formValid) return;
    setLoading(true);
    const err = await login(email.trim(), password);
    if (err) { notificarError(err); setLoading(false); }
    else router.replace('/');
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: '#070C18' }}>
        <Loader2 size={20} className="animate-spin text-emerald-500" />
      </div>
    );
  }
  if (isAuthenticated) return null;

  return (
    <div className="flex min-h-screen" style={{ background: '#070C18' }}>

      {/* ── Panel izquierdo — branding ──────────────────────────── */}
      <div className="relative hidden lg:flex lg:w-[46%] flex-col justify-between p-14 overflow-hidden border-r border-white/[0.04]">

        {/* Grid de fondo */}
        <div className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
        {/* Glow */}
        <div className="pointer-events-none absolute left-0 top-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 translate-x-1/3 translate-y-1/3 rounded-full bg-emerald-500/6 blur-3xl" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 shadow-lg shadow-emerald-500/30">
            <Leaf size={17} className="text-white" />
          </div>
          <span className="text-[17px] font-bold tracking-tight text-white">EcoMovilidad</span>
        </div>

        {/* Copy central */}
        <div className="relative space-y-10">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="text-xs font-medium text-emerald-400">Plataforma activa — Santa Cruz</span>
            </div>
            <h2 className="text-[2.1rem] font-bold leading-tight text-white">
              Movilidad escolar<br />inteligente y ecológica
            </h2>
            <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-slate-400">
              Control total de rutas, flota y estudiantes para colegios y empresas de transporte.
            </p>
          </div>

          <div className="space-y-3.5">
            {[
              { icon: MapPin, label: 'Rutas optimizadas en tiempo real',  color: 'text-blue-400',    bg: 'bg-blue-500/10',    ring: 'ring-blue-500/20'    },
              { icon: Bus,    label: 'Gestión de flota y conductores',    color: 'text-amber-400',   bg: 'bg-amber-500/10',   ring: 'ring-amber-500/20'   },
              { icon: Users,  label: 'Multi-tenant por institución',      color: 'text-emerald-400', bg: 'bg-emerald-500/10', ring: 'ring-emerald-500/20' },
              { icon: Radio,  label: 'GPS y notificaciones en vivo',      color: 'text-violet-400',  bg: 'bg-violet-500/10',  ring: 'ring-violet-500/20'  },
            ].map(({ icon: Icon, label, color, bg, ring }) => (
              <div key={label} className="flex items-center gap-3">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${bg} ring-1 ${ring}`}>
                  <Icon size={14} className={color} />
                </div>
                <span className="text-sm text-slate-300">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-slate-700">Universidad Privada de Santa Cruz · 2026</p>
      </div>

      {/* ── Panel derecho — formulario ──────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">

        {/* Logo mobile */}
        <div className="mb-10 flex items-center gap-2.5 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500">
            <Leaf size={17} className="text-white" />
          </div>
          <span className="text-[17px] font-bold text-white tracking-tight">EcoMovilidad</span>
        </div>

        <div className="w-full max-w-[360px]">

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Iniciar sesión</h1>
            <p className="mt-1.5 text-sm text-slate-500">Ingresá tus credenciales para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onBlur={() => setEmailT(true)}
                placeholder="tu@ejemplo.com"
                autoComplete="email"
                className={`w-full rounded-lg border px-4 py-3 text-sm text-slate-200 placeholder-slate-700 outline-none transition-all
                  ${emailError
                    ? 'border-red-500/40 bg-red-500/5 focus:border-red-500/60 focus:ring-1 focus:ring-red-500/20'
                    : 'border-slate-800 bg-slate-900/80 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/15'
                  }`}
              />
              {emailError && <p className="text-[11px] text-red-400">{emailError}</p>}
            </div>

            {/* Contraseña */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onBlur={() => setPassT(true)}
                placeholder="••••••••"
                autoComplete="current-password"
                className={`w-full rounded-lg border px-4 py-3 text-sm text-slate-200 placeholder-slate-700 outline-none transition-all
                  ${passError
                    ? 'border-red-500/40 bg-red-500/5 focus:border-red-500/60 focus:ring-1 focus:ring-red-500/20'
                    : 'border-slate-800 bg-slate-900/80 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/15'
                  }`}
              />
              {passError && <p className="text-[11px] text-red-400">{passError}</p>}
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={!formValid || loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading
                ? <><Loader2 size={14} className="animate-spin" /> Ingresando...</>
                : <><LogIn size={14} /> Ingresar</>
              }
            </button>
          </form>

          <div className="mt-6 flex flex-col gap-3 text-center">
            <p className="text-sm text-slate-600">
              ¿No tenés cuenta?{' '}
              <Link href="/register" className="font-medium text-emerald-500 transition-colors hover:text-emerald-400">
                Registrarse
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
