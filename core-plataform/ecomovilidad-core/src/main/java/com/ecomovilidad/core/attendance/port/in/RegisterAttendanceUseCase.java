package com.ecomovilidad.core.attendance.port.in;

import com.ecomovilidad.core.attendance.domain.model.AttendanceRecord;
import com.ecomovilidad.core.attendance.domain.vo.AttendanceType;
import com.ecomovilidad.core.shared.domain.TenantId;

import java.util.UUID;

public interface RegisterAttendanceUseCase {

    record Command(TenantId tenantId, UUID studentId, UUID tripId,
                   UUID driverId, AttendanceType type, String qrCode) {}

    /** Idempotente: devuelve el registro existente si ya fue escaneado. */
    AttendanceRecord execute(Command command);
}
