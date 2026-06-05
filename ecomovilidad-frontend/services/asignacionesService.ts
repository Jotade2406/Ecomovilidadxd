import { api } from '@/lib/api';

// ─── Types ──────────────────────────────────────────────────────────

export interface AsignacionRutaResponse {
  id: string;
  rutaId: string;
  vehiculoId: string;
  conductorId: string;
  estado: string;
  nombreRuta: string;
  placaVehiculo: string;
  nombreConductor: string;
  fechaCreacion: string;
}

export interface CrearAsignacionRequest {
  rutaId: string;
  vehiculoId: string;
  conductorId: string;
}

const EP = '/api/Asignaciones';

// ─── Service ────────────────────────────────────────────────────────

export const asignacionesService = {
  async obtenerTodas() {
    return api.get<AsignacionRutaResponse[]>(EP);
  },

  async obtenerActivas() {
    return api.get<AsignacionRutaResponse[]>(`${EP}/activas`);
  },

  async crear(request: CrearAsignacionRequest) {
    return api.post<AsignacionRutaResponse>(EP, request);
  },

  async desactivar(id: string) {
    return api.patch<AsignacionRutaResponse>(`${EP}/${id}/desactivar`);
  },

  async eliminar(id: string) {
    return api.delete(`${EP}/${id}`);
  },
};
