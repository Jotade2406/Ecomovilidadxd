package com.ecomovilidad.core.shared.exception;

/**
 * Excepción raíz del dominio. Semántica de negocio, no técnica.
 * Las subclases nombran el invariante violado con precisión.
 */
public abstract class DomainException extends RuntimeException {

    private final String errorCode;

    protected DomainException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
