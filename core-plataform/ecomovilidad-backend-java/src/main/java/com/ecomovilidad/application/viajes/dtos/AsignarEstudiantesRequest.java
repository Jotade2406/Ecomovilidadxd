package com.ecomovilidad.application.viajes.dtos;

import java.util.List;
import java.util.UUID;

/**
 * Request para asignar estudiantes a un viaje en curso.
 */
public record AsignarEstudiantesRequest(
        List<UUID> estudianteIds
) {}
