package com.ecomovilidad.core.shared.domain;

import java.time.Instant;
import java.util.UUID;

/**
 * Clase base para todos los Domain Events del sistema.
 * Los eventos son inmutables y narran algo que ya ocurrió en el dominio.
 * Preparados para ser consumidos por el ai-service vía mensajería asíncrona.
 */
public abstract class DomainEvent {

    private final String eventId;
    private final String eventType;
    private final TenantId tenantId;
    private final Instant occurredOn;

    protected DomainEvent(String eventType, TenantId tenantId) {
        this.eventId = UUID.randomUUID().toString();
        this.eventType = eventType;
        this.tenantId = tenantId;
        this.occurredOn = Instant.now();
    }

    public String getEventId() { return eventId; }
    public String getEventType() { return eventType; }
    public TenantId getTenantId() { return tenantId; }
    public Instant getOccurredOn() { return occurredOn; }
}
