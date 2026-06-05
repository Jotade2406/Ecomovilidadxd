package com.ecomovilidad.core.transport.port.in;

import com.ecomovilidad.core.shared.domain.TenantId;
import com.ecomovilidad.core.transport.domain.model.Route;
import com.ecomovilidad.core.transport.domain.vo.Coordinate;

public interface CreateRouteUseCase {

    record Command(TenantId tenantId, String name,
                   Coordinate origin, Coordinate destination, String colorHex) {}

    Route execute(Command command);
}
