package com.ecomovilidad.application.viajes.dtos;

import java.util.UUID;

/**
 * Request para iniciar un viaje operativo.
 */
public record IniciarViajeRequest(
        UUID rutaId,
        UUID vehiculoId,
        UUID conductorId
) {}
