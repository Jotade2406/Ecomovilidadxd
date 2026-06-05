package com.ecomovilidad.domain.common;

import java.time.LocalDateTime;

/**
 * Clase base para eventos de dominio.
 * Equivalente a DomainEvent.cs (MediatR INotification en .NET).
 * En Spring se usa ApplicationEventPublisher para dispatch.
 */
public abstract class DomainEvent {

    private final LocalDateTime occurredOn;

    protected DomainEvent() {
        this.occurredOn = LocalDateTime.now();
    }

    public LocalDateTime getOccurredOn() {
        return occurredOn;
    }
}
