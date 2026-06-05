'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

// ─── Types ──────────────────────────────────────────────────────────

export interface CoordenadaDto {
  latitud: number;
  longitud: number;
  orden?: number;
}

export interface RutaDto {
  id: string;
  nombre: string;
  origen: CoordenadaDto;
  destino: CoordenadaDto;
  estado: string;
  color: string;
  puntosIntermedios: CoordenadaDto[];
  distanciaTotalKm: number;
  fechaCreacion: string;
}

export interface PuntoIntermedioCoordenada {
  latitud: number;
  longitud: number;
  orden: number;
}

export interface CrearRutaRequest {
  nombre: string;
  origenLatitud: number;
  origenLongitud: number;
  destinoLatitud: number;
  destinoLongitud: number;
  color: string;
  puntosIntermedios?: PuntoIntermedioCoordenada[];
}

interface UseRutasReturn {
  rutas: RutaDto[];
  loading: boolean;
  error: string | null;
  crear: (req: CrearRutaRequest) => Promise<RutaDto | null>;
  eliminar: (id: string) => Promise<boolean>;
  activar: (id: string) => Promise<boolean>;
  suspender: (id: string) => Promise<boolean>;
  recargar: () => Promise<void>;
}

const EP = '/api/Rutas';

// ═══════════════════════════════════════════════════════════════════
// useRutas — Hook para gestión de rutas (GET / POST / DELETE)
// ═══════════════════════════════════════════════════════════════════

export function useRutas(): UseRutasReturn {
  const [rutas, setRutas] = useState<RutaDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Cargar todas las rutas ────────────────────────────────────────
  const recargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: apiErr } = await api.get<RutaDto[]>(EP);
      if (apiErr || !data) throw new Error(apiErr ?? 'Error cargando rutas');
      setRutas(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  // ── Crear nueva ruta (+ puntos intermedios en 2da llamada) ───────
  const crear = useCallback(
    async (req: CrearRutaRequest): Promise<RutaDto | null> => {
      // Paso 1: crear la ruta (el backend no acepta puntosIntermedios aquí)
      const { nombre, origenLatitud, origenLongitud, destinoLatitud, destinoLongitud, color } = req;
      const { data, error: apiErr } = await api.post<RutaDto>(EP, {
        nombre, origenLatitud, origenLongitud, destinoLatitud, destinoLongitud, color,
      });

      if (apiErr || !data) {
        setError(apiErr ?? 'Error creando ruta');
        return null;
      }

      // Paso 2: persistir los puntos OSRM en endpoint dedicado
      if (req.puntosIntermedios && req.puntosIntermedios.length > 0) {
        await api.post(`${EP}/${data.id}/puntos-intermedios`, req.puntosIntermedios);
      }

      await recargar();
      return data;
    },
    [recargar]
  );

  // ── Eliminar ruta ─────────────────────────────────────────────────
  const eliminar = useCallback(
    async (id: string): Promise<boolean> => {
      const { error: apiErr } = await api.delete(`${EP}/${id}`);
      if (apiErr) { setError(apiErr); return false; }
      await recargar();
      return true;
    },
    [recargar]
  );

  // ── Activar ruta (Borrador → Activa / Suspendida → Activa) ────────
  const activar = useCallback(
    async (id: string): Promise<boolean> => {
      const { error: apiErr } = await api.patch(`${EP}/${id}/activar`, {});
      if (apiErr) { setError(apiErr); return false; }
      await recargar();
      return true;
    },
    [recargar]
  );

  // ── Suspender ruta (Activa → Suspendida) ──────────────────────────
  const suspender = useCallback(
    async (id: string): Promise<boolean> => {
      const { error: apiErr } = await api.patch(`${EP}/${id}/suspender`, {});
      if (apiErr) { setError(apiErr); return false; }
      await recargar();
      return true;
    },
    [recargar]
  );

  return { rutas, loading, error, crear, eliminar, activar, suspender, recargar };
}
