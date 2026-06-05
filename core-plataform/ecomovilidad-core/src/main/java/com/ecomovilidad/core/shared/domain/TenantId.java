package com.ecomovilidad.core.shared.domain;

import java.util.Objects;
import java.util.UUID;

/**
 * Value Object que representa el identificador de un tenant (Colegio o Empresa).
 * Ciudadano de primera clase en el dominio: ninguna operación es válida sin él.
 * Inmutable y comparable por valor.
 */
public final class TenantId {

    private final UUID value;

    private TenantId(UUID value) {
        this.value = Objects.requireNonNull(value, "TenantId no puede ser nulo");
    }

    public static TenantId of(UUID uuid) {
        return new TenantId(uuid);
    }

    public static TenantId of(String uuid) {
        try {
            return new TenantId(UUID.fromString(uuid));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("TenantId inválido: '" + uuid + "'", e);
        }
    }

    public UUID value() {
        return value;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof TenantId other)) return false;
        return Objects.equals(value, other.value);
    }

    @Override
    public int hashCode() {
        return Objects.hash(value);
    }

    @Override
    public String toString() {
        return "TenantId[" + value + "]";
    }
}
