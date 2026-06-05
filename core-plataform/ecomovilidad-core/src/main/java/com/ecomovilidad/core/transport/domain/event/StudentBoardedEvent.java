package com.ecomovilidad.core.transport.domain.event;

import com.ecomovilidad.core.shared.domain.DomainEvent;
import com.ecomovilidad.core.shared.domain.TenantId;
import com.ecomovilidad.core.transport.domain.vo.TripId;

import java.util.UUID;

public final class StudentBoardedEvent extends DomainEvent {

    private final TripId tripId;
    private final UUID studentId;
    private final int totalOnBoard;

    public StudentBoardedEvent(TenantId tenantId, TripId tripId, UUID studentId, int totalOnBoard) {
        super("STUDENT_BOARDED", tenantId);
        this.tripId = tripId;
        this.studentId = studentId;
        this.totalOnBoard = totalOnBoard;
    }

    public TripId getTripId() { return tripId; }
    public UUID getStudentId() { return studentId; }
    public int getTotalOnBoard() { return totalOnBoard; }
}
