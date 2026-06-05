'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/lib/api';
import { conectar, suscribir } from '@/lib/stompClient';

export interface ViajeDto {
  id: string;
  rutaId: string;
  vehiculoId: string;
  conductorId: string;
  estado: string; // Programado | EnCurso | Completado | Cancelado
  fechaInicio: string | null;
  fechaFin: string | null;
  creadoEn: string;
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

export function useViajeActual(): UseViajeActualReturn {
  const [viajes, setViajes] = useState<ViajeDto[]>([]);
  const [viajeActivo, setViajeActivo] = useState<ViajeDto | null>(null);
  const [estudiantes, setEstudiantes] = useState<EstudianteEnViajeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ref para no incluir viajeActivo como dependencia de recargar (evita loop)
  const viajeActivoRef = useRef<ViajeDto | null>(null);

  const recargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: apiErr } = await api.get<ViajeDto[]>(EP);
      if (apiErr || !data) throw new Error(apiErr ?? 'Error cargando viajes');
      setViajes(data);

      // Auto-seleccionar primer viaje EnCurso solo si no hay ninguno activo aún
      const enCurso = data.find((v) => v.estado === 'EnCurso');
      if (enCurso && !viajeActivoRef.current) {
        setViajeActivo(enCurso);
        viajeActivoRef.current = enCurso;
      } else if (viajeActivoRef.current) {
        // Actualizar los datos del viaje activo si cambió
        const updated = data.find((v) => v.id === viajeActivoRef.current?.id);
        if (updated) {
          setViajeActivo(updated);
          viajeActivoRef.current = updated;
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []); // Sin dependencias → estable

  useEffect(() => {
    recargar();
  }, [recargar]);

  // Suscribirse a cambios de estado de viaje vía WebSocket
  useEffect(() => {
    conectar(undefined, undefined);
    const unsub = suscribir('/topic/viajes', () => {
      recargar();
    });
    return () => { unsub(); };
  }, [recargar]);

  // Cargar estudiantes cuando cambia el viaje activo
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
      .catch(() => setEstudiantes([]));
  }, [viajeActivo]);

  const seleccionarViaje = useCallback((viaje: ViajeDto | null) => {
    setViajeActivo(viaje);
    viajeActivoRef.current = viaje;
  }, []);

  return { viajes, viajeActivo, estudiantes, loading, error, seleccionarViaje, recargar };
}
