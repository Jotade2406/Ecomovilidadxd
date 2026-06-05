package com.ecomovilidad.core.attendance.port.in;

import com.ecomovilidad.core.attendance.domain.model.AttendanceRecord;
import com.ecomovilidad.core.shared.domain.TenantId;

import java.util.List;
import java.util.UUID;

public interface QueryAttendanceUseCase {

    List<AttendanceRecord> byTrip(UUID tripId, TenantId tenantId);

    List<AttendanceRecord> byStudent(UUID studentId, TenantId tenantId);
}
