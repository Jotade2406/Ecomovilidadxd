package com.ecomovilidad.core.transport.domain.vo;

import java.util.Objects;
import java.util.UUID;

public record TripId(UUID value) {
    public TripId { Objects.requireNonNull(value, "TripId no puede ser nulo"); }
    public static TripId newId() { return new TripId(UUID.randomUUID()); }
    public static TripId of(UUID uuid) { return new TripId(uuid); }
    public static TripId of(String uuid) { return new TripId(UUID.fromString(uuid)); }
    @Override public String toString() { return value.toString(); }
}
