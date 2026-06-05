package com.ecomovilidad.application.perfil.dtos;

import java.time.LocalDateTime;
import java.util.UUID;

public record PerfilResponse(
        UUID id,
        UUID tenantId,
        String email,
        String nombre,
        String telefono,
        String avatarUrl,
        boolean preferenciaNotificaciones,
        String tema,
        LocalDateTime fechaCreacion,
        LocalDateTime fechaActualizacion
) {}
