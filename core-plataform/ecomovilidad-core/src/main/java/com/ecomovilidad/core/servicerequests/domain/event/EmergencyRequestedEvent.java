package com.ecomovilidad.core.servicerequests.domain.event;

import com.ecomovilidad.core.servicerequests.domain.vo.RequestId;
import com.ecomovilidad.core.shared.domain.DomainEvent;
import com.ecomovilidad.core.shared.domain.TenantId;

import java.util.UUID;

public final class EmergencyRequestedEvent extends DomainEvent {

    private final RequestId requestId;
    private final UUID studentId;
    private final String location;

    public EmergencyRequestedEvent(TenantId tenantId, RequestId requestId,
                                    UUID studentId, String location) {
        super("EMERGENCY_REQUESTED", tenantId);
        this.requestId = requestId;
        this.studentId = studentId;
        this.location = location;
    }

    public RequestId getRequestId() { return requestId; }
    public UUID getStudentId() { return studentId; }
    public String getLocation() { return location; }
}
