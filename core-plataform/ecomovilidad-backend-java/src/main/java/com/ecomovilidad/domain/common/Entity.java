package com.ecomovilidad.domain.common;

import jakarta.persistence.*;
import java.util.Objects;
import java.util.UUID;

/**
 * Clase base para todas las entidades del dominio.
 * Provee identidad (UUID) y comparación por Id.
 * Equivalente a Entity.cs en .NET.
 */
@MappedSuperclass
public abstract class Entity implements ITenantEntity {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    protected Entity() {
        this.id = UUID.randomUUID();
    }

    protected Entity(UUID id) {
        this.id = id;
    }

    public UUID getId() {
        return id;
    }

    protected void setId(UUID id) {
        this.id = id;
    }

    @Override
    public UUID getTenantId() {
        return tenantId;
    }

    @Override
    public void setTenantId(UUID tenantId) {
        this.tenantId = tenantId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Entity entity = (Entity) o;
        return Objects.equals(id, entity.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
