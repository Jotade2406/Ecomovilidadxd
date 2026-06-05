package com.ecomovilidad.application.solicitudes.dtos;

import java.util.UUID;

public record CrearSolicitudCambioBusRequest(
        UUID estudianteId,
        UUID busActualId,
        UUID busDeseadoId,
        String motivo
) {}
