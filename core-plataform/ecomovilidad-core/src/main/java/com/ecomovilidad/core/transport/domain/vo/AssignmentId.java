package com.ecomovilidad.core.transport.domain.vo;

import java.util.Objects;
import java.util.UUID;

public record AssignmentId(UUID value) {
    public AssignmentId { Objects.requireNonNull(value, "AssignmentId no puede ser nulo"); }
    public static AssignmentId newId() { return new AssignmentId(UUID.randomUUID()); }
    public static AssignmentId of(UUID uuid) { return new AssignmentId(uuid); }
    public static AssignmentId of(String uuid) { return new AssignmentId(UUID.fromString(uuid)); }
    @Override public String toString() { return value.toString(); }
}
