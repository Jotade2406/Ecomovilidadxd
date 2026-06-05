package com.ecomovilidad.core.transport.port.in;

import com.ecomovilidad.core.shared.domain.TenantId;
import com.ecomovilidad.core.transport.domain.model.Trip;
import com.ecomovilidad.core.transport.domain.vo.TripId;

public interface CloseTripUseCase {

    record CompleteCommand(TenantId tenantId, TripId tripId) {}
    record CancelCommand(TenantId tenantId, TripId tripId) {}

    Trip complete(CompleteCommand command);
    Trip cancel(CancelCommand command);
}
