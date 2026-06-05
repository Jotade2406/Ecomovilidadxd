package com.ecomovilidad.core.servicerequests.port.in;

import com.ecomovilidad.core.servicerequests.domain.model.BusChangeRequest;
import com.ecomovilidad.core.shared.domain.TenantId;

import java.util.UUID;

public interface RequestBusChangeUseCase {

    record Command(TenantId tenantId, UUID studentId, String reason) {}

    BusChangeRequest execute(Command command);
}
