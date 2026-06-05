package com.ecomovilidad.application.viajes.dtos;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO de salida para un estudiante asignado a un viaje.
 */
public record EstudianteEnViajeResponse(
        UUID id,
        UUID viajeId,
        UUID estudianteId,
        String nombreEstudiante,
        String paradaAsignada,
        String estado,
        LocalDateTime horaAsignacion,
        LocalDateTime horaDescenso
) {}
