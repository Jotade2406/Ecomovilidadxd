package com.ecomovilidad.core.shared.domain;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

/**
 * Base de todos los Aggregate Roots del sistema.
 * Gestiona identidad, multi-tenancy y la colección de Domain Events pendientes.
 *
 * <p>El ID es tipado (genérico) para forzar identidades semánticamente correctas
 * en cada agregado (RouteId, TripId, etc.) en lugar de UUIDs crudos.
 */
public abstract class AggregateRoot<ID> {

    private final ID id;
    private final TenantId tenantId;
    private final List<DomainEvent> domainEvents = new ArrayList<>();

    protected AggregateRoot(ID id, TenantId tenantId) {
        this.id = Objects.requireNonNull(id, "El ID del agregado no puede ser nulo");
        this.tenantId = Objects.requireNonNull(tenantId, "TenantId es requerido en cualquier agregado");
    }

    public ID getId() { return id; }

    public TenantId getTenantId() { return tenantId; }

    /**
     * Registra un Domain Event para ser publicado luego de la persistencia.
     * Los eventos no se publican aquí: el orquestador del caso de uso es quien
     * llama a {@link #pullDomainEvents()} y los despacha al bus.
     */
    protected void registerEvent(DomainEvent event) {
        Objects.requireNonNull(event, "El DomainEvent no puede ser nulo");
        domainEvents.add(event);
    }

    /**
     * Extrae y limpia los eventos pendientes (patrón pull).
     * Debe ser llamado exactamente una vez, tras persistir el agregado.
     */
    public List<DomainEvent> pullDomainEvents() {
        var snapshot = Collections.unmodifiableList(new ArrayList<>(domainEvents));
        domainEvents.clear();
        return snapshot;
    }

    /** Genera un nuevo UUID para ser usado como ID de agregado. */
    protected static UUID newId() {
        return UUID.randomUUID();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        AggregateRoot<?> that = (AggregateRoot<?>) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
