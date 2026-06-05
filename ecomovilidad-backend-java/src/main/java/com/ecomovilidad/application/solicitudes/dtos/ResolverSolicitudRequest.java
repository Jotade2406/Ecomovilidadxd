package com.ecomovilidad.application.solicitudes.dtos;

import com.ecomovilidad.domain.solicitudes.EstadoSolicitud;

public record ResolverSolicitudRequest(
        EstadoSolicitud estado,
        String notas
) {}
