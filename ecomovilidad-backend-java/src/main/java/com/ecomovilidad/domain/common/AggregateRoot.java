package com.ecomovilidad.domain.common;

import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.Transient;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

/**
 * Marca una entidad como raíz de un agregado.
 * Centraliza los eventos de dominio del agregado.
 * Equivalente a AggregateRoot.cs en .NET.
 */
@MappedSuperclass
public abstract class AggregateRoot extends Entity {

    @Transient
    private final List<DomainEvent> domainEvents = new ArrayList<>();

    protected AggregateRoot() {
        super();
    }

    protected AggregateRoot(UUID id) {
        super(id);
    }

    public List<DomainEvent> getDomainEvents() {
        return Collections.unmodifiableList(domainEvents);
    }

    protected void raiseDomainEvent(DomainEvent domainEvent) {
        domainEvents.add(domainEvent);
    }

    public void clearDomainEvents() {
        domainEvents.clear();
    }
}
