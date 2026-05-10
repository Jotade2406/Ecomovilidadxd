'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useNotificacion } from '@/hooks/useNotificacion';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { LogIn, Loader2 } from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────

/** Validación simple de email */
const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// ═══════════════════════════════════════════════════════════════════
// LOGIN PAGE — /login
// Container centrado, logo, form con validación, redirección
// Accesibilidad: inputs 48px, botón 48px, font 16px mínimo
// ═══════════════════════════════════════════════════════════════════

export default function LoginPage() {
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const { notificarError } = useNotificacion();
  const router = useRouter();

  // ── State ──────────────────────────────────────────────────────────
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  // ── Validación en tiempo real ──────────────────────────────────────
  const emailError = useMemo(() => {
    if (!emailTouched || email.trim() === '') return undefined;
    return isValidEmail(email) ? undefined : 'Email no válido';
  }, [email, emailTouched]);

  const passwordError = useMemo(() => {
    if (!passwordTouched || password === '') return undefined;
    return password.length >= 6 ? undefined : 'Mínimo 6 caracteres';
  }, [password, passwordTouched]);

  const formValid = useMemo(
    () =>
      email.trim() !== '' &&
      password.trim() !== '' &&
      isValidEmail(email) &&
      password.length >= 6,
    [email, password]
  );

  // ── Redirigir si ya está autenticado ──────────────────────────────
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, authLoading, router]);

  // ── Submit ────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Activar validaciones si no estaban tocadas
    setEmailTouched(true);
    setPasswordTouched(true);

    if (!formValid) return;

    setLoading(true);
    const loginError = await login(email.trim(), password);

    if (loginError) {
      notificarError(loginError);
      setLoading(false);
    } else {
      router.replace('/');
    }
  };

  // ── Auth cargando (localStorage check) ────────────────────────────
  if (authLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0F172A]">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
      </div>
    );
  }

  // Si ya está autenticado, no mostrar (el useEffect redirige)
  if (isAuthenticated) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0F172A] px-4">
      {/* ── Background gradient sutil ────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.08),transparent_60%)]" />

      <div className="relative w-full max-w-[400px]">
        {/* ── Logo & Brand ─────────────────────────────────────── */}
        <div className="mb-8 flex flex-col items-center">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 ring-1 ring-emerald-500/25 shadow-lg shadow-emerald-500/10"
            aria-hidden="true"
          >
            <span className="text-3xl">🌱</span>
          </div>
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-100">
            Bienvenido a EcoMovilidad
          </h1>
          <p className="mt-2 text-base text-slate-500">
            Gestiona tu movilidad urbana
          </p>
        </div>

        {/* ── Card principal ───────────────────────────────────── */}
        <Card padding="lg" className="shadow-2xl shadow-black/30 ring-slate-700/50">
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
            noValidate
            aria-label="Formulario de inicio de sesión"
          >
            {/* Email */}
            <Input
              id="login-email"
              type="email"
              label="Email"
              placeholder="tu@ejemplo.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setEmailTouched(true)}
              error={emailError}
              aria-label="Correo electrónico"
              aria-invalid={!!emailError}
            />

            {/* Contraseña */}
            <Input
              id="login-password"
              type="password"
              label="Contraseña"
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setPasswordTouched(true)}
              error={passwordError}
              aria-label="Contraseña"
              aria-invalid={!!passwordError}
            />

            {/* Botón Ingresar (min 48px) */}
            <Button
              id="btn-login"
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              disabled={!formValid}
              icon={<LogIn size={18} />}
              className="w-full"
            >
              Ingresar
            </Button>

            {/* Olvidé mi contraseña */}
            <div className="text-center">
              <button
                type="button"
                className="text-sm text-slate-500 transition-colors hover:text-emerald-400"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </form>
        </Card>

        {/* ── Footer ──────────────────────────────────────────── */}
        <p className="mt-6 text-center text-sm text-slate-600">
          ¿No tienes cuenta?{' '}
          <button
            type="button"
            className="font-semibold text-emerald-500 transition-colors hover:text-emerald-400"
          >
            Regístrate
          </button>
        </p>

        <p className="mt-4 text-center text-[11px] text-slate-700">
          Entorno de desarrollo · Santa Cruz, Bolivia
        </p>
      </div>
    </div>
  );
}
