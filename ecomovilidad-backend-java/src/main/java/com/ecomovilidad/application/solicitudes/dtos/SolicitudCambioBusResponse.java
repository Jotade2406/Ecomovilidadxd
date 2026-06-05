package com.ecomovilidad.application.solicitudes.dtos;

import com.ecomovilidad.domain.solicitudes.EstadoSolicitud;
import java.time.LocalDateTime;
import java.util.UUID;

public record SolicitudCambioBusResponse(
        String id,
        UUID tenantId,
        UUID estudianteId,
        UUID busActualId,
        UUID busDeseadoId,
        String motivo,
        EstadoSolicitud estado,
        LocalDateTime fechaSolicitud,
        LocalDateTime fechaResolucion,
        String notas
) {}
