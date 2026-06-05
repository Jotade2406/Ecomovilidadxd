import {
  Route,
  Link2,
  Radio,
  QrCode,
  CreditCard,
  ArrowLeftRight,
  User,
  Users,
  MapPin,
  LayoutDashboard,
  Bus,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Roles que pueden ver este ítem. Vacío = todos los roles. */
  roles: string[];
  section: string;
  /** Si true, solo se considera activo con coincidencia exacta de pathname */
  exactMatch?: boolean;
}

// ─── Roles conocidos ─────────────────────────────────────────────────

export const ROLES = {
  ADMIN: 'Admin',
  ADMIN_INSTITUCION: 'AdminInstitucion',
  CHOFER: 'Chofer',
  ESTUDIANTE: 'Estudiante',
  CLIENTE: 'Cliente',
} as const;

const ADMIN_ROLES = [ROLES.ADMIN, ROLES.ADMIN_INSTITUCION];
const CLIENT_ROLES = [ROLES.ESTUDIANTE, ROLES.CLIENTE];

// ─── Definición de ítems ─────────────────────────────────────────────

export const NAV_ITEMS: NavItem[] = [
  // ── Panel de Control (Admin) ──────────────────────────────────────
  {
    href: '/dashboard',
    label: 'Panel de Control',
    icon: LayoutDashboard,
    roles: ADMIN_ROLES,
    section: 'Panel',
    exactMatch: true,
  },

  // ── Gestión (solo Admin) ──────────────────────────────────────────
  {
    href: '/dashboard/rutas',
    label: 'Rutas',
    icon: Route,
    roles: ADMIN_ROLES,
    section: 'Gestión',
  },
  {
    href: '/dashboard/asignaciones',
    label: 'Asignaciones',
    icon: Link2,
    roles: ADMIN_ROLES,
    section: 'Gestión',
  },
  {
    href: '/dashboard/en-vivo',
    label: 'En Vivo',
    icon: Radio,
    roles: ADMIN_ROLES,
    section: 'Gestión',
  },
  {
    href: '/dashboard/flota',
    label: 'Flota',
    icon: Bus,
    roles: ADMIN_ROLES,
    section: 'Gestión',
  },
  {
    href: '/dashboard/usuarios',
    label: 'Usuarios',
    icon: Users,
    roles: ADMIN_ROLES,
    section: 'Gestión',
  },

  // ── Operaciones (Chofer) ─────────────────────────────────────────
  {
    href: '/dashboard/en-vivo',
    label: 'Mi Ruta Activa',
    icon: MapPin,
    roles: [ROLES.CHOFER],
    section: 'Operaciones',
  },
  {
    href: '/dashboard/qr',
    label: 'Marcar Asistencia',
    icon: QrCode,
    roles: [ROLES.CHOFER],
    section: 'Operaciones',
  },

  // ── Mi Servicio (Estudiante / Cliente) ──────────────────────────
  {
    href: '/dashboard/en-vivo',
    label: 'Mi Ruta',
    icon: MapPin,
    roles: CLIENT_ROLES,
    section: 'Mi Servicio',
  },
  {
    href: '/dashboard/qr',
    label: 'Mi QR',
    icon: QrCode,
    roles: CLIENT_ROLES,
    section: 'Mi Servicio',
  },
  {
    href: '/dashboard/pagos',
    label: 'Pagos',
    icon: CreditCard,
    roles: CLIENT_ROLES,
    section: 'Mi Servicio',
  },
  {
    href: '/dashboard/cambio-bus',
    label: 'Cambio de Bus',
    icon: ArrowLeftRight,
    roles: CLIENT_ROLES,
    section: 'Mi Servicio',
  },

  // ── Cuenta (todos) ───────────────────────────────────────────────
  {
    href: '/dashboard/perfil',
    label: 'Mi Perfil',
    icon: User,
    roles: [],
    section: 'Cuenta',
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────

export function getNavItemsForRole(role: string): NavItem[] {
  return NAV_ITEMS.filter(
    (item) => item.roles.length === 0 || item.roles.includes(role)
  );
}

export function getDefaultRouteForRole(role: string): string {
  if (ADMIN_ROLES.includes(role as never)) return '/dashboard';
  if (role === ROLES.CHOFER) return '/dashboard/en-vivo';
  return '/dashboard/en-vivo';
}

export function groupNavItems(items: NavItem[]): Record<string, NavItem[]> {
  return items.reduce<Record<string, NavItem[]>>((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {});
}
