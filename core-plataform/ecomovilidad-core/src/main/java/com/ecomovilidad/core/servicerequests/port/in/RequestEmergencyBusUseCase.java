package com.ecomovilidad.core.servicerequests.port.in;

import com.ecomovilidad.core.servicerequests.domain.model.EmergencyRequest;
import com.ecomovilidad.core.shared.domain.TenantId;

import java.util.UUID;

public interface RequestEmergencyBusUseCase {

    record Command(TenantId tenantId, UUID studentId, String location, String description) {}

    EmergencyRequest execute(Command command);
}
