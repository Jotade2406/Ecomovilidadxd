package com.ecomovilidad.application.viajes.dtos;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO de salida para representar un Viaje.
 */
public record ViajeResponse(
        UUID id,
        UUID rutaId,
        UUID vehiculoId,
        UUID conductorId,
        String estado,
        LocalDateTime fechaInicio,
        LocalDateTime fechaFin,
        LocalDateTime creadoEn
) {}
