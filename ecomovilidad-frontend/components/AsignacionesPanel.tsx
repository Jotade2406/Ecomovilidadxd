'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAsignaciones } from '@/hooks/useAsignaciones';
import { useNotificacion } from '@/hooks/useNotificacion';
import { api } from '@/lib/api';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import {
  Plus, Trash2, Power, PowerOff, X,
  Route, Truck, User, Loader2
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────

interface RutaMin { id: string; nombre: string }
interface VehiculoMin { id: string; placa: string }
interface ConductorMin { id: string; nombre: string }

// ═══════════════════════════════════════════════════════════════════
// MODAL CREAR ASIGNACIÓN
// ═══════════════════════════════════════════════════════════════════

function ModalAsignacion({
  onClose,
  onCrear,
}: {
  onClose: () => void;
  onCrear: (rutaId: string, vehiculoId: string, conductorId: string) => Promise<void>;
}) {
  const [rutas, setRutas] = useState<RutaMin[]>([]);
  const [vehiculos, setVehiculos] = useState<VehiculoMin[]>([]);
  const [conductores, setConductores] = useState<ConductorMin[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [rutaId, setRutaId] = useState('');
  const [vehiculoId, setVehiculoId] = useState('');
  const [conductorId, setConductorId] = useState('');

  useEffect(() => {
    async function cargar() {
      setLoading(true);
      const [r, v, c] = await Promise.all([
        api.get<RutaMin[]>('/api/Rutas'),
        api.get<VehiculoMin[]>('/api/Flota/vehiculos'),
        api.get<ConductorMin[]>('/api/Flota/conductores'),
      ]);
      setRutas(r.data ?? []);
      setVehiculos(v.data ?? []);
      setConductores(c.data ?? []);
      setLoading(false);
    }
    cargar();
  }, []);

  const handleGuardar = async () => {
    if (!rutaId || !vehiculoId || !conductorId) return;
    setSaving(true);
    await onCrear(rutaId, vehiculoId, conductorId);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 p-6 ring-1 ring-slate-700/60 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-slate-100">Nueva Asignación</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-slate-300">
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={24} className="animate-spin text-emerald-500" />
          </div>
        ) : (
          <div className="space-y-4">
            <Select
              label="Ruta"
              options={rutas.map(r => ({ value: r.id, label: r.nombre }))}
              placeholder="Seleccionar ruta..."
              value={rutaId}
              onChange={e => setRutaId(e.target.value)}
            />
            <Select
              label="Vehículo"
              options={vehiculos.map(v => ({ value: v.id, label: v.placa }))}
              placeholder="Seleccionar vehículo..."
              value={vehiculoId}
              onChange={e => setVehiculoId(e.target.value)}
            />
            <Select
              label="Conductor"
              options={conductores.map(c => ({ value: c.id, label: c.nombre }))}
              placeholder="Seleccionar conductor..."
              value={conductorId}
              onChange={e => setConductorId(e.target.value)}
            />

            <div className="flex gap-2 pt-2">
              <Button variant="ghost" size="md" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleGuardar}
                loading={saving}
                disabled={!rutaId || !vehiculoId || !conductorId}
                className="flex-1"
              >
                Crear Asignación
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PANEL ASIGNACIONES
// ═══════════════════════════════════════════════════════════════════

export default function AsignacionesPanel() {
  const { asignaciones, loading, crear, desactivar, eliminar } = useAsignaciones();
  const { notificarExito, notificarError } = useNotificacion();
  const [showModal, setShowModal] = useState(false);
  const [delId, setDelId] = useState<string | null>(null);

  const handleCrear = async (rutaId: string, vehiculoId: string, conductorId: string) => {
    const result = await crear({ rutaId, vehiculoId, conductorId });
    if (result) {
      notificarExito('Asignación creada exitosamente');
      setShowModal(false);
    } else {
      notificarError('Error al crear asignación — verifica que el vehículo no tenga otra activa');
    }
  };

  const handleDesactivar = async (id: string) => {
    const ok = await desactivar(id);
    if (ok) notificarExito('Asignación desactivada');
    else notificarError('Error al desactivar');
  };

  const handleEliminar = async (id: string) => {
    setDelId(id);
    const ok = await eliminar(id);
    if (ok) notificarExito('Asignación eliminada');
    else notificarError('Error al eliminar');
    setDelId(null);
  };

  return (
    <div className="flex flex-col gap-3">
      <Button
        variant="primary"
        size="md"
        icon={<Plus size={15} />}
        onClick={() => setShowModal(true)}
        className="w-full"
      >
        Nueva Asignación
      </Button>

      {loading ? (
        [1, 2, 3].map(i => (
          <div key={i} className="h-[80px] animate-pulse rounded-xl bg-slate-900/70" />
        ))
      ) : asignaciones.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-center">
          <Route size={28} className="mb-2 text-slate-700" />
          <p className="text-sm text-slate-500">Sin asignaciones</p>
          <p className="mt-1 text-[11px] text-slate-600">Asigna una ruta a un vehículo y conductor</p>
        </div>
      ) : (
        asignaciones.map(a => (
          <Card key={a.id} interactive padding="sm">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Route size={12} className="text-emerald-500 shrink-0" />
                  <p className="truncate text-sm font-semibold text-slate-200">{a.nombreRuta}</p>
                </div>
                <div className="mt-1.5 flex items-center gap-3 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Truck size={10} /> {a.placaVehiculo}
                  </span>
                  <span className="flex items-center gap-1">
                    <User size={10} /> {a.nombreConductor}
                  </span>
                </div>
                <div className="mt-1.5">
                  <Badge variant={a.estado === 'ACTIVA' ? 'success' : 'default'}>
                    {a.estado}
                  </Badge>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                {a.estado === 'ACTIVA' && (
                  <button
                    onClick={() => handleDesactivar(a.id)}
                    title="Desactivar"
                    className="rounded-lg p-1.5 text-amber-400/60 hover:bg-amber-500/10 hover:text-amber-400 transition-colors"
                  >
                    <PowerOff size={14} />
                  </button>
                )}
                <button
                  onClick={() => handleEliminar(a.id)}
                  disabled={delId === a.id}
                  title="Eliminar"
                  className="rounded-lg p-1.5 text-red-400/50 hover:bg-red-500/10 hover:text-red-400 transition-colors disabled:opacity-50"
                >
                  {delId === a.id ? <Loader2 size={14} className="animate-spin text-red-400" /> : <Trash2 size={14} />}
                </button>
              </div>
            </div>
          </Card>
        ))
      )}

      {showModal && (
        <ModalAsignacion onClose={() => setShowModal(false)} onCrear={handleCrear} />
      )}
    </div>
  );
}
