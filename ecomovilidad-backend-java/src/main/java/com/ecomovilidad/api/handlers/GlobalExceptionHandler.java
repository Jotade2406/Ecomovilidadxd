package com.ecomovilidad.api.handlers;

import com.ecomovilidad.domain.rutas.exceptions.DomainException;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

/**
 * Middleware global que captura excepciones y las traduce a respuestas HTTP apropiadas.
 * Equivalente a GlobalExceptionMiddleware.cs en .NET.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(DomainException.class)
    public ResponseEntity<Map<String, Object>> handleDomainException(DomainException ex) {
        log.warn("Excepción de dominio [409]: {}", ex.getMessage());
        return buildResponse(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleEntityNotFound(EntityNotFoundException ex) {
        log.warn("Entidad no encontrada [404]: {}", ex.getMessage());
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleBadRequest(IllegalArgumentException ex) {
        log.warn("Argumento inválido [400]: {}", ex.getMessage());
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> handleConflict(IllegalStateException ex) {
        log.warn("Estado inválido [409]: {}", ex.getMessage());
        return buildResponse(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex) {
        log.warn("Acceso denegado [403]: {}", ex.getMessage());
        return buildResponse(HttpStatus.FORBIDDEN, ex.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        log.error("Error no controlado [500]: {}", ex.getMessage(), ex);
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Ocurrió un error interno en el servidor.");
    }

    private ResponseEntity<Map<String, Object>> buildResponse(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(Map.of(
                "status", status.value(),
                "error", status.getReasonPhrase(),
                "message", message
        ));
    }
}
