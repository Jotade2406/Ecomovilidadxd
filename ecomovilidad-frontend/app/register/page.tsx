'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useNotificacion } from '@/hooks/useNotificacion';
import { UserPlus, Loader2, GraduationCap, Bus, User, Building2, Shield, ChevronDown, Leaf } from 'lucide-react';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5034';

const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const ROLES = [
  {
    value: 'Estudiante',
    label: 'Estudiante',
    desc: 'Seguimiento de ruta, QR de asistencia y pagos',
    icon: GraduationCap,
  },
  {
    value: 'Chofer',
    label: 'Conductor',
    desc: 'Gestión de ruta activa y registro de asistencia',
    icon: Bus,
  },
  {
    value: 'Cliente',
    label: 'Cliente / Apoderado',
    desc: 'Seguimiento del estudiante y cambios de bus',
    icon: User,
  },
  {
    value: 'AdminInstitucion',
    label: 'Admin. Institución',
    desc: 'El administrador central te asignará una institución',
    icon: Shield,
  },
] as const;

interface TenantItem {
  id: string;
  nombre: string;
  codigo: string;
}

export default function RegisterPage() {
  const { register, isAuthenticated, isLoading: authLoading } = useAuth();
  const { notificarError } = useNotificacion();
  const router = useRouter();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rol, setRol] = useState<string>('Estudiante');
  const [loading, setLoading] = useState(false);

  // Tenant state
  const [tenants, setTenants] = useState<TenantItem[]>([]);
  const [tenantsLoading, setTenantsLoading] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [nombreInstitucion, setNombreInstitucion] = useState('');

  const isAdmin = rol === 'AdminInstitucion';

  // Validación tocada
  const [nombreTouched, setNombreTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);

  const nombreError = useMemo(() => {
    if (!nombreTouched || nombre.trim() === '') return undefined;
    return nombre.trim().length >= 2 ? undefined : 'Mínimo 2 caracteres';
  }, [nombre, nombreTouched]);

  const emailError = useMemo(() => {
    if (!emailTouched || email.trim() === '') return undefined;
    return isValidEmail(email) ? undefined : 'Email no válido';
  }, [email, emailTouched]);

  const passwordError = useMemo(() => {
    if (!passwordTouched || password === '') return undefined;
    return password.length >= 6 ? undefined : 'Mínimo 6 caracteres';
  }, [password, passwordTouched]);

  const confirmError = useMemo(() => {
    if (!confirmTouched || confirmPassword === '') return undefined;
    return confirmPassword === password ? undefined : 'Las contraseñas no coinciden';
  }, [confirmPassword, confirmTouched, password]);

  const tenantValid = isAdmin
    ? true  // AdminInstitucion no necesita código — el SuperAdmin lo asigna después
    : selectedTenantId !== '';

  const formValid = useMemo(
    () =>
      nombre.trim().length >= 2 &&
      isValidEmail(email) &&
      password.length >= 6 &&
      confirmPassword === password &&
      tenantValid,
    [nombre, email, password, confirmPassword, tenantValid]
  );

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, authLoading, router]);

  // Cargar instituciones disponibles
  useEffect(() => {
    setTenantsLoading(true);
    fetch(`${BASE_URL}/api/Tenants`)
      .then((r) => r.json())
      .then((data: TenantItem[]) => {
        setTenants(data);
        if (data.length > 0 && !isAdmin) setSelectedTenantId(data[0].id);
      })
      .catch(() => setTenants([]))
      .finally(() => setTenantsLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Al cambiar rol: resetear selección de tenant
  useEffect(() => {
    if (isAdmin) {
      setSelectedTenantId('');
    } else if (tenants.length > 0) {
      setSelectedTenantId(tenants[0].id);
    }
  }, [rol]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNombreTouched(true);
    setEmailTouched(true);
    setPasswordTouched(true);
    setConfirmTouched(true);
    if (!formValid) return;

    setLoading(true);
    // AdminInstitucion se registra sin institución — el SuperAdmin la asigna después
    const options = isAdmin
      ? {}
      : { tenantId: selectedTenantId };

    const err = await register(email.trim(), password, nombre.trim(), rol, options);
    if (err) {
      notificarError(err);
      setLoading(false);
    } else {
      router.replace('/');
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: '#070C18' }}>
        <Loader2 size={18} className="animate-spin text-emerald-500" />
      </div>
    );
  }

  if (isAuthenticated) return null;

  const inputCls = (err?: string) =>
    `w-full rounded-lg border px-4 py-2.5 text-sm text-slate-200 placeholder-slate-700 outline-none transition-all bg-slate-900/80 ${
      err
        ? 'border-red-500/40 focus:border-red-500/60 focus:ring-1 focus:ring-red-500/20'
        : 'border-slate-800 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/15'
    }`;

  return (
    <div className="flex min-h-screen items-start justify-center px-4 py-10" style={{ background: '#070C18' }}>

      {/* Grid background */}
      <div className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative w-full max-w-[460px] space-y-6 py-4">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 shadow-lg shadow-emerald-500/30">
            <Leaf size={17} className="text-white" />
          </div>
          <div>
            <p className="text-[17px] font-bold text-white tracking-tight">EcoMovilidad</p>
            <p className="text-[11px] text-slate-500">Crear cuenta nueva</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 space-y-5">

          {/* Tipo de cuenta */}
          <div>
            <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
              Tipo de cuenta
            </p>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map(({ value, label, icon: Icon }) => {
                const active = rol === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRol(value)}
                    className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all ${
                      active
                        ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                        : 'border-white/[0.06] bg-transparent text-slate-400 hover:border-white/[0.10] hover:text-slate-300'
                    }`}
                  >
                    <Icon size={15} />
                    <span className="text-xs font-medium">{label}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[11px] text-slate-600">
              {ROLES.find((r) => r.value === rol)?.desc}
            </p>
          </div>

          {/* Institución */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 space-y-3">
            <div className="flex items-center gap-1.5">
              <Building2 size={12} className="text-slate-500" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                Institución
              </span>
            </div>

            {isAdmin ? (
              <div className="flex items-start gap-2 rounded-lg bg-slate-800/60 px-3 py-2.5 ring-1 ring-violet-500/20">
                <Shield size={13} className="text-violet-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] font-medium text-violet-400">Cuenta de administrador</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    El administrador central te asignará a tu institución desde el panel de control.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="block text-[11px] text-slate-500">Seleccioná tu institución</label>
                {tenantsLoading ? (
                  <div className="flex items-center gap-2 py-2 text-[12px] text-slate-600">
                    <Loader2 size={11} className="animate-spin" /> Cargando...
                  </div>
                ) : tenants.length === 0 ? (
                  <p className="text-[11px] text-amber-400/80">No hay instituciones disponibles aún.</p>
                ) : (
                  <div className="relative">
                    <select
                      value={selectedTenantId}
                      onChange={(e) => setSelectedTenantId(e.target.value)}
                      className="w-full appearance-none rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2.5 pr-8 text-sm text-slate-200 outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/15 transition-all"
                    >
                      {tenants.map((t) => (
                        <option key={t.id} value={t.id}>{t.nombre}</option>
                      ))}
                    </select>
                    <ChevronDown size={12} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Campos del formulario */}
          {[
            { id: 'nombre',   type: 'text',     label: 'Nombre completo',     placeholder: 'Juan Pérez',        value: nombre,           setValue: setNombre,           touched: setNombreTouched,   error: nombreError,   auto: 'name'           },
            { id: 'email',    type: 'email',    label: 'Email',               placeholder: 'tu@ejemplo.com',    value: email,            setValue: setEmail,            touched: setEmailTouched,    error: emailError,    auto: 'email'          },
            { id: 'password', type: 'password', label: 'Contraseña',          placeholder: '••••••••',          value: password,         setValue: setPassword,         touched: setPasswordTouched, error: passwordError, auto: 'new-password'   },
            { id: 'confirm',  type: 'password', label: 'Confirmar contraseña', placeholder: '••••••••',          value: confirmPassword,  setValue: setConfirmPassword,  touched: setConfirmTouched,  error: confirmError,  auto: 'new-password'   },
          ].map(({ id, type, label, placeholder, value, setValue, touched, error, auto }) => (
            <div key={id} className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                {label}
              </label>
              <input
                type={type}
                value={value}
                onChange={e => setValue(e.target.value)}
                onBlur={() => touched(true)}
                placeholder={placeholder}
                autoComplete={auto}
                className={inputCls(error)}
              />
              {error && <p className="text-[11px] text-red-400">{error}</p>}
            </div>
          ))}

          {/* Botón */}
          <button
            type="button"
            onClick={handleSubmit as unknown as React.MouseEventHandler}
            disabled={!formValid || loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading
              ? <><Loader2 size={14} className="animate-spin" /> Creando cuenta...</>
              : <><UserPlus size={14} /> Crear cuenta</>
            }
          </button>
        </div>

        <p className="text-center text-sm text-slate-600">
          ¿Ya tenés cuenta?{' '}
          <Link href="/login" className="font-medium text-emerald-500 transition-colors hover:text-emerald-400">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
