package com.ecomovilidad.application.viajes.dtos;

import java.util.List;
import java.util.UUID;

/**
 * DTO de respuesta al asignar estudiantes a un viaje.
 */
public record AsignarEstudiantesResponse(
        UUID viajeId,
        int cantidadAsignados,
        List<EstudianteEnViajeResponse> estudiantes
) {}
