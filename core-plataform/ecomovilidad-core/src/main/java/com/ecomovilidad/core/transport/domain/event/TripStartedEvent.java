package com.ecomovilidad.core.transport.domain.event;

import com.ecomovilidad.core.shared.domain.DomainEvent;
import com.ecomovilidad.core.shared.domain.TenantId;
import com.ecomovilidad.core.transport.domain.vo.AssignmentId;
import com.ecomovilidad.core.transport.domain.vo.RouteId;
import com.ecomovilidad.core.transport.domain.vo.TripId;

public final class TripStartedEvent extends DomainEvent {

    private final TripId tripId;
    private final RouteId routeId;
    private final AssignmentId assignmentId;

    public TripStartedEvent(TenantId tenantId, TripId tripId,
                            RouteId routeId, AssignmentId assignmentId) {
        super("TRIP_STARTED", tenantId);
        this.tripId = tripId;
        this.routeId = routeId;
        this.assignmentId = assignmentId;
    }

    public TripId getTripId() { return tripId; }
    public RouteId getRouteId() { return routeId; }
    public AssignmentId getAssignmentId() { return assignmentId; }
}
