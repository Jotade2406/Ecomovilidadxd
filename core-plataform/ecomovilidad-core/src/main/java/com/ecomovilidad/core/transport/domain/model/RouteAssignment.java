package com.ecomovilidad.core.transport.domain.model;

import com.ecomovilidad.core.shared.domain.TenantId;
import com.ecomovilidad.core.transport.domain.vo.AssignmentId;
import com.ecomovilidad.core.transport.domain.vo.BusCapacity;
import com.ecomovilidad.core.transport.domain.vo.BusId;
import com.ecomovilidad.core.transport.domain.vo.DriverId;
import com.ecomovilidad.core.transport.domain.vo.RouteId;

import java.time.Instant;
import java.util.Objects;

/**
 * Entidad de dominio: Asignación de Ruta–Bus–Conductor.
 *
 * <p>Representa el contrato operativo que habilita el inicio de viajes.
 * Solo puede existir una asignación ACTIVA por ruta a la vez
 * (invariante que el repositorio y el use case deben garantizar).
 */
public class RouteAssignment {

    private final AssignmentId id;
    private final TenantId tenantId;
    private final RouteId routeId;
    private final BusId busId;
    private final DriverId driverId;
    private final BusCapacity busCapacity;
    private boolean active;
    private final Instant assignedAt;
    private Instant revokedAt;

    private RouteAssignment(AssignmentId id, TenantId tenantId, RouteId routeId,
                            BusId busId, DriverId driverId, BusCapacity busCapacity) {
        this.id = Objects.requireNonNull(id);
        this.tenantId = Objects.requireNonNull(tenantId);
        this.routeId = Objects.requireNonNull(routeId);
        this.busId = Objects.requireNonNull(busId);
        this.driverId = Objects.requireNonNull(driverId);
        this.busCapacity = Objects.requireNonNull(busCapacity);
        this.active = true;
        this.assignedAt = Instant.now();
    }

    // ── Factory Method ───────────────────────────────────────────────────

    public static RouteAssignment create(TenantId tenantId, RouteId routeId,
                                         BusId busId, DriverId driverId,
                                         BusCapacity busCapacity) {
        return new RouteAssignment(AssignmentId.newId(), tenantId,
                routeId, busId, driverId, busCapacity);
    }

    public static RouteAssignment reconstitute(AssignmentId id, TenantId tenantId,
                                               RouteId routeId, BusId busId, DriverId driverId,
                                               BusCapacity busCapacity, boolean active,
                                               Instant assignedAt, Instant revokedAt) {
        var a = new RouteAssignment(id, tenantId, routeId, busId, driverId, busCapacity);
        a.active = active;
        a.revokedAt = revokedAt;
        return a;
    }

    // ── Comandos de dominio ──────────────────────────────────────────────

    public void revoke() {
        if (!active)
            throw new IllegalStateException("La asignación ya está inactiva");
        this.active = false;
        this.revokedAt = Instant.now();
    }

    // ── Getters ──────────────────────────────────────────────────────────

    public AssignmentId getId() { return id; }
    public TenantId getTenantId() { return tenantId; }
    public RouteId getRouteId() { return routeId; }
    public BusId getBusId() { return busId; }
    public DriverId getDriverId() { return driverId; }
    public BusCapacity getBusCapacity() { return busCapacity; }
    public boolean isActive() { return active; }
    public Instant getAssignedAt() { return assignedAt; }
    public Instant getRevokedAt() { return revokedAt; }
}
