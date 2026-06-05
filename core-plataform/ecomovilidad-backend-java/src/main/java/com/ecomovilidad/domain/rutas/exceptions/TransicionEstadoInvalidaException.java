package com.ecomovilidad.domain.rutas.exceptions;

/**
 * Excepción lanzada cuando se intenta una transición de estado inválida.
 */
public final class TransicionEstadoInvalidaException extends DomainException {

    public TransicionEstadoInvalidaException(String estadoActual, String estadoDeseado) {
        super("No se puede transicionar de '" + estadoActual + "' a '" + estadoDeseado + "'.");
    }
}
