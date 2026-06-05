'use client';

import { useState, useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { getNavItemsForRole, groupNavItems, type NavItem } from '@/lib/navigation';
import {
  LogOut, Menu, X, Loader2, Moon, Sun,
  PanelLeftClose, PanelLeftOpen, Leaf, ChevronRight, Building2,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────

const ADMIN_ROLES = ['Admin', 'AdminInstitucion'];

const ROLE_LABEL: Record<string, string> = {
  Admin: 'Administrador',
  AdminInstitucion: 'Admin. Institución',
  Chofer: 'Conductor',
  Estudiante: 'Estudiante',
  Cliente: 'Cliente',
};

const ROLE_COLOR: Record<string, string> = {
  Admin: '#8B5CF6',
  AdminInstitucion: '#10B981',
  Chofer: '#3B82F6',
  Estudiante: '#F59E0B',
  Cliente: '#EC4899',
};

// ─── NavList ──────────────────────────────────────────────────────────

function NavList({
  sections,
  pathname,
  collapsed = false,
}: {
  sections: Record<string, NavItem[]>;
  pathname: string;
  collapsed?: boolean;
}) {
  return (
    <>
      {Object.entries(sections).map(([section, items]) => (
        <div key={section} className="mb-4">
          {!collapsed && (
            <p
              className="px-3 mb-1 text-[9px] font-bold uppercase tracking-widest"
              style={{ color: 'var(--text-muted)' }}
            >
              {section}
            </p>
          )}
          <ul className="space-y-0.5">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = item.exactMatch
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <li key={`${item.href}-${item.label}`} className="group relative">
                  <Link
                    href={item.href}
                    className={[
                      'flex w-full items-center gap-2.5 rounded-lg h-[42px] text-[13px] font-medium',
                      'transition-all duration-150 relative',
                      collapsed ? 'justify-center px-0' : 'px-3',
                    ].join(' ')}
                    style={{
                      background: isActive ? 'var(--primary-glow)' : 'transparent',
                      color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'var(--bg-hover)';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--text-muted)';
                      }
                    }}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-[8px] bottom-[8px] w-[2px] rounded-full bg-emerald-500" />
                    )}
                    <Icon size={17} strokeWidth={1.5} className="shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                  {/* Tooltip en modo colapsado */}
                  {collapsed && (
                    <div
                      className="absolute left-full top-1/2 -translate-y-1/2 ml-3 rounded-lg px-3 py-1.5 text-[12px] font-medium whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[200]"
                      style={{
                        background: 'var(--bg-elevated)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      {item.label}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════
// DASHBOARD LAYOUT
// ═══════════════════════════════════════════════════════════════════

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading: authLoading, logout, user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);
  // Sidebar siempre empieza expandido; se persiste en sessionStorage (no localStorage)
  // para que al recargar la página vuelva a estar expandido
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => setCollapsed((p) => !p);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace('/login');
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

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

  const role = user?.role ?? '';
  const email = user?.email ?? 'Usuario';
  const initial = email.charAt(0).toUpperCase();
  const roleLabel = ROLE_LABEL[role] ?? role;
  const roleColor = ROLE_COLOR[role] ?? 'var(--primary)';
  const isAdmin = ADMIN_ROLES.includes(role);

  const navItems = getNavItemsForRole(role);
  const sections = groupNavItems(navItems);

  const activeItem = navItems.find((i) =>
    i.exactMatch
      ? pathname === i.href
      : pathname === i.href || pathname.startsWith(i.href + '/')
  );
  const currentLabel = activeItem?.label ?? 'Dashboard';

  const tenantNombre = (user?.tenant_nombre as string | undefined) ?? '';

  // ─── Sidebar content (logo + nav + footer) ─────────────────────────

  const SidebarContent = ({ forceExpanded = false }: { forceExpanded?: boolean }) => {
    const show = forceExpanded || !collapsed;
    return (
      <>
        {/* Logo */}
        <div className={`flex items-center gap-2.5 px-3 pt-4 pb-2 ${!show ? 'justify-center' : ''}`}>
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
            style={{ background: 'var(--primary-glow)' }}
          >
            <Leaf size={16} className="text-emerald-500" />
          </div>
          {show && (
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold truncate leading-tight" style={{ color: 'var(--text-primary)' }}>
                EcoMovilidad
              </p>
              {tenantNombre && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Building2 size={9} style={{ color: 'var(--text-muted)' }} />
                  <span className="text-[9px] font-medium truncate" style={{ color: 'var(--text-muted)' }} title={tenantNombre}>
                    {tenantNombre}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Role badge */}
        {show && role && (
          <div className="px-3 mb-2">
            <span
              className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold"
              style={{ background: `${roleColor}20`, color: roleColor }}
            >
              {roleLabel}
            </span>
          </div>
        )}

        <div className="mx-3 h-px mb-2" style={{ background: 'linear-gradient(to right, var(--primary-glow), transparent)' }} />

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 pb-2">
          <NavList sections={sections} pathname={pathname} collapsed={!show} />
        </nav>

        {/* Footer */}
        <div className="px-2 pb-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <div className={`flex items-center gap-2 py-3 ${!show ? 'justify-center' : 'px-1'}`}>
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
              style={{ background: roleColor }}
            >
              {initial}
            </div>
            {show && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-medium" style={{ color: 'var(--text-primary)' }}>
                    {email}
                  </p>
                  <p className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    {roleLabel}
                  </p>
                </div>
                <button
                  onClick={logout}
                  title="Cerrar sesión"
                  className="rounded-md p-1.5 transition-colors hover:bg-red-500/10 hover:text-red-400"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <LogOut size={14} />
                </button>
              </>
            )}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: 'var(--bg-base)' }}>

      {/* ═══ ADMIN SIDEBAR ═══ */}
      {isAdmin && (
        <>
          {/* Mobile backdrop */}
          {mobileOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
          )}

          {/* Desktop sidebar wrapper — relative para que el toggle pueda salir */}
          <div
            className="relative hidden lg:flex shrink-0 flex-col h-full z-20"
            style={{
              width: collapsed ? 56 : 220,
              transition: 'width 250ms cubic-bezier(0.4, 0, 0.2, 1)',
              background: 'var(--bg-surface)',
              borderRight: '1px solid var(--border)',
            }}
          >
            <div className="flex flex-col h-full overflow-hidden">
              <SidebarContent />
            </div>

            {/* Toggle flotante — siempre visible en el borde derecho */}
            <button
              onClick={toggleSidebar}
              className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-full flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white shadow-lg transition-all duration-200 z-50"
              style={{ width: 22, height: 56, borderRadius: '0 10px 10px 0' }}
              title={collapsed ? 'Expandir menú (←)' : 'Colapsar menú (→)'}
            >
              {collapsed ? <PanelLeftOpen size={13} /> : <PanelLeftClose size={13} />}
            </button>
          </div>

          {/* Mobile sidebar (slide-in) */}
          <aside
            className={[
              'fixed z-50 flex flex-col h-full overflow-hidden lg:hidden',
              mobileOpen ? 'translate-x-0' : '-translate-x-full',
              'transition-transform duration-250',
            ].join(' ')}
            style={{ width: 224, background: 'var(--bg-surface)', borderRight: '1px solid var(--border)' }}
          >
            {/* Mobile close button en el logo */}
            <div className="flex items-center gap-2.5 px-3 pt-4 pb-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: 'var(--primary-glow)' }}>
                <Leaf size={16} className="text-emerald-500" />
              </div>
              <p className="text-[13px] font-bold flex-1 truncate" style={{ color: 'var(--text-primary)' }}>EcoMovilidad</p>
              <button onClick={() => setMobileOpen(false)} className="p-1 rounded-md" style={{ color: 'var(--text-muted)' }}>
                <X size={16} />
              </button>
            </div>
            {role && (
              <div className="px-3 mb-2">
                <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold" style={{ background: `${roleColor}20`, color: roleColor }}>
                  {roleLabel}
                </span>
              </div>
            )}
            <div className="mx-3 h-px mb-2" style={{ background: 'linear-gradient(to right, var(--primary-glow), transparent)' }} />
            <nav className="flex-1 overflow-y-auto px-2 pb-2">
              <NavList sections={sections} pathname={pathname} collapsed={false} />
            </nav>
            <div className="px-2 pb-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <div className="flex items-center gap-2 py-3 px-1">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: roleColor }}>{initial}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-medium" style={{ color: 'var(--text-primary)' }}>{email}</p>
                  <p className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{roleLabel}</p>
                </div>
                <button onClick={logout} className="rounded-md p-1.5 hover:bg-red-500/10 hover:text-red-400" style={{ color: 'var(--text-muted)' }}>
                  <LogOut size={14} />
                </button>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* ═══ MAIN AREA ═══ */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">

        {/* Header */}
        <header
          className="sticky top-0 z-30 flex h-[52px] shrink-0 items-center justify-between px-4 gap-2"
          style={{
            background: isDark ? 'rgba(17,24,39,0.9)' : 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          {/* Izquierda */}
          <div className="flex items-center gap-2 min-w-0">
            {/* Mobile hamburger (admin) */}
            {isAdmin && (
              <button
                onClick={() => setMobileOpen(true)}
                className="p-1.5 rounded-md lg:hidden shrink-0"
                style={{ color: 'var(--text-muted)' }}
              >
                <Menu size={18} />
              </button>
            )}
            {/* Logo para no-admin en mobile */}
            {!isAdmin && (
              <div className="flex items-center gap-2 lg:hidden">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ background: 'var(--primary-glow)' }}>
                  <Leaf size={14} className="text-emerald-500" />
                </div>
              </div>
            )}
            {/* Breadcrumb desktop */}
            <div className="hidden lg:flex items-center gap-1 text-[12px] min-w-0" style={{ color: 'var(--text-muted)' }}>
              <span className="shrink-0">EcoMovilidad</span>
              <ChevronRight size={12} className="shrink-0" />
              <span style={{ color: 'var(--text-secondary)' }} className="font-medium truncate">{currentLabel}</span>
            </div>
            <span className="lg:hidden text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
              {currentLabel}
            </span>
          </div>

          {/* Derecha */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={toggleTheme}
              className="flex h-8 items-center gap-1.5 rounded-full px-3 transition-all duration-200 active:scale-95"
              style={{ background: isDark ? 'var(--bg-elevated)' : 'var(--bg-hover)', color: isDark ? '#FBBF24' : 'var(--text-secondary)' }}
              title={isDark ? 'Modo claro' : 'Modo oscuro'}
            >
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
              <span className="text-[11px] font-medium hidden sm:inline">{isDark ? 'Claro' : 'Oscuro'}</span>
            </button>

            <div className="hidden sm:block h-5 w-px" style={{ background: 'var(--border)' }} />

            <div className="hidden sm:flex items-center gap-2">
              <div className="h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0" style={{ background: roleColor }}>
                {initial}
              </div>
              <div className="text-right hidden md:block">
                <p className="text-[11px] font-medium" style={{ color: 'var(--text-primary)' }}>{email}</p>
                <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{roleLabel}</p>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-1.5 rounded-md transition-colors sm:hidden hover:text-red-400"
              style={{ color: 'var(--text-muted)' }}
              title="Cerrar sesión"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* Tab bar para no-admins */}
        {!isAdmin && navItems.length > 0 && (
          <div
            className="flex items-end gap-0 px-2 overflow-x-auto shrink-0 scrollbar-none"
            style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exactMatch
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={`tab-${item.href}-${item.label}`}
                  href={item.href}
                  className="relative flex items-center gap-1.5 px-4 py-3 text-[12px] font-medium whitespace-nowrap transition-colors shrink-0"
                  style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)', textDecoration: 'none' }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-[2px] rounded-t-full bg-emerald-500" />
                  )}
                  <Icon size={14} strokeWidth={isActive ? 2 : 1.5} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}

        {/* Contenido */}
        <main className="flex-1 overflow-auto" style={{ background: 'var(--bg-base)' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
