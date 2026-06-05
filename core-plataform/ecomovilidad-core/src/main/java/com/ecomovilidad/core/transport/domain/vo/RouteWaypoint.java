package com.ecomovilidad.core.transport.domain.vo;

import java.util.Objects;

/**
 * Punto intermedio de una ruta con orden explícito.
 * Value Object inmutable que compone la geometría de la ruta.
 */
public final class RouteWaypoint {

    private final Coordinate coordinate;
    private final int order;

    private RouteWaypoint(Coordinate coordinate, int order) {
        this.coordinate = Objects.requireNonNull(coordinate, "La coordenada del waypoint es requerida");
        if (order < 0)
            throw new IllegalArgumentException("El orden del waypoint no puede ser negativo: " + order);
        this.order = order;
    }

    public static RouteWaypoint of(Coordinate coordinate, int order) {
        return new RouteWaypoint(coordinate, order);
    }

    public static RouteWaypoint of(double latitude, double longitude, int order) {
        return new RouteWaypoint(Coordinate.of(latitude, longitude), order);
    }

    public Coordinate getCoordinate() { return coordinate; }
    public int getOrder() { return order; }

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof RouteWaypoint w)) return false;
        return order == w.order && Objects.equals(coordinate, w.coordinate);
    }

    @Override
    public int hashCode() { return Objects.hash(coordinate, order); }

    @Override
    public String toString() { return "Waypoint[order=" + order + ", " + coordinate + "]"; }
}
