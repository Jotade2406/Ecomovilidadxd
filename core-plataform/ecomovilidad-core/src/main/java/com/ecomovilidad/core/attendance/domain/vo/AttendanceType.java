package com.ecomovilidad.core.attendance.domain.vo;

public enum AttendanceType {
    IDA,
    VUELTA;

    /** Mapea desde el enum legacy del backend. */
    public static AttendanceType fromLegacy(String value) {
        return valueOf(value.toUpperCase());
    }
}
