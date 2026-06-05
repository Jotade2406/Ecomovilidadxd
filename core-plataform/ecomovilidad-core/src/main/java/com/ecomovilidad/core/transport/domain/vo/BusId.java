package com.ecomovilidad.core.transport.domain.vo;

import java.util.Objects;
import java.util.UUID;

public record BusId(UUID value) {
    public BusId { Objects.requireNonNull(value, "BusId no puede ser nulo"); }
    public static BusId of(UUID uuid) { return new BusId(uuid); }
    public static BusId of(String uuid) { return new BusId(UUID.fromString(uuid)); }
    @Override public String toString() { return value.toString(); }
}
