'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import {
  LogOut,
  Route,
  Link2,
  Radio,
  Menu,
  X,
  Loader2,
  Moon,
  Sun,
  ChevronsLeft,
  ChevronsRight,
  Leaf,
  ChevronRight,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────

export type DashboardTab = 'rutas' | 'asignaciones' | 'envivo';

interface DashboardLayoutProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  children: ReactNode;
}

const TABS: { key: DashboardTab; label: string; icon: typeof Route }[] = [
  { key: 'rutas', label: 'Rutas', icon: Route },
  { key: 'asignaciones', label: 'Asignaciones', icon: Link2 },
  { key: 'envivo', label: 'En Vivo', icon: Radio },
];

const SIDEBAR_KEY = 'sidebar-collapsed';

// ═══════════════════════════════════════════════════════════════════
// DASHBOARD LAYOUT — Nivel SaaS (Linear / Vercel / Notion)
// Sidebar colapsable 220px ↔ 56px + Header 52px glassmorphism
// ═══════════════════════════════════════════════════════════════════

export default function DashboardLayout({
  activeTab,
  onTabChange,
  children,
}: DashboardLayoutProps) {
  const { isAuthenticated, isLoading: authLoading, logout, user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Persist sidebar state
  useEffect(() => {
    const v = localStorage.getItem(SIDEBAR_KEY);
    if (v === 'true') setCollapsed(true);
  }, []);

  const toggle = () => {
    setCollapsed((p) => {
      const n = !p;
      localStorage.setItem(SIDEBAR_KEY, String(n));
      return n;
    });
  };

  // Auth guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace('/login');
  }, [authLoading, isAuthenticated, router]);

  if (authLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={24} className="animate-spin text-emerald-500" />
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const email = user?.email ?? 'Usuario';
  const role = user?.role ?? '';
  const initial = email.charAt(0).toUpperCase();
  const currentLabel = TABS.find((t) => t.key === activeTab)?.label ?? '';

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      {/* ═══════════ MOBILE BACKDROP ═══════════ */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 glass-subtle lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ═══════════ SIDEBAR ═══════════ */}
      <aside
        style={{
          width: collapsed ? 56 : 220,
          transition: 'width 250ms cubic-bezier(0.4, 0, 0.2, 1)',
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border)',
        }}
        className={`
          fixed lg:relative z-50 lg:z-auto
          flex shrink-0 flex-col h-full overflow-hidden
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          transition-transform duration-250 lg:transition-none
        `}
      >
        {/* Toggle button — right edge, centered */}
        <button
          onClick={toggle}
          className="panel-toggle hidden lg:flex h-7 w-7 items-center justify-center rounded-full shadow-md transition-all duration-200 hover:scale-110"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
          }}
          title={collapsed ? 'Expandir' : 'Colapsar'}
        >
          {collapsed ? <ChevronsRight size={12} /> : <ChevronsLeft size={12} />}
        </button>

        {/* ── Logo ──────────────────────────────────────────────── */}
        <div className={`flex items-center gap-2.5 px-3 pt-4 pb-3 ${collapsed ? 'justify-center' : ''}`}>
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
            style={{ background: 'var(--primary-glow)' }}
          >
            <Leaf size={16} className="text-emerald-500" />
          </div>
          {!collapsed && (
            <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
              EcoMovilidad
            </span>
          )}
          {/* Mobile close */}
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto p-1 rounded-md lg:hidden transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Gradient accent */}
        <div className="mx-3 h-px" style={{ background: 'linear-gradient(to right, var(--primary-glow), transparent)' }} />

        {/* ── Nav ────────────────────────────────────────────────── */}
        <nav className="flex-1 px-2 py-3">
          <ul className="space-y-0.5">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <li key={tab.key} className="group relative">
                  <button
                    onClick={() => { onTabChange(tab.key); setMobileOpen(false); }}
                    className={`
                      flex w-full items-center gap-2.5 rounded-lg
                      h-[44px] text-[13px] font-medium
                      transition-all duration-150 relative
                      ${collapsed ? 'justify-center px-0' : 'px-3'}
                    `}
                    style={{
                      background: isActive ? 'var(--primary-glow)' : 'transparent',
                      color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'var(--bg-hover)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    {/* Active indicator — left bar */}
                    {isActive && (
                      <span className="absolute left-0 top-[10px] bottom-[10px] w-[2px] rounded-full bg-emerald-500" />
                    )}
                    <Icon size={18} strokeWidth={1.5} className="shrink-0" />
                    {!collapsed && <span>{tab.label}</span>}
                  </button>
                  {/* Tooltip (collapsed only) */}
                  {collapsed && (
                    <div
                      className="absolute left-full top-1/2 -translate-y-1/2 ml-2 rounded-md px-2 py-1 text-[11px] font-medium whitespace-nowrap shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[60] hidden lg:block"
                      style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                    >
                      {tab.label}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ── Footer (user) ─────────────────────────────────────── */}
        <div className="px-2 pb-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <div className={`flex items-center gap-2 py-3 ${collapsed ? 'justify-center' : 'px-1'}`}>
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
              style={{ background: 'var(--primary)' }}
            >
              {initial}
            </div>
            {!collapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-medium" style={{ color: 'var(--text-primary)' }}>{email}</p>
                  {role && (
                    <p className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{role}</p>
                  )}
                </div>
                <button
                  onClick={logout}
                  title="Cerrar sesión"
                  className="rounded-md p-1 transition-colors hover:text-red-400"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <LogOut size={14} />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* ═══════════ MAIN AREA ═══════════ */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* ── Header (52px, glassmorphism) ───────────────────────── */}
        <header
          className="sticky top-0 z-30 flex h-[52px] shrink-0 items-center justify-between px-4 glass"
          style={{
            background: isDark ? 'rgba(17,24,39,0.8)' : 'rgba(255,255,255,0.8)',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          {/* Left */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-1.5 rounded-md lg:hidden transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              <Menu size={18} />
            </button>
            {/* Breadcrumb */}
            <div className="hidden lg:flex items-center gap-1 text-[12px]" style={{ color: 'var(--text-muted)' }}>
              <span>EcoMovilidad</span>
              <ChevronRight size={12} />
              <span style={{ color: 'var(--text-secondary)' }} className="font-medium">{currentLabel}</span>
            </div>
            {/* Mobile title */}
            <span className="lg:hidden text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {currentLabel}
            </span>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            {/* Theme toggle pill */}
            <button
              onClick={toggleTheme}
              className="flex h-8 items-center gap-1.5 rounded-full px-3 transition-all duration-200 active:scale-95"
              style={{
                background: isDark ? 'var(--bg-elevated)' : 'var(--bg-hover)',
                color: isDark ? '#FBBF24' : 'var(--text-secondary)',
              }}
              title={isDark ? 'Modo claro' : 'Modo oscuro'}
            >
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
              <span className="text-[11px] font-medium hidden sm:inline">
                {isDark ? 'Claro' : 'Oscuro'}
              </span>
            </button>

            {/* Separator */}
            <div className="hidden sm:block h-5 w-px" style={{ background: 'var(--border)' }} />

            {/* User info */}
            <div className="hidden sm:flex items-center gap-2">
              <div
                className="h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
                style={{ background: 'var(--primary)' }}
              >
                {initial}
              </div>
              <div className="text-right">
                <p className="text-[11px] font-medium" style={{ color: 'var(--text-primary)' }}>{email}</p>
                {role && <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{role}</p>}
              </div>
            </div>

            <button
              onClick={logout}
              className="p-1.5 rounded-md transition-colors sm:hidden"
              style={{ color: 'var(--text-muted)' }}
              title="Cerrar sesión"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* ── Main Content ───────────────────────────────────────── */}
        <main
          className="flex-1 overflow-auto"
          style={{ height: 'calc(100vh - 52px)', background: 'var(--bg-base)' }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
