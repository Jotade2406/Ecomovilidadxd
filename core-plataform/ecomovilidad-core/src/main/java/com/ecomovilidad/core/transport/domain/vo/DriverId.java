package com.ecomovilidad.core.transport.domain.vo;

import java.util.Objects;
import java.util.UUID;

public record DriverId(UUID value) {
    public DriverId { Objects.requireNonNull(value, "DriverId no puede ser nulo"); }
    public static DriverId of(UUID uuid) { return new DriverId(uuid); }
    public static DriverId of(String uuid) { return new DriverId(UUID.fromString(uuid)); }
    @Override public String toString() { return value.toString(); }
}
