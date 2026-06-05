package com.ecomovilidad.application.viajes.dtos;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO de salida para representar un Viaje.
 * Los campos nombreRuta, placaVehiculo y nombreConductor son opcionales
 * (null cuando no se resuelven) y el frontend los muestra con fallback.
 */
public record ViajeResponse(
        UUID id,
        UUID rutaId,
        UUID vehiculoId,
        UUID conductorId,
        String estado,
        LocalDateTime fechaInicio,
        LocalDateTime fechaFin,
        LocalDateTime creadoEn,
        String nombreRuta,
        String placaVehiculo,
        String nombreConductor
) {}
