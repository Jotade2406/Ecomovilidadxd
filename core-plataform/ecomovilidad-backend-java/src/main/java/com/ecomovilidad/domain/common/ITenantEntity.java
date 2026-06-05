package com.ecomovilidad.domain.common;

import java.util.UUID;

/**
 * Interface para implementar el aislamiento de datos por inquilino (Multi-tenant).
 * Todas las entidades de negocio deben implementar esta interfaz.
 */
public interface ITenantEntity {
    UUID getTenantId();
    void setTenantId(UUID tenantId);
}
