'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
import type { ViajeDto } from '@/hooks/useViajeActual';
import {
  Plus, PowerOff, Trash2, Route, Truck, User, Loader2, Link2,
  AlertTriangle, RefreshCw, Play, CheckCircle, XCircle, Users, MapPin,
} from 'lucide-react';

interface RutaMin { id: string; nombre: string; }
interface VehiculoMin { id: string; placa: string; }
interface ConductorMin { id: string; nombre: string; }
interface EstudianteItem { id: string; nombre: string; paradaAsignada: string; }

export default function AsignacionesTab() {
  const { asignaciones, loading, crear, desactivar, eliminar, recargar } = useAsignaciones();
  const { notificarExito, notificarError } = useNotificacion();
  const { isDark } = useTheme();

  // ── Estado viajes ────────────────────────────────────────────────
  const [viajes, setViajes] = useState<ViajeDto[]>([]);
  const [cargandoViajes, setCargandoViajes] = useState(false);
  const [iniciandoId, setIniciandoId] = useState<string | null>(null);
  const [completandoId, setCompletandoId] = useState<string | null>(null);
  const [cancelandoId, setCancelandoId] = useState<string | null>(null);

  // ── Estado modal asignar estudiantes ────────────────────────────
  const [showAsignarEst, setShowAsignarEst] = useState(false);
  const [asignarViajeId, setAsignarViajeId] = useState<string | null>(null);
  const [estudiantes, setEstudiantes] = useState<EstudianteItem[]>([]);
  const [loadingEst, setLoadingEst] = useState(false);
  const [selEst, setSelEst] = useState<Set<string>>(new Set());
  const [asignando, setAsignando] = useState(false);

  // ── Estado modal crear asignación ────────────────────────────────
  const [showCrear, setShowCrear] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [desactivandoId, setDesactivandoId] = useState<string | null>(null);
  const [rutas, setRutas] = useState<RutaMin[]>([]);
  const [vehiculos, setVehiculos] = useState<VehiculoMin[]>([]);
  const [conductores, setConductores] = useState<ConductorMin[]>([]);
  const [loadingOpc, setLoadingOpc] = useState(false);
  const [opcCargadas, setOpcCargadas] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selRuta, setSelRuta] = useState('');
  const [selVehiculo, setSelVehiculo] = useState('');
  const [selConductor, setSelConductor] = useState('');

  // ── Cargar viajes ────────────────────────────────────────────────
  const cargarViajes = useCallback(async () => {
    setCargandoViajes(true);
    const { data } = await api.get<ViajeDto[]>('/api/Viajes');
    if (data) setViajes(data);
    setCargandoViajes(false);
  }, []);

  useEffect(() => { cargarViajes(); }, [cargarViajes]);

  // ── Match: viaje activo para una asignación ──────────────────────
  const viajeDeAsignacion = useCallback(
    (asig: AsignacionRutaResponse): ViajeDto | null =>
      viajes.find(
        (v) =>
          v.vehiculoId === asig.vehiculoId &&
          (v.estado === 'EnCurso' || v.estado === 'Programado')
      ) ?? null,
    [viajes]
  );

  // ── Acciones de viaje ────────────────────────────────────────────
  const handleIniciarViaje = async (asig: AsignacionRutaResponse) => {
    setIniciandoId(asig.id);
    const { error } = await api.post('/api/Viajes/iniciar', {
      rutaId: asig.rutaId,
      vehiculoId: asig.vehiculoId,
      conductorId: asig.conductorId,
    });
    setIniciandoId(null);
    if (error) { notificarError('No se pudo iniciar el viaje: ' + error); return; }
    notificarExito('Viaje iniciado correctamente');
    await cargarViajes();
  };

  const handleCompletarViaje = async (viajeId: string) => {
    setCompletandoId(viajeId);
    const { error } = await api.patch(`/api/Viajes/${viajeId}/completar`, {});
    setCompletandoId(null);
    if (error) { notificarError('Error al completar viaje'); return; }
    notificarExito('Viaje completado');
    await cargarViajes();
  };

  const handleCancelarViaje = async (viajeId: string) => {
    setCancelandoId(viajeId);
    const { error } = await api.patch(`/api/Viajes/${viajeId}/cancelar`, {});
    setCancelandoId(null);
    if (error) { notificarError('Error al cancelar viaje'); return; }
    notificarExito('Viaje cancelado');
    await cargarViajes();
  };

  // ── Validaciones modal ───────────────────────────────────────────
  const vehError = useMemo(() => {
    if (!selVehiculo) return undefined;
    const e = asignaciones.find((a) => a.vehiculoId === selVehiculo && a.estado === 'ACTIVA');
    return e ? `Vehículo ya asignado a "${e.nombreRuta}"` : undefined;
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
    } finally {
      setLoadingOpc(false);
    }
  };

  useEffect(() => { cargarOpc(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openCrear = () => {
    setShowCrear(true);
    setSelRuta(''); setSelVehiculo(''); setSelConductor('');
    cargarOpc();
  };

  const handleCrear = async () => {
    if (!formValid) return;
    setSaving(true);
    const r = await crear({ rutaId: selRuta, vehiculoId: selVehiculo, conductorId: selConductor });
    setSaving(false);
    if (r) { notificarExito('Asignación creada'); setShowCrear(false); }
    else notificarError('Error al crear asignación');
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

  const handleRefreshAll = async () => {
    await Promise.all([recargar(), cargarViajes()]);
  };

  // ── Asignar estudiantes ──────────────────────────────────────────
  const openAsignarEst = async (viajeId: string) => {
    setAsignarViajeId(viajeId);
    setSelEst(new Set());
    setShowAsignarEst(true);
    setLoadingEst(true);
    const { data } = await api.get<EstudianteItem[]>('/api/Comunidad/estudiantes');
    setEstudiantes(data ?? []);
    setLoadingEst(false);
  };

  const toggleEst = (id: string) => {
    setSelEst((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleAsignarEstudiantes = async () => {
    if (!asignarViajeId || selEst.size === 0) return;
    setAsignando(true);
    const { error } = await api.post(`/api/Viajes/${asignarViajeId}/asignar-estudiantes`, {
      estudianteIds: Array.from(selEst),
    });
    setAsignando(false);
    if (error) { notificarError('Error al asignar: ' + error); return; }
    notificarExito(`${selEst.size} estudiante(s) asignados al viaje`);
    setShowAsignarEst(false);
    await cargarViajes();
  };

  // ── Columnas ─────────────────────────────────────────────────────
  const columns: TableColumn<AsignacionRutaResponse>[] = [
    {
      key: 'ruta', header: 'Ruta', className: 'flex-1',
      render: (i) => (
        <div className="flex items-center gap-2">
          <Route size={14} className="text-emerald-500 shrink-0" />
          <span className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>
            {i.nombreRuta}
          </span>
        </div>
      ),
    },
    {
      key: 'vehiculo', header: 'Vehículo', className: 'w-28',
      render: (i) => (
        <div className="flex items-center gap-1.5">
          <Truck size={12} style={{ color: 'var(--text-muted)' }} />
          <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
            {i.placaVehiculo}
          </span>
        </div>
      ),
    },
    {
      key: 'conductor', header: 'Conductor', className: 'w-36',
      render: (i) => (
        <div className="flex items-center gap-1.5">
          <User size={12} style={{ color: 'var(--text-muted)' }} />
          <span className="text-[13px] truncate" style={{ color: 'var(--text-secondary)' }}>
            {i.nombreConductor}
          </span>
        </div>
      ),
    },
    {
      key: 'viaje', header: 'Viaje', className: 'w-52',
      render: (i) => {
        const v = viajeDeAsignacion(i);
        if (cargandoViajes) {
          return <Loader2 size={12} className="animate-spin" style={{ color: 'var(--text-muted)' }} />;
        }
        if (!v) {
          return (
            <button
              onClick={() => handleIniciarViaje(i)}
              disabled={iniciandoId === i.id}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold text-white transition-all active:scale-95 disabled:opacity-60"
              style={{ background: 'var(--primary)' }}
            >
              {iniciandoId === i.id
                ? <Loader2 size={10} className="animate-spin" />
                : <Play size={10} />}
              Iniciar Viaje
            </button>
          );
        }
        return (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant={v.estado === 'EnCurso' ? 'success' : 'info'}>
              {v.estado}
            </Badge>
            {v.estado === 'EnCurso' && (
              <>
                <button
                  onClick={() => openAsignarEst(v.id)}
                  className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium transition"
                  style={{ background: 'rgba(99,102,241,0.1)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.25)' }}
                >
                  <Users size={9} /> Estudiantes
                </button>
                <button
                  onClick={() => handleCompletarViaje(v.id)}
                  disabled={completandoId === v.id}
                  className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium transition disabled:opacity-50"
                  style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.25)' }}
                >
                  {completandoId === v.id
                    ? <Loader2 size={9} className="animate-spin" />
                    : <CheckCircle size={9} />}
                  Completar
                </button>
              </>
            )}
            <button
              onClick={() => handleCancelarViaje(v.id)}
              disabled={cancelandoId === v.id}
              className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium transition disabled:opacity-50"
              style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              {cancelandoId === v.id
                ? <Loader2 size={9} className="animate-spin" />
                : <XCircle size={9} />}
              Cancelar
            </button>
          </div>
        );
      },
    },
    {
      key: 'acciones', header: '', className: 'w-20',
      render: (i) => (
        <div className="flex items-center gap-0.5">
          {i.estado === 'ACTIVA' && (
            <button
              onClick={() => handleDesactivar(i.id)}
              disabled={desactivandoId === i.id}
              title="Desactivar asignación"
              className="p-1.5 rounded-md transition-colors hover:text-amber-400 disabled:opacity-50"
              style={{ color: 'var(--text-muted)' }}
            >
              {desactivandoId === i.id
                ? <Loader2 size={13} className="animate-spin" />
                : <PowerOff size={13} />}
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

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5 p-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2
          className="text-[15px] font-semibold flex items-center gap-2"
          style={{ color: 'var(--text-primary)' }}
        >
          <Link2 size={16} className="text-emerald-500" />
          Asignaciones
          <span className="text-[11px] font-normal ml-1" style={{ color: 'var(--text-muted)' }}>
            — inicia viajes directamente desde aquí
          </span>
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefreshAll}
            title="Actualizar"
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)', background: 'var(--bg-hover)' }}
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={openCrear}
            className="flex items-center gap-1.5 rounded-lg h-9 px-4 text-[13px] font-medium text-white transition-all duration-150 active:scale-[0.97]"
            style={{ background: 'var(--primary)' }}
          >
            <Plus size={14} />
            Nueva Asignación
          </button>
        </div>
      </div>

      {/* Resumen de viajes activos */}
      {viajes.filter((v) => v.estado === 'EnCurso').length > 0 && (
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-3"
          style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}
        >
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <p className="text-[12px] font-medium text-emerald-400">
            {viajes.filter((v) => v.estado === 'EnCurso').length} viaje(s) en curso ahora mismo
          </p>
        </div>
      )}

      {/* Tabla */}
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
            <p className="mt-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
              Asigna una ruta a un vehículo y conductor
            </p>
          </div>
        }
      />

      {/* Modal crear asignación */}
      <Modal
        open={showCrear}
        onClose={() => setShowCrear(false)}
        title="Nueva Asignación"
        maxWidth="max-w-lg"
        footer={
          <div className="flex gap-2">
            <Button variant="ghost" size="md" onClick={() => setShowCrear(false)} className="flex-1">
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleCrear}
              loading={saving}
              disabled={!formValid}
              className="flex-1"
            >
              Guardar
            </Button>
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
                  <p className="text-[11px] font-medium" style={{ color: isDark ? '#FBBF24' : '#92400E' }}>
                    Datos faltantes
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: isDark ? 'rgba(251,191,36,0.7)' : '#B45309' }}>
                    {rutas.length === 0 && 'No hay rutas. '}
                    {vehiculos.length === 0 && 'No hay vehículos. '}
                    {conductores.length === 0 && 'No hay conductores. '}
                  </p>
                  <button
                    onClick={cargarOpc}
                    className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold"
                    style={{ color: isDark ? '#FBBF24' : '#D97706' }}
                  >
                    <RefreshCw size={10} /> Reintentar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal eliminar */}
      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Confirmar eliminación"
        footer={
          <div className="flex gap-2">
            <Button variant="ghost" size="md" onClick={() => setDeleteId(null)} className="flex-1">
              Cancelar
            </Button>
            <Button variant="danger" size="md" onClick={handleEliminar} loading={deleting} className="flex-1">
              Eliminar
            </Button>
          </div>
        }
      >
        <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
          ¿Estás seguro de que deseas eliminar esta asignación? Esta acción no se puede deshacer.
        </p>
      </Modal>

      {/* Modal asignar estudiantes */}
      <Modal
        open={showAsignarEst}
        onClose={() => setShowAsignarEst(false)}
        title="Asignar estudiantes al viaje"
        maxWidth="max-w-lg"
        footer={
          <div className="flex gap-2">
            <Button variant="ghost" size="md" onClick={() => setShowAsignarEst(false)} className="flex-1">
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleAsignarEstudiantes}
              loading={asignando}
              disabled={selEst.size === 0}
              className="flex-1"
            >
              Asignar {selEst.size > 0 ? `(${selEst.size})` : ''}
            </Button>
          </div>
        }
      >
        {loadingEst ? (
          <div className="flex flex-col items-center py-10 gap-2">
            <Loader2 size={20} className="animate-spin text-emerald-500" />
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Cargando estudiantes...</p>
          </div>
        ) : estudiantes.length === 0 ? (
          <div className="flex flex-col items-center py-8 gap-2 text-center">
            <Users size={28} style={{ color: 'var(--text-muted)' }} />
            <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
              No hay estudiantes registrados
            </p>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              Los estudiantes aparecen aquí cuando se registran con rol Estudiante
            </p>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
            <p className="text-[11px] mb-3" style={{ color: 'var(--text-muted)' }}>
              Seleccioná los estudiantes a agregar a este viaje
            </p>
            {estudiantes.map((est) => (
              <label
                key={est.id}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 cursor-pointer transition-colors"
                style={{
                  background: selEst.has(est.id)
                    ? 'rgba(99,102,241,0.08)'
                    : isDark ? 'rgba(255,255,255,0.03)' : 'var(--bg-hover)',
                  border: `1px solid ${selEst.has(est.id) ? 'rgba(99,102,241,0.3)' : 'var(--border-subtle)'}`,
                }}
              >
                <input
                  type="checkbox"
                  checked={selEst.has(est.id)}
                  onChange={() => toggleEst(est.id)}
                  className="accent-indigo-500 h-4 w-4 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                    {est.nombre}
                  </p>
                  <p className="flex items-center gap-1 text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    <MapPin size={8} /> {est.paradaAsignada}
                  </p>
                </div>
              </label>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
