'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAsignaciones } from '@/hooks/useAsignaciones';
import { useNotificacion } from '@/hooks/useNotificacion';
import { useTheme } from '@/context/ThemeContext';
import { api } from '@/lib/api';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Select from '@/components/ui/Select';
import Modal from '@/components/shared/Modal';
import Table, { type TableColumn } from '@/components/shared/Table';
import type { AsignacionRutaResponse } from '@/services/asignacionesService';
import {
  Plus,
  PowerOff,
  Trash2,
  Route,
  Truck,
  User,
  Loader2,
  Link2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────

interface RutaMin { id: string; nombre: string; }
interface VehiculoMin { id: string; placa: string; }
interface ConductorMin { id: string; nombre: string; }

// ═══════════════════════════════════════════════════════════════════
// ASIGNACIONES TAB — Rediseño SaaS
// ═══════════════════════════════════════════════════════════════════

export default function AsignacionesTab() {
  const { asignaciones, loading, crear, desactivar, eliminar } = useAsignaciones();
  const { notificarExito, notificarError } = useNotificacion();
  const { isDark } = useTheme();

  const [showCrear, setShowCrear] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [desactivandoId, setDesactivandoId] = useState<string | null>(null);

  // Modal state
  const [rutas, setRutas] = useState<RutaMin[]>([]);
  const [vehiculos, setVehiculos] = useState<VehiculoMin[]>([]);
  const [conductores, setConductores] = useState<ConductorMin[]>([]);
  const [loadingOpc, setLoadingOpc] = useState(false);
  const [opcCargadas, setOpcCargadas] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selRuta, setSelRuta] = useState('');
  const [selVehiculo, setSelVehiculo] = useState('');
  const [selConductor, setSelConductor] = useState('');

  const vehError = useMemo(() => {
    if (!selVehiculo) return undefined;
    const e = asignaciones.find((a) => a.vehiculoId === selVehiculo && a.estado === 'ACTIVA');
    return e ? `Vehículo asignado a "${e.nombreRuta}"` : undefined;
  }, [selVehiculo, asignaciones]);

  const formValid = useMemo(
    () => selRuta !== '' && selVehiculo !== '' && selConductor !== '' && !vehError,
    [selRuta, selVehiculo, selConductor, vehError]
  );

  const cargarOpc = async () => {
    setLoadingOpc(true);
    try {
      const [r, v, c] = await Promise.all([
        api.get<RutaMin[]>('/api/Rutas'),
        api.get<VehiculoMin[]>('/api/Flota/vehiculos'),
        api.get<ConductorMin[]>('/api/Flota/conductores'),
      ]);
      setRutas(r.data ?? []);
      setVehiculos(v.data ?? []);
      setConductores(c.data ?? []);
      setOpcCargadas(true);
    } catch {
      setOpcCargadas(true);
    } finally {
      setLoadingOpc(false);
    }
  };

  useEffect(() => { cargarOpc(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openCrear = () => { setShowCrear(true); setSelRuta(''); setSelVehiculo(''); setSelConductor(''); cargarOpc(); };

  const handleCrear = async () => {
    if (!formValid) return;
    setSaving(true);
    const r = await crear({ rutaId: selRuta, vehiculoId: selVehiculo, conductorId: selConductor });
    if (r) { notificarExito('Asignación creada'); setShowCrear(false); }
    else notificarError('Error al crear asignación');
    setSaving(false);
  };

  const handleDesactivar = async (id: string) => {
    setDesactivandoId(id);
    const ok = await desactivar(id);
    ok ? notificarExito('Desactivada') : notificarError('Error');
    setDesactivandoId(null);
  };

  const handleEliminar = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const ok = await eliminar(deleteId);
    ok ? notificarExito('Eliminada') : notificarError('Error');
    setDeleting(false);
    setDeleteId(null);
  };

  const columns: TableColumn<AsignacionRutaResponse>[] = [
    {
      key: 'ruta', header: 'Ruta', className: 'flex-1',
      render: (i) => (
        <div className="flex items-center gap-2">
          <Route size={14} className="text-emerald-500 shrink-0" />
          <span className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>{i.nombreRuta}</span>
        </div>
      ),
    },
    {
      key: 'vehiculo', header: 'Vehículo', className: 'w-full md:w-32',
      render: (i) => (
        <div className="flex items-center gap-1.5">
          <Truck size={12} style={{ color: 'var(--text-muted)' }} />
          <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>{i.placaVehiculo}</span>
        </div>
      ),
    },
    {
      key: 'conductor', header: 'Conductor', className: 'w-full md:w-40',
      render: (i) => (
        <div className="flex items-center gap-1.5">
          <User size={12} style={{ color: 'var(--text-muted)' }} />
          <span className="text-[13px] truncate" style={{ color: 'var(--text-secondary)' }}>{i.nombreConductor}</span>
        </div>
      ),
    },
    {
      key: 'estado', header: 'Estado', className: 'w-full md:w-28',
      render: (i) => <Badge variant={i.estado === 'ACTIVA' ? 'success' : 'default'}>{i.estado}</Badge>,
    },
    {
      key: 'acciones', header: '', className: 'w-full md:w-24',
      render: (i) => (
        <div className="flex items-center gap-0.5">
          {i.estado === 'ACTIVA' && (
            <button
              onClick={() => handleDesactivar(i.id)}
              disabled={desactivandoId === i.id}
              title="Desactivar"
              className="p-1.5 rounded-md transition-colors hover:text-amber-400 disabled:opacity-50"
              style={{ color: 'var(--text-muted)' }}
            >
              {desactivandoId === i.id ? <Loader2 size={13} className="animate-spin" /> : <PowerOff size={13} />}
            </button>
          )}
          <button
            onClick={() => setDeleteId(i.id)}
            title="Eliminar"
            className="p-1.5 rounded-md transition-colors hover:text-red-400"
            style={{ color: 'var(--text-muted)' }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5 p-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-[15px] font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Link2 size={16} className="text-emerald-500" />
          Asignaciones
        </h2>
        <button
          onClick={openCrear}
          className="flex items-center gap-1.5 rounded-lg h-9 px-4 text-[13px] font-medium text-white transition-all duration-150 active:scale-[0.97]"
          style={{ background: 'var(--primary)' }}
        >
          <Plus size={14} />
          Nueva Asignación
        </button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={asignaciones}
        rowKey={(i) => i.id}
        pageSize={10}
        loading={loading}
        emptyState={
          <div className="flex flex-col items-center">
            <Route size={28} className="mb-2" style={{ color: 'var(--text-muted)' }} />
            <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Sin asignaciones</p>
            <p className="mt-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>Asigna una ruta a un vehículo y conductor</p>
          </div>
        }
      />

      {/* ═══════════ MODAL CREAR ═══════════ */}
      <Modal
        open={showCrear}
        onClose={() => setShowCrear(false)}
        title="Nueva Asignación"
        maxWidth="max-w-lg"
        footer={
          <div className="flex gap-2">
            <Button variant="ghost" size="md" onClick={() => setShowCrear(false)} className="flex-1">Cancelar</Button>
            <Button variant="primary" size="md" onClick={handleCrear} loading={saving} disabled={!formValid} className="flex-1">Guardar</Button>
          </div>
        }
      >
        {loadingOpc ? (
          <div className="flex flex-col items-center py-10 gap-2">
            <Loader2 size={20} className="animate-spin text-emerald-500" />
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Cargando opciones...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Select
              label="Ruta"
              options={rutas.map((r) => ({ value: r.id, label: r.nombre }))}
              placeholder={rutas.length === 0 ? 'No hay rutas' : 'Seleccionar ruta...'}
              value={selRuta}
              onChange={(e) => setSelRuta(e.target.value)}
            />
            <Select
              label="Vehículo"
              options={vehiculos.map((v) => ({ value: v.id, label: v.placa }))}
              placeholder={vehiculos.length === 0 ? 'No hay vehículos' : 'Seleccionar vehículo...'}
              value={selVehiculo}
              onChange={(e) => setSelVehiculo(e.target.value)}
              error={vehError}
            />
            <Select
              label="Conductor"
              options={conductores.map((c) => ({ value: c.id, label: c.nombre }))}
              placeholder={conductores.length === 0 ? 'No hay conductores' : 'Seleccionar conductor...'}
              value={selConductor}
              onChange={(e) => setSelConductor(e.target.value)}
            />

            {/* Warning: missing data */}
            {opcCargadas && (rutas.length === 0 || vehiculos.length === 0 || conductores.length === 0) && (
              <div
                className="flex items-start gap-2 rounded-lg px-3 py-2.5"
                style={{
                  background: isDark ? 'rgba(245,158,11,0.08)' : 'rgba(245,158,11,0.06)',
                  border: `1px solid ${isDark ? 'rgba(245,158,11,0.2)' : 'rgba(217,119,6,0.2)'}`,
                }}
              >
                <AlertTriangle size={14} className="mt-0.5 shrink-0" style={{ color: isDark ? '#FBBF24' : '#D97706' }} />
                <div>
                  <p className="text-[11px] font-medium" style={{ color: isDark ? '#FBBF24' : '#92400E' }}>Datos faltantes</p>
                  <p className="text-[10px] mt-0.5" style={{ color: isDark ? 'rgba(251,191,36,0.7)' : '#B45309' }}>
                    {rutas.length === 0 && 'No hay rutas. '}
                    {vehiculos.length === 0 && 'No hay vehículos. '}
                    {conductores.length === 0 && 'No hay conductores. '}
                  </p>
                  <button onClick={cargarOpc} className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold transition-colors" style={{ color: isDark ? '#FBBF24' : '#D97706' }}>
                    <RefreshCw size={10} /> Reintentar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ═══════════ MODAL ELIMINAR ═══════════ */}
      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Confirmar eliminación"
        footer={
          <div className="flex gap-2">
            <Button variant="ghost" size="md" onClick={() => setDeleteId(null)} className="flex-1">Cancelar</Button>
            <Button variant="danger" size="md" onClick={handleEliminar} loading={deleting} className="flex-1">Eliminar</Button>
          </div>
        }
      >
        <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
          ¿Estás seguro de que deseas eliminar esta asignación? Esta acción no se puede deshacer.
        </p>
      </Modal>
    </div>
  );
}
