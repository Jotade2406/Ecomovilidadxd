package com.ecomovilidad.core.transport.domain.vo;

import java.util.Objects;
import java.util.UUID;

/** Identificador tipado de una Ruta. Evita errores de pasar un TripId donde se espera un RouteId. */
public record RouteId(UUID value) {
    public RouteId { Objects.requireNonNull(value, "RouteId no puede ser nulo"); }
    public static RouteId newId() { return new RouteId(UUID.randomUUID()); }
    public static RouteId of(UUID uuid) { return new RouteId(uuid); }
    public static RouteId of(String uuid) { return new RouteId(UUID.fromString(uuid)); }
    @Override public String toString() { return value.toString(); }
}
