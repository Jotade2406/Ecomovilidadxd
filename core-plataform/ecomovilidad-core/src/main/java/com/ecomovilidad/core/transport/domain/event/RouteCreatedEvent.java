package com.ecomovilidad.core.transport.domain.event;

import com.ecomovilidad.core.shared.domain.DomainEvent;
import com.ecomovilidad.core.shared.domain.TenantId;
import com.ecomovilidad.core.transport.domain.vo.RouteId;

public final class RouteCreatedEvent extends DomainEvent {

    private final RouteId routeId;
    private final String routeName;

    public RouteCreatedEvent(TenantId tenantId, RouteId routeId, String routeName) {
        super("ROUTE_CREATED", tenantId);
        this.routeId = routeId;
        this.routeName = routeName;
    }

    public RouteId getRouteId() { return routeId; }
    public String getRouteName() { return routeName; }
}
