package com.ecomovilidad.core.transport.domain.model;

import com.ecomovilidad.core.shared.domain.AggregateRoot;
import com.ecomovilidad.core.shared.domain.TenantId;
import com.ecomovilidad.core.transport.domain.event.RouteCreatedEvent;
import com.ecomovilidad.core.transport.domain.event.RouteStatusChangedEvent;
import com.ecomovilidad.core.transport.domain.event.RouteWaypointsUpdatedEvent;
import com.ecomovilidad.core.transport.domain.vo.Coordinate;
import com.ecomovilidad.core.transport.domain.vo.RouteId;
import com.ecomovilidad.core.transport.domain.vo.RouteStatus;
import com.ecomovilidad.core.transport.domain.vo.RouteWaypoint;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

/**
 * Aggregate Root: Ruta de transporte.
 *
 * <p>Invariantes del dominio:
 * <ul>
 *   <li>El nombre no puede estar vacío ni superar 120 caracteres.</li>
 *   <li>Origen y destino son obligatorios y deben ser distintos.</li>
 *   <li>El color es un código hexadecimal válido (#RRGGBB).</li>
 *   <li>Los waypoints deben ordenarse sin duplicados de orden.</li>
 *   <li>Las transiciones de estado siguen la máquina definida en {@link RouteStatus}.</li>
 *   <li>Una ruta FINALIZADA no puede ser modificada.</li>
 * </ul>
 *
 * <p>Toda la lógica de negocio vive aquí — los servicios de aplicación solo
 * coordinan puertos, nunca toman decisiones de dominio.
 */
public class Route extends AggregateRoot<RouteId> {

    private static final int MAX_NAME_LENGTH = 120;
    private static final String HEX_COLOR_PATTERN = "^#[0-9A-Fa-f]{6}$";

    private String name;
    private Coordinate origin;
    private Coordinate destination;
    private RouteStatus status;
    private String colorHex;
    private List<RouteWaypoint> waypoints;
    private double totalDistanceKm;
    private Instant createdAt;
    private Instant updatedAt;

    // ── Constructor privado: solo la factory puede crear instancias ─────
    private Route(RouteId id, TenantId tenantId, String name,
                  Coordinate origin, Coordinate destination, String colorHex) {
        super(id, tenantId);
        this.name = name;
        this.origin = origin;
        this.destination = destination;
        this.colorHex = colorHex;
        this.status = RouteStatus.BORRADOR;
        this.waypoints = new ArrayList<>();
        this.totalDistanceKm = origin.distanceKmTo(destination);
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
    }

    // ── Factory Method ───────────────────────────────────────────────────

    /**
     * Crea una nueva ruta, valida los invariantes y publica {@link RouteCreatedEvent}.
     */
    public static Route create(TenantId tenantId, String name,
                               Coordinate origin, Coordinate destination, String colorHex) {
        validateName(name);
        Objects.requireNonNull(origin, "El origen de la ruta es requerido");
        Objects.requireNonNull(destination, "El destino de la ruta es requerido");
        validateColor(colorHex);

        if (origin.equals(destination))
            throw new IllegalArgumentException("El origen y el destino no pueden ser el mismo punto");

        var route = new Route(RouteId.newId(), tenantId, name, origin, destination, colorHex);
        route.registerEvent(new RouteCreatedEvent(tenantId, route.getId(), name));
        return route;
    }

    /** Reconstituye una ruta desde persistencia (sin lanzar eventos). */
    public static Route reconstitute(RouteId id, TenantId tenantId, String name,
                                     Coordinate origin, Coordinate destination,
                                     RouteStatus status, String colorHex,
                                     List<RouteWaypoint> waypoints, Instant createdAt) {
        var route = new Route(id, tenantId, name, origin, destination, colorHex);
        route.status = status;
        route.setWaypointsInternal(waypoints);
        route.createdAt = createdAt;
        return route;
    }

    // ── Comandos de dominio ──────────────────────────────────────────────

    public void activate() {
        guardNotFinalized("activar");
        var previous = this.status;
        this.status = this.status.transitionTo(RouteStatus.ACTIVA);
        this.updatedAt = Instant.now();
        registerEvent(new RouteStatusChangedEvent(getTenantId(), getId(), previous, RouteStatus.ACTIVA));
    }

