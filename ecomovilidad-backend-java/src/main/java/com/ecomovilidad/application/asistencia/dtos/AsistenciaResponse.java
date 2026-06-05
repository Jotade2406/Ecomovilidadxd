package com.ecomovilidad.application.asistencia.dtos;

import com.ecomovilidad.domain.asistencia.TipoAsistencia;
import java.time.LocalDateTime;
import java.util.UUID;

public record AsistenciaResponse(
        UUID id,
        UUID estudianteId,
        String nombreEstudiante,
        UUID viajeId,
        UUID conductorId,
        TipoAsistencia tipo,
        LocalDateTime horaRegistro,
        String codigoQrEscaneado
) {}
