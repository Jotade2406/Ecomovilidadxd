'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  asignacionesService,
  type AsignacionRutaResponse,
  type CrearAsignacionRequest,
} from '@/services/asignacionesService';

interface UseAsignacionesReturn {
  asignaciones: AsignacionRutaResponse[];
  loading: boolean;
  error: string | null;
  crear: (req: CrearAsignacionRequest) => Promise<AsignacionRutaResponse | null>;
  desactivar: (id: string) => Promise<boolean>;
  eliminar: (id: string) => Promise<boolean>;
  recargar: () => Promise<void>;
}

export function useAsignaciones(): UseAsignacionesReturn {
  const [asignaciones, setAsignaciones] = useState<AsignacionRutaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: apiErr } = await asignacionesService.obtenerTodas();
      if (apiErr || !data) throw new Error(apiErr ?? 'Error cargando asignaciones');
      setAsignaciones(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  const crear = useCallback(
    async (req: CrearAsignacionRequest): Promise<AsignacionRutaResponse | null> => {
      const { data, error: apiErr } = await asignacionesService.crear(req);
      if (apiErr || !data) {
        setError(apiErr ?? 'Error creando asignación');
        return null;
      }
      await recargar();
      return data;
    },
    [recargar]
  );

  const desactivar = useCallback(
    async (id: string): Promise<boolean> => {
      const { error: apiErr } = await asignacionesService.desactivar(id);
      if (apiErr) {
        setError(apiErr);
        return false;
      }
      await recargar();
      return true;
    },
    [recargar]
  );

  const eliminar = useCallback(
    async (id: string): Promise<boolean> => {
      const { error: apiErr } = await asignacionesService.eliminar(id);
      if (apiErr) {
        setError(apiErr);
        return false;
      }
      await recargar();
      return true;
    },
    [recargar]
  );

  return { asignaciones, loading, error, crear, desactivar, eliminar, recargar };
}
