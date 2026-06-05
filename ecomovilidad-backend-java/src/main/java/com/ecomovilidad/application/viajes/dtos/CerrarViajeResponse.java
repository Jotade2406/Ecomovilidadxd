package com.ecomovilidad.application.viajes.dtos;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * DTO de respuesta al cerrar un viaje.
 */
public record CerrarViajeResponse(
        UUID viajeId,
        String estado,
        LocalDateTime fechaCierre,
        int cantidadEstudiantes
) {}
