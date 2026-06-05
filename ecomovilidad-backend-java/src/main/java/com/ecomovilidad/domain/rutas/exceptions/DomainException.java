package com.ecomovilidad.domain.rutas.exceptions;

/**
 * Excepción base para errores de regla de negocio del dominio.
 */
public abstract class DomainException extends RuntimeException {

    protected DomainException(String message) {
        super(message);
    }
}
