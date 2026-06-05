package com.ecomovilidad.application.asignaciones.dtos;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO de respuesta para una asignación ruta-vehículo-conductor.
 */
public record AsignacionRutaResponse(
        UUID id,
        UUID rutaId,
        UUID vehiculoId,
        UUID conductorId,
        String estado,
        String nombreRuta,
        String placaVehiculo,
        String nombreConductor,
        LocalDateTime fechaCreacion
) {}
