package com.ecomovilidad.core.transport.domain.event;

import com.ecomovilidad.core.shared.domain.DomainEvent;
import com.ecomovilidad.core.shared.domain.TenantId;
import com.ecomovilidad.core.transport.domain.vo.RouteId;
import com.ecomovilidad.core.transport.domain.vo.TripId;
import com.ecomovilidad.core.transport.domain.vo.TripStatus;

import java.time.Instant;

public final class TripClosedEvent extends DomainEvent {

    private final TripId tripId;
    private final RouteId routeId;
    private final TripStatus finalStatus;
    private final int studentsBoarded;
    private final Instant closedAt;

    public TripClosedEvent(TenantId tenantId, TripId tripId, RouteId routeId,
                           TripStatus finalStatus, int studentsBoarded, Instant closedAt) {
        super("TRIP_CLOSED", tenantId);
        this.tripId = tripId;
        this.routeId = routeId;
        this.finalStatus = finalStatus;
        this.studentsBoarded = studentsBoarded;
        this.closedAt = closedAt;
    }

    public TripId getTripId() { return tripId; }
    public RouteId getRouteId() { return routeId; }
    public TripStatus getFinalStatus() { return finalStatus; }
    public int getStudentsBoarded() { return studentsBoarded; }
    public Instant getClosedAt() { return closedAt; }
}
