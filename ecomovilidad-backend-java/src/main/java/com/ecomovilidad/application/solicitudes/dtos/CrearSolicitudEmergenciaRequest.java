package com.ecomovilidad.application.solicitudes.dtos;

import java.util.UUID;

public record CrearSolicitudEmergenciaRequest(
        UUID estudianteId,
        String descripcion,
        String ubicacion
) {}
