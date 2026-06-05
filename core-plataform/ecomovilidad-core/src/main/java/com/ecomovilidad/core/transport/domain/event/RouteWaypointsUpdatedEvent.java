package com.ecomovilidad.core.transport.domain.event;

import com.ecomovilidad.core.shared.domain.DomainEvent;
import com.ecomovilidad.core.shared.domain.TenantId;
import com.ecomovilidad.core.transport.domain.vo.RouteId;

public final class RouteWaypointsUpdatedEvent extends DomainEvent {

    private final RouteId routeId;
    private final int waypointCount;

    public RouteWaypointsUpdatedEvent(TenantId tenantId, RouteId routeId, int waypointCount) {
        super("ROUTE_WAYPOINTS_UPDATED", tenantId);
        this.routeId = routeId;
        this.waypointCount = waypointCount;
    }

    public RouteId getRouteId() { return routeId; }
    public int getWaypointCount() { return waypointCount; }
}
