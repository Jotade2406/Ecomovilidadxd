'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

// ─── Types ──────────────────────────────────────────────────────────

export interface ViajeDto {
  id: string;
  rutaId: string;
  vehiculoId: string;
  conductorId: string;
  estado: string;          // Programado | EnCurso | Completado | Cancelado
  fechaInicio: string | null;
  fechaFin: string | null;
  creadoEn: string;
  // Campos opcionales que puede enviar el backend
  nombreRuta?: string;
  placaVehiculo?: string;
  nombreConductor?: string;
  telefonoConductor?: string;
}

export interface EstudianteEnViajeDto {
  id: string;
  estudianteId: string;
  nombreEstudiante: string;
  paradaAsignada: string;
  estado: string; // ASIGNADO | EN_TRANSPORTE | DESCENDIDO | AUSENTE
}

interface UseViajeActualReturn {
  viajes: ViajeDto[];
  viajeActivo: ViajeDto | null;
  estudiantes: EstudianteEnViajeDto[];
  loading: boolean;
  error: string | null;
  seleccionarViaje: (viaje: ViajeDto | null) => void;
  recargar: () => Promise<void>;
}

const EP = '/api/Viajes';

// ═══════════════════════════════════════════════════════════════════
// useViajeActual — Hook para obtener viajes y gestionar viaje activo
// Auto-selecciona el primer viaje EnCurso al cargar
// ═══════════════════════════════════════════════════════════════════

export function useViajeActual(): UseViajeActualReturn {
  const [viajes, setViajes] = useState<ViajeDto[]>([]);
  const [viajeActivo, setViajeActivo] = useState<ViajeDto | null>(null);
  const [estudiantes, setEstudiantes] = useState<EstudianteEnViajeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Cargar viajes ─────────────────────────────────────────────────
  const recargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: apiErr } = await api.get<ViajeDto[]>(EP);
      if (apiErr || !data) throw new Error(apiErr ?? 'Error cargando viajes');
      setViajes(data);

      // Auto-seleccionar primer viaje EnCurso si no hay viaje activo
      const enCurso = data.find((v) => v.estado === 'EnCurso');
      if (enCurso && !viajeActivo) {
        setViajeActivo(enCurso);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [viajeActivo]);

  useEffect(() => {
    recargar();
  }, [recargar]);

  // ── Cargar estudiantes cuando cambia el viaje activo ──────────────
  useEffect(() => {
    if (!viajeActivo) {
      setEstudiantes([]);
      return;
    }

    api
      .get<EstudianteEnViajeDto[]>(`${EP}/${viajeActivo.id}/estudiantes`)
      .then(({ data }) => {
        if (data) setEstudiantes(data);
      })
      .catch(() => {
        setEstudiantes([]);
      });
  }, [viajeActivo]);

  // ── Seleccionar viaje manualmente ─────────────────────────────────
  const seleccionarViaje = useCallback((viaje: ViajeDto | null) => {
    setViajeActivo(viaje);
  }, []);

  return {
    viajes,
    viajeActivo,
    estudiantes,
    loading,
    error,
    seleccionarViaje,
    recargar,
  };
}
