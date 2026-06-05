package com.ecomovilidad.core.transport.port.in;

import com.ecomovilidad.core.shared.domain.TenantId;
import com.ecomovilidad.core.transport.domain.model.Route;
import com.ecomovilidad.core.transport.domain.vo.RouteId;
import com.ecomovilidad.core.transport.domain.vo.RouteWaypoint;

import java.util.List;

public interface AddWaypointsUseCase {

    record Command(RouteId routeId, TenantId tenantId, List<RouteWaypoint> waypoints) {}

    Route execute(Command command);
}
