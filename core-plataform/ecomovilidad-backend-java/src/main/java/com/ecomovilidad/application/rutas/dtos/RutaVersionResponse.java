package com.ecomovilidad.application.rutas.dtos;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO de salida para una versión histórica de una Ruta.
 */
public record RutaVersionResponse(
        UUID id,
        int version,
        String cambioDescripcion,
        String creadoPor,
        LocalDateTime creadoEn,
        String snapshot
) {}
