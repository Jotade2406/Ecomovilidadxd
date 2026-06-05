package com.ecomovilidad.core.transport.port.in;

import com.ecomovilidad.core.shared.domain.TenantId;
import com.ecomovilidad.core.transport.domain.model.Trip;
import com.ecomovilidad.core.transport.domain.vo.TripId;

import java.util.UUID;

public interface BoardStudentUseCase {

    record Command(TenantId tenantId, TripId tripId, UUID studentId) {}

    Trip execute(Command command);
}
