package com.solveria.core.shared.exceptions;

import java.util.Map;

public class BusinessRuleViolationException extends SolverException {

    public BusinessRuleViolationException(String code, String message) {
        super(code, message);
    }

    public BusinessRuleViolationException(String code, String message, Map<String, Object> args) {
        super(code, message, args);
    }
}
