package com.solveria.core.shared.exceptions;

import java.util.Map;

public abstract class SolverException extends RuntimeException {

    private final String code;
    private final Map<String, Object> args;

    protected SolverException(String code, String message) {
        super(message);
        this.code = code;
        this.args = Map.of();
    }

    protected SolverException(String code, String message, Map<String, Object> args) {
        super(message);
        this.code = code;
        this.args = args != null ? args : Map.of();
    }

    protected SolverException(String code, String message, Throwable cause) {
        super(message, cause);
        this.code = code;
        this.args = Map.of();
    }

    public String getCode() {
        return code;
    }

    public Map<String, Object> getArgs() {
        return args;
    }
}
