'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { getDefaultRouteForRole } from '@/lib/navigation';
import {
  Loader2, Route, Radio, GraduationCap, Bus,
  TrendingUp, ArrowRight, Leaf, Users, Map,
  CheckCircle2, Circle, AlertCircle,
} from 'lucide-react';

const ADMIN_ROLES = ['Admin', 'AdminInstitucion'];

interface Stats {
  rutasActivas: number;
  rutasTotal: number;
  viajesEnCurso: number;
  viajesHoy: number;
  viajesCompletadosTotal: number;
  totalEstudiantes: number;
  totalConductores: number;
  totalVehiculos: number;
  co2AhorradoKg: number;
  co2AhorradoTon: number;
}

// ─── Stat card ───────────────────────────────────────────────────────

function StatCard({
  label, value, sub, icon: Icon, accent, trend,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; accent: string; trend?: string;
}) {
  return (
    <div className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 transition-all hover:border-white/[0.10] hover:bg-white/[0.05]">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-widest text-slate-500">{label}</p>
          <p className="mt-3 text-[2.2rem] font-bold leading-none text-white">{value}</p>
          {sub && <p className="mt-2 text-xs text-slate-500">{sub}</p>}
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <TrendingUp size={10} className="text-emerald-400" />
              <span className="text-[10px] font-medium text-emerald-400">{trend}</span>
            </div>
          )}
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accent}`}>
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

// ─── Quick action ─────────────────────────────────────────────────────

function QuickAction({
  href, label, desc, icon: Icon, color,
}: {
  href: string; label: string; desc: string;
  icon: React.ElementType; color: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.03] px-5 py-4 transition-all hover:border-white/[0.10] hover:bg-white/[0.05]"
    >
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${color}`}>
        <Icon size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-200">{label}</p>
        <p className="mt-0.5 text-xs text-slate-500">{desc}</p>
      </div>
      <ArrowRight size={14} className="shrink-0 text-slate-700 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500" />
    </Link>
  );
}

// ─── Servicio status pill ─────────────────────────────────────────────

function ServicePill({ name, active }: { name: string; active: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium border
      ${active
        ? 'border-emerald-500/20 bg-emerald-500/8 text-emerald-400'
        : 'border-slate-700/60 bg-slate-800/50 text-slate-500'
      }`}>
      {active
        ? <CheckCircle2 size={10} />
        : <Circle size={10} />
      }
      {name}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = ADMIN_ROLES.includes(user?.role ?? '');

  const nombreUsuario = user?.email?.split('@')[0]
    ?.replace(/[._]/g, ' ')
    ?.replace(/\b\w/g, c => c.toUpperCase())
    ?? 'Admin';

  const tenantNombre = (user?.tenant_nombre as string | undefined) ?? 'Institución';

  const fecha = new Date().toLocaleDateString('es-BO', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  useEffect(() => {
    if (!authLoading && user && !isAdmin) {
      router.replace(getDefaultRouteForRole(user.role ?? ''));
    }
  }, [authLoading, user, isAdmin, router]);

  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      api.get<Stats>('/api/Stats').then(({ data }) => {
        if (data) setStats(data);
        setLoading(false);
      });
    }
  }, [authLoading, user, isAdmin]);

  if (authLoading || (!isAdmin && !stats)) {
    return (
      <div className="flex h-full items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <Loader2 size={18} className="animate-spin text-emerald-500" />
      </div>
    );
  }
  if (!isAdmin) return null;

  return (
    <div className="min-h-full p-6 lg:p-8 space-y-7" style={{ background: 'var(--bg-base)' }}>

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-slate-500 capitalize">{fecha}</p>
          <h1 className="mt-1.5 text-2xl font-bold text-white">
            Hola, {nombreUsuario}
          </h1>
          <div className="mt-1 flex items-center gap-2">
            <div className="flex h-4 w-4 items-center justify-center rounded bg-emerald-500/15">
              <Leaf size={9} className="text-emerald-400" />
            </div>
            <span className="text-sm text-slate-500">{tenantNombre}</span>
          </div>
        </div>

        {/* Status de servicios */}
        <div className="hidden sm:flex items-center gap-2 flex-wrap justify-end">
          <ServicePill name="Backend" active={true} />
          <ServicePill name="ai-service" active={true} />
          <ServicePill name="iam-service" active={true} />
        </div>
      </div>

      {/* ── Stats ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-[116px] animate-pulse rounded-2xl border border-white/[0.04] bg-white/[0.02]" />
          ))
        ) : (
          <>
            <StatCard
              label="Rutas activas"
              value={stats?.rutasActivas ?? 0}
              sub={`de ${stats?.rutasTotal ?? 0} configuradas`}
              icon={Route}
              accent="bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20"
            />
            <StatCard
              label="Viajes hoy"
              value={stats?.viajesHoy ?? 0}
              sub={stats?.viajesEnCurso ? `${stats.viajesEnCurso} en curso` : 'Sin viajes activos'}
              icon={Radio}
              accent="bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20"
              trend={stats?.viajesEnCurso ? 'En progreso' : undefined}
            />
            <StatCard
              label="Estudiantes"
              value={stats?.totalEstudiantes ?? 0}
              sub="registrados en el sistema"
              icon={GraduationCap}
              accent="bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20"
            />
            <StatCard
              label="Flota"
              value={stats?.totalVehiculos ?? 0}
              sub={`${stats?.totalConductores ?? 0} conductores asignados`}
              icon={Bus}
              accent="bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20"
            />
          </>
        )}
      </div>

      {/* ── Impacto ambiental ─────────────────────────────────────── */}
      {!loading && stats && (
        <div className="flex items-center gap-5 rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.04] px-6 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 ring-1 ring-emerald-500/20">
            <Leaf size={17} className="text-emerald-400" />
          </div>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-1">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-500/60">CO₂ ahorrado</p>
              <p className="text-xl font-bold text-emerald-400">{stats.co2AhorradoTon.toFixed(2)} <span className="text-sm font-medium text-emerald-500/60">ton</span></p>
            </div>
            <div className="h-8 w-px bg-emerald-500/10" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Viajes completados</p>
              <p className="text-xl font-bold text-slate-300">{stats.viajesCompletadosTotal}</p>
            </div>
            <div className="h-8 w-px bg-emerald-500/10" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Equivalente en árboles</p>
              <p className="text-xl font-bold text-slate-300">≈ {Math.round(stats.viajesCompletadosTotal * 3.5)}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Acceso rápido ─────────────────────────────────────────── */}
      <div>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-slate-600">
          Acceso rápido
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <QuickAction
            href="/dashboard/rutas"
            label="Gestionar rutas"
            desc="Crear, editar y visualizar rutas activas"
            icon={Map}
            color="bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20"
          />
          <QuickAction
            href="/dashboard/asignaciones"
            label="Asignaciones"
            desc="Asignar conductores y vehículos a rutas"
            icon={Route}
            color="bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20"
          />
          <QuickAction
            href="/dashboard/en-vivo"
            label="Seguimiento en vivo"
            desc="Ver posición GPS de buses en tiempo real"
            icon={Radio}
            color="bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20"
          />
          <QuickAction
            href="/dashboard/usuarios"
            label="Usuarios de la institución"
            desc="Agregar y gestionar usuarios con IA"
            icon={Users}
            color="bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20"
          />
        </div>
      </div>

    </div>
  );
}
