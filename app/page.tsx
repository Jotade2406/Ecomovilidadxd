'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import DashboardLayout, { type DashboardTab } from '@/components/dashboard/DashboardLayout';

// ── Lazy-load tabs para code-splitting ──────────────────────────────
const RutasTab = dynamic(() => import('@/components/dashboard/RutasTab'), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center">
      <div className="relative h-10 w-10">
        <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20" />
        <div className="absolute inset-1 animate-spin rounded-full border-2 border-slate-700 border-t-emerald-500" />
      </div>
    </div>
  ),
});

const AsignacionesTab = dynamic(
  () => import('@/components/dashboard/AsignacionesTab'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 items-center justify-center">
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20" />
          <div className="absolute inset-1 animate-spin rounded-full border-2 border-slate-700 border-t-emerald-500" />
        </div>
      </div>
    ),
  }
);

const EnVivoTab = dynamic(
  () => import('@/components/dashboard/EnVivoTab'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 items-center justify-center">
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20" />
          <div className="absolute inset-1 animate-spin rounded-full border-2 border-slate-700 border-t-emerald-500" />
        </div>
      </div>
    ),
  }
);

// ═══════════════════════════════════════════════════════════════════
// HOME PAGE — Dashboard con 3 tabs
// FIX 4: key={activeTab} en cada tab para forzar unmount/remount
//        al cambiar de tab, lo que re-inicializa el mapa y fetch
// ═══════════════════════════════════════════════════════════════════

export default function Home() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('rutas');

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {/* FIX 4: key fuerza unmount/remount completo al cambiar de tab */}
      {activeTab === 'rutas' && <RutasTab key="rutas" />}
      {activeTab === 'asignaciones' && <AsignacionesTab key="asignaciones" />}
      {activeTab === 'envivo' && <EnVivoTab key={`envivo-${Date.now()}`} />}
    </DashboardLayout>
  );
}
