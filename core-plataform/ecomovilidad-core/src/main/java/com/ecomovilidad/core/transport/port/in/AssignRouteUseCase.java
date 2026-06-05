package com.ecomovilidad.core.transport.port.in;

import com.ecomovilidad.core.shared.domain.TenantId;
import com.ecomovilidad.core.transport.domain.model.RouteAssignment;
import com.ecomovilidad.core.transport.domain.vo.BusId;
import com.ecomovilidad.core.transport.domain.vo.DriverId;
import com.ecomovilidad.core.transport.domain.vo.RouteId;

public interface AssignRouteUseCase {

    record Command(TenantId tenantId, RouteId routeId, BusId busId, DriverId driverId) {}

    RouteAssignment execute(Command command);
}
