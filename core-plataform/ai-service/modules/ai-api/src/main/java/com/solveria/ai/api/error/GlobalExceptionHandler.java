package com.solveria.ai.api.error;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/** Global REST exception handler. */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        var details =
                ex.getBindingResult().getFieldErrors().stream()
                        .map(e -> e.getField() + ": " + e.getDefaultMessage())
                        .collect(Collectors.toList());
        var body =
                new ApiErrorResponse(
                        "VALIDATION_ERROR", "Validation failed", null, Instant.now(), details);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiErrorResponse> handleIllegalArgument(IllegalArgumentException ex) {
        var body =
                new ApiErrorResponse(
                        "BAD_REQUEST", ex.getMessage(), null, Instant.now(), List.of());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }
}
