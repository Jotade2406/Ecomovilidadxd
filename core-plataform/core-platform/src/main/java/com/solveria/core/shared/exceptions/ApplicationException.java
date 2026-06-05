package com.solveria.core.shared.exceptions;

import java.util.Map;

public class ApplicationException extends SolverException {

    public ApplicationException(String code, String message) {
        super(code, message);
    }

    public ApplicationException(String code, String message, Map<String, Object> args) {
        super(code, message, args);
    }
}
