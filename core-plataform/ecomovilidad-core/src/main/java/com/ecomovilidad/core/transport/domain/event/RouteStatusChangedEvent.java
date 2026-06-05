package com.ecomovilidad.core.transport.domain.event;

import com.ecomovilidad.core.shared.domain.DomainEvent;
import com.ecomovilidad.core.shared.domain.TenantId;
import com.ecomovilidad.core.transport.domain.vo.RouteId;
import com.ecomovilidad.core.transport.domain.vo.RouteStatus;

public final class RouteStatusChangedEvent extends DomainEvent {

    private final RouteId routeId;
    private final RouteStatus previousStatus;
    private final RouteStatus newStatus;

    public RouteStatusChangedEvent(TenantId tenantId, RouteId routeId,
                                   RouteStatus previousStatus, RouteStatus newStatus) {
        super("ROUTE_STATUS_CHANGED", tenantId);
        this.routeId = routeId;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
    }

    public RouteId getRouteId() { return routeId; }
    public RouteStatus getPreviousStatus() { return previousStatus; }
    public RouteStatus getNewStatus() { return newStatus; }
}
