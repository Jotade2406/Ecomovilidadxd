package com.ecomovilidad.core.attendance.domain.event;

import com.ecomovilidad.core.attendance.domain.vo.AttendanceId;
import com.ecomovilidad.core.attendance.domain.vo.AttendanceType;
import com.ecomovilidad.core.shared.domain.DomainEvent;
import com.ecomovilidad.core.shared.domain.TenantId;

import java.util.UUID;

public final class AttendanceRegisteredEvent extends DomainEvent {

    private final AttendanceId attendanceId;
    private final UUID studentId;
    private final UUID tripId;
    private final AttendanceType type;

    public AttendanceRegisteredEvent(TenantId tenantId, AttendanceId attendanceId,
                                     UUID studentId, UUID tripId, AttendanceType type) {
        super("ATTENDANCE_REGISTERED", tenantId);
        this.attendanceId = attendanceId;
        this.studentId = studentId;
        this.tripId = tripId;
        this.type = type;
    }

    public AttendanceId getAttendanceId() { return attendanceId; }
    public UUID getStudentId() { return studentId; }
    public UUID getTripId() { return tripId; }
    public AttendanceType getType() { return type; }
}