    public void suspend() {
        guardNotFinalized("suspender");
        var previous = this.status;
        this.status = this.status.transitionTo(RouteStatus.SUSPENDIDA);
        this.updatedAt = Instant.now();
        registerEvent(new RouteStatusChangedEvent(getTenantId(), getId(), previous, RouteStatus.SUSPENDIDA));
    }

    public void finalize_() {
        var previous = this.status;
        this.status = this.status.transitionTo(RouteStatus.FINALIZADA);
        this.updatedAt = Instant.now();
        registerEvent(new RouteStatusChangedEvent(getTenantId(), getId(), previous, RouteStatus.FINALIZADA));
    }

    /**
     * Reemplaza los waypoints intermedios de la ruta (puntos OSRM).
     * Recalcula la distancia total usando la cadena de coordenadas completa.
     */
    public void replaceWaypoints(List<RouteWaypoint> newWaypoints) {
        guardNotFinalized("actualizar waypoints de");
        Objects.requireNonNull(newWaypoints, "La lista de waypoints no puede ser nula");
        validateWaypointOrders(newWaypoints);
        setWaypointsInternal(newWaypoints);
        recalculateDistance();
        this.updatedAt = Instant.now();
        registerEvent(new RouteWaypointsUpdatedEvent(getTenantId(), getId(), newWaypoints.size()));
    }

    // ── Queries de dominio ───────────────────────────────────────────────

    public boolean isOperational() {
        return status.isOperational();
    }

    public double getTotalDistanceKm() {
        return totalDistanceKm;
    }

    // ── Getters ──────────────────────────────────────────────────────────

    public String getName() { return name; }
    public Coordinate getOrigin() { return origin; }
    public Coordinate getDestination() { return destination; }
    public RouteStatus getStatus() { return status; }
    public String getColorHex() { return colorHex; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public List<RouteWaypoint> getWaypoints() { return Collections.unmodifiableList(waypoints); }

    // ── Helpers privados ─────────────────────────────────────────────────

    private void guardNotFinalized(String operation) {
        if (status == RouteStatus.FINALIZADA)
            throw new IllegalStateException(
                "No se puede " + operation + " una ruta que está FINALIZADA");
    }

    private void setWaypointsInternal(List<RouteWaypoint> points) {
        this.waypoints = new ArrayList<>(points);
        this.waypoints.sort((a, b) -> Integer.compare(a.getOrder(), b.getOrder()));
    }

    private void recalculateDistance() {
        if (waypoints.isEmpty()) {
            this.totalDistanceKm = origin.distanceKmTo(destination);
            return;
        }
        double total = origin.distanceKmTo(waypoints.get(0).getCoordinate());
        for (int i = 0; i < waypoints.size() - 1; i++) {
            total += waypoints.get(i).getCoordinate()
                              .distanceKmTo(waypoints.get(i + 1).getCoordinate());
        }
        total += waypoints.get(waypoints.size() - 1).getCoordinate()
                          .distanceKmTo(destination);
        this.totalDistanceKm = Math.round(total * 100.0) / 100.0;
    }

    private static void validateName(String name) {
        if (name == null || name.isBlank())
            throw new IllegalArgumentException("El nombre de la ruta es requerido");
        if (name.length() > MAX_NAME_LENGTH)
            throw new IllegalArgumentException(
                "El nombre no puede superar " + MAX_NAME_LENGTH + " caracteres");
    }

    private static void validateColor(String colorHex) {
        if (colorHex == null || !colorHex.matches(HEX_COLOR_PATTERN))
            throw new IllegalArgumentException(
                "El color debe ser un código hexadecimal válido (#RRGGBB): " + colorHex);
    }

    private static void validateWaypointOrders(List<RouteWaypoint> waypoints) {
        long distinctOrders = waypoints.stream().map(RouteWaypoint::getOrder).distinct().count();
        if (distinctOrders != waypoints.size())
            throw new IllegalArgumentException(
                "Los waypoints no pueden tener órdenes duplicados");
    }
}
