package com.ecomovilidad.core.attendance.domain.model;

import com.ecomovilidad.core.attendance.domain.event.AttendanceRegisteredEvent;
import com.ecomovilidad.core.attendance.domain.vo.AttendanceId;
import com.ecomovilidad.core.attendance.domain.vo.AttendanceType;
import com.ecomovilidad.core.shared.domain.AggregateRoot;
import com.ecomovilidad.core.shared.domain.TenantId;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

/**
 * Aggregate Root: Registro de Asistencia QR.
 *
 * <p>Invariantes:
 * <ul>
 *   <li>El código QR escaneado no puede estar vacío.</li>
 *   <li>Un registro es inmutable una vez creado — no se actualiza, se crea uno nuevo.</li>
 * </ul>
 */
public class AttendanceRecord extends AggregateRoot<AttendanceId> {

    private final UUID studentId;
    private final UUID tripId;
    private final UUID driverId;
    private final AttendanceType type;
    private final String qrCode;
    private final Instant registeredAt;

    private AttendanceRecord(AttendanceId id, TenantId tenantId,
                              UUID studentId, UUID tripId, UUID driverId,
                              AttendanceType type, String qrCode) {
        super(id, tenantId);
        this.studentId = studentId;
        this.tripId = tripId;
        this.driverId = driverId;
        this.type = type;
        this.qrCode = qrCode;
        this.registeredAt = Instant.now();
    }

    // ── Factory Method ───────────────────────────────────────────────────

    public static AttendanceRecord register(TenantId tenantId, UUID studentId,
                                             UUID tripId, UUID driverId,
                                             AttendanceType type, String qrCode) {
        Objects.requireNonNull(tenantId, "TenantId es requerido");
        Objects.requireNonNull(studentId, "StudentId es requerido");
        Objects.requireNonNull(tripId, "TripId es requerido");
        Objects.requireNonNull(driverId, "DriverId es requerido");
        Objects.requireNonNull(type, "AttendanceType es requerido");
        if (qrCode == null || qrCode.isBlank())
            throw new IllegalArgumentException("El código QR no puede estar vacío");

        var id = AttendanceId.newId();
        var record = new AttendanceRecord(id, tenantId, studentId, tripId, driverId, type, qrCode);
        record.registerEvent(new AttendanceRegisteredEvent(tenantId, id, studentId, tripId, type));
        return record;
    }

    /** Reconstituye desde persistencia (sin lanzar eventos). */
    public static AttendanceRecord reconstitute(AttendanceId id, TenantId tenantId,
                                                 UUID studentId, UUID tripId, UUID driverId,
                                                 AttendanceType type, String qrCode) {
        return new AttendanceRecord(id, tenantId, studentId, tripId, driverId, type, qrCode);
    }

    // ── Getters ──────────────────────────────────────────────────────────

    public UUID getStudentId() { return studentId; }
    public UUID getTripId() { return tripId; }
    public UUID getDriverId() { return driverId; }
    public AttendanceType getType() { return type; }
    public String getQrCode() { return qrCode; }
    public Instant getRegisteredAt() { return registeredAt; }
}
