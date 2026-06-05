'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import {
  User, Mail, Phone, Shield, Check, Pencil,
  LogOut, Building2, Bell, Moon, Loader2,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

// ─── Role display map ─────────────────────────────────────────────────

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

// ─── Avatar initials ─────────────────────────────────────────────────

function Avatar({ email, color, size = 64 }: { email: string; color: string; size?: number }) {
  const initial = email.charAt(0).toUpperCase();
  return (
    <div
      className="rounded-full flex items-center justify-center font-black text-white shrink-0"
      style={{ width: size, height: size, background: color, fontSize: size * 0.38 }}
    >
      {initial}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PROFILE VIEW
// ═══════════════════════════════════════════════════════════════════

export default function ProfileView() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const role = user?.role ?? '';
  const email = user?.email ?? '';
  const roleLabel = ROLE_LABEL[role] ?? role;
  const roleColor = ROLE_COLOR[role] ?? '#10B981';
  const tenantSuffix = user?.tenant_id
    ? `INST-${String(user.tenant_id).slice(-4).toUpperCase()}`
    : '—';

  const [editing, setEditing] = useState(false);
  const [nombre, setNombre] = useState(email.split('@')[0] ?? 'Usuario');
  const [telefono, setTelefono] = useState('');
  const [notificaciones, setNotificaciones] = useState(true);
  const [loadingPerfil, setLoadingPerfil] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Cargar perfil real desde el backend
  useEffect(() => {
    api.get<{ nombre: string; telefono: string; preferenciaNotificaciones: boolean }>(
      '/api/Perfil/me'
    ).then(({ data }) => {
      if (data) {
        setNombre(data.nombre || email.split('@')[0]);
        setTelefono(data.telefono || '');
        setNotificaciones(data.preferenciaNotificaciones ?? true);
      }
      setLoadingPerfil(false);
    });
  }, [email]);

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    const { error } = await api.put('/api/Perfil/me', {
      nombre, telefono, avatarUrl: null, preferenciaNotificaciones: notificaciones, tema: isDark ? 'dark' : 'light',
    });
    setSaving(false);
    if (error) { setSaveError(error); return; }
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const Field = ({
    icon: Icon,
    label,
    value,
    onChange,
    editable = false,
    type = 'text',
  }: {
    icon: typeof User;
    label: string;
    value: string;
    onChange?: (v: string) => void;
    editable?: boolean;
    type?: string;
  }) => (
    <div
      className="flex items-center gap-3 rounded-xl px-4 py-3"
      style={{ background: 'var(--bg-base)', border: '1px solid var(--border)' }}
    >
      <div className="rounded-lg p-1.5 shrink-0" style={{ background: 'var(--bg-hover)' }}>
        <Icon size={14} style={{ color: 'var(--text-muted)' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          {label}
        </p>
        {editing && editable && onChange ? (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="mt-0.5 w-full bg-transparent text-[14px] font-medium focus:outline-none border-b transition-colors"
            style={{
              color: 'var(--text-primary)',
              borderColor: 'var(--primary)',
            }}
          />
        ) : (
          <p className="text-[14px] font-medium truncate mt-0.5" style={{ color: 'var(--text-primary)' }}>
            {value}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-full overflow-auto" style={{ background: 'var(--bg-base)' }}>
      {/* Header */}
      <div
        className="px-6 py-4 flex items-center gap-3"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}
      >
        <div className="rounded-lg p-2" style={{ background: 'var(--primary-glow)' }}>
          <User size={18} className="text-emerald-500" />
        </div>
        <div>
          <h1 className="text-[15px] font-bold" style={{ color: 'var(--text-primary)' }}>
            Mi Perfil
          </h1>
          <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
            Información de tu cuenta
          </p>
        </div>
      </div>

      <div className="p-6 max-w-lg mx-auto space-y-6">

        {/* Avatar + identity */}
        <div
          className="rounded-2xl p-6 flex items-center gap-4"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        >
          <Avatar email={email} color={roleColor} size={72} />
          <div className="flex-1 min-w-0">
            <h2 className="text-[18px] font-bold truncate" style={{ color: 'var(--text-primary)' }}>
              {nombre}
            </h2>
            <p className="text-[13px] truncate" style={{ color: 'var(--text-muted)' }}>
              {email}
            </p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
                style={{ background: `${roleColor}20`, color: roleColor }}
              >
                <Shield size={9} className="mr-1" />
                {roleLabel}
              </span>
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium"
                style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}
              >
                <Building2 size={9} className="mr-1" />
                {tenantSuffix}
              </span>
            </div>
          </div>
        </div>

        {/* Editable fields */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: '1px solid var(--border)' }}
        >
          <div
            className="px-4 py-3 flex items-center justify-between"
            style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}
          >
            <p className="text-[12px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Datos personales
            </p>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium transition-all active:scale-95"
                style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
              >
                <Pencil size={12} />
                Editar
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(false)}
                  className="rounded-lg px-2.5 py-1.5 text-[12px] font-medium transition-all"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-white transition-all active:scale-95"
                  style={{ background: 'var(--primary)' }}
                >
                  {saving ? (
                    <div className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    <Check size={12} />
                  )}
                  Guardar
                </button>
              </div>
            )}
          </div>

          <div className="p-4 space-y-3">
            <Field icon={User} label="Nombre" value={nombre} onChange={setNombre} editable />
            <Field icon={Mail} label="Correo electrónico" value={email} />
            <Field icon={Phone} label="Teléfono" value={telefono} onChange={setTelefono} editable />
            <Field icon={Shield} label="Rol" value={roleLabel} />
          </div>
        </div>

        {/* Feedback */}
        {saved && (
          <div className="flex items-center gap-2 rounded-xl px-4 py-3" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
            <Check size={14} className="text-emerald-500" />
            <p className="text-[13px] font-medium text-emerald-500">Perfil actualizado correctamente</p>
          </div>
        )}
        {saveError && (
          <div className="flex items-center gap-2 rounded-xl px-4 py-3" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
            <p className="text-[13px] font-medium text-rose-400">{saveError}</p>
          </div>
        )}
        {loadingPerfil && (
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Loader2 size={14} className="animate-spin" /> Cargando perfil…
          </div>
        )}

        {/* Preferences */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: '1px solid var(--border)' }}
        >
          <div
            className="px-4 py-3"
            style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}
          >
            <p className="text-[12px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Preferencias
            </p>
          </div>
          <div className="p-4 space-y-3">
            {/* Theme toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="rounded-lg p-1.5" style={{ background: 'var(--bg-hover)' }}>
                  <Moon size={14} style={{ color: 'var(--text-muted)' }} />
                </div>
                <div>
                  <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                    Tema oscuro
                  </p>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    Cambiar apariencia de la app
                  </p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className="w-10 h-5 rounded-full relative transition-all"
                style={{ background: isDark ? 'var(--primary)' : 'var(--bg-hover)' }}
              >
                <div
                  className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                  style={{ left: isDark ? 22 : 2 }}
                />
              </button>
            </div>

            {/* Notifications toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="rounded-lg p-1.5" style={{ background: 'var(--bg-hover)' }}>
                  <Bell size={14} style={{ color: 'var(--text-muted)' }} />
                </div>
                <div>
                  <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                    Notificaciones push
                  </p>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    Alertas de ruta y llegadas
                  </p>
                </div>
              </div>
              <button
                onClick={() => setNotificaciones(!notificaciones)}
                className="w-10 h-5 rounded-full relative transition-all"
                style={{ background: notificaciones ? 'var(--primary)' : 'var(--bg-hover)' }}
              >
                <div
                  className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                  style={{ left: notificaciones ? 22 : 2 }}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Danger zone */}
        <div
          className="rounded-xl p-4"
          style={{ border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.04)' }}
        >
          <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: '#EF4444' }}>
            Sesión
          </p>
          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-semibold transition-all active:scale-95"
            style={{
              background: 'rgba(239,68,68,0.1)',
              color: '#EF4444',
              border: '1px solid rgba(239,68,68,0.2)',
            }}
          >
            <LogOut size={14} />
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
