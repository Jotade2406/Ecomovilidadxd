package com.solveria.core.shared.exceptions;

import java.util.Map;

public class EntityNotFoundException extends SolverException {

    public EntityNotFoundException(String code, String message) {
        super(code, message);
    }

    public EntityNotFoundException(String code, String message, Map<String, Object> args) {
        super(code, message, args);
    }
}
