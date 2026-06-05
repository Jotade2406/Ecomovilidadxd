package com.ecomovilidad.core.transport.port.in;

import com.ecomovilidad.core.shared.domain.TenantId;
import com.ecomovilidad.core.transport.domain.model.Trip;
import com.ecomovilidad.core.transport.domain.vo.RouteId;

public interface StartTripUseCase {

    record Command(TenantId tenantId, RouteId routeId) {}

    Trip execute(Command command);
}
