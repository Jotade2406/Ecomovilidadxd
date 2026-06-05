package com.ecomovilidad.core.attendance.domain.vo;

import java.util.Objects;
import java.util.UUID;

public record AttendanceId(UUID value) {

    public AttendanceId {
        Objects.requireNonNull(value, "AttendanceId no puede ser nulo");
    }

    public static AttendanceId newId() { return new AttendanceId(UUID.randomUUID()); }
    public static AttendanceId of(UUID uuid) { return new AttendanceId(uuid); }
    public static AttendanceId of(String uuid) { return new AttendanceId(UUID.fromString(uuid)); }

    @Override
    public String toString() { return value.toString(); }
}
