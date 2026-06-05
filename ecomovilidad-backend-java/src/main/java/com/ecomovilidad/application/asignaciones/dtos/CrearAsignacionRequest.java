package com.ecomovilidad.application.asignaciones.dtos;

import java.util.UUID;

/**
 * Request para crear una asignación ruta-vehículo-conductor.
 */
public record CrearAsignacionRequest(
        UUID rutaId,
        UUID vehiculoId,
        UUID conductorId
) {}
