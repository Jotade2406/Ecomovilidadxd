package com.solveria.core.shared.exceptions;

import java.util.Map;

public class DomainException extends SolverException {

    public DomainException(String code, String message) {
        super(code, message);
    }

    public DomainException(String code, String message, Map<String, Object> args) {
        super(code, message, args);
    }
}
