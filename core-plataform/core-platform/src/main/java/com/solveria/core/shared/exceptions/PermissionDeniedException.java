package com.solveria.core.shared.exceptions;

import java.util.Map;

public class PermissionDeniedException extends SolverException {

    public PermissionDeniedException(String code, String message) {
        super(code, message);
    }

    public PermissionDeniedException(String code, String message, Map<String, Object> args) {
        super(code, message, args);
    }
}
