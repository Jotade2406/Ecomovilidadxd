package com.ecomovilidad.domain.viajes.exceptions;

import java.util.UUID;

/**
 * Se lanza cuando se intenta iniciar un viaje que ya está en curso.
 */
public final class ViajeYaIniciadoException extends IllegalStateException {

    public ViajeYaIniciadoException(UUID viajeId) {
        super("El viaje '" + viajeId + "' ya fue iniciado previamente.");
    }
}
