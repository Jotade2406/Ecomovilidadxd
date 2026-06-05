package com.ecomovilidad.domain.viajes.exceptions;

/**
 * Se lanza cuando se intenta cerrar/completar un viaje que no está en curso.
 */
public final class ViajeNoEnCursoException extends IllegalStateException {

    public ViajeNoEnCursoException() {
        super("El viaje no está en curso y no puede ser cerrado.");
    }

    public ViajeNoEnCursoException(String detalle) {
        super("El viaje no está en curso: " + detalle);
    }
}
