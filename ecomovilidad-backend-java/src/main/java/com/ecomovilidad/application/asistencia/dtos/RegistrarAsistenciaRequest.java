package com.ecomovilidad.application.asistencia.dtos;

import com.ecomovilidad.domain.asistencia.TipoAsistencia;
import java.util.UUID;

public record RegistrarAsistenciaRequest(
        UUID estudianteId,
        UUID viajeId,
        UUID conductorId,
        TipoAsistencia tipo,
        String codigoQrEscaneado
) {}
