package com.ecomovilidad.application.solicitudes.dtos;

import com.ecomovilidad.domain.solicitudes.EstadoSolicitud;
import java.time.LocalDateTime;
import java.util.UUID;

public record SolicitudEmergenciaResponse(
        String id,
        UUID tenantId,
        UUID estudianteId,
        String descripcion,
        String ubicacion,
        EstadoSolicitud estado,
        LocalDateTime fechaSolicitud,
        LocalDateTime fechaAtencion
) {}
