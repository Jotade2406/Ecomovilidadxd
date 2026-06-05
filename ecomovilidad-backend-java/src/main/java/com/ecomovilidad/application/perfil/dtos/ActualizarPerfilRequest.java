package com.ecomovilidad.application.perfil.dtos;

public record ActualizarPerfilRequest(
        String nombre,
        String telefono,
        String avatarUrl,
        boolean preferenciaNotificaciones,
        String tema
) {}
