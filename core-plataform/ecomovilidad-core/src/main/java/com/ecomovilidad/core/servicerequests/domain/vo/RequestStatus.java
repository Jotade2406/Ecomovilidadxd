package com.ecomovilidad.core.servicerequests.domain.vo;

import java.util.Set;

public enum RequestStatus {
    PENDIENTE,
    APROBADA,
    RECHAZADA,
    CANCELADA;

    public RequestStatus transitionTo(RequestStatus next) {
        if (!allowedTransitions().contains(next))
            throw new IllegalStateException(
                "Transición inválida de solicitud: " + this + " → " + next);
        return next;
    }

    private Set<RequestStatus> allowedTransitions() {
        return switch (this) {
            case PENDIENTE -> Set.of(APROBADA, RECHAZADA, CANCELADA);
            case APROBADA, RECHAZADA, CANCELADA -> Set.of();
        };
    }

    public static RequestStatus fromLegacy(String value) {
        return valueOf(value.toUpperCase());
    }
}
