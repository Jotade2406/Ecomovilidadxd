package com.ecomovilidad.core.servicerequests.domain.event;

import com.ecomovilidad.core.servicerequests.domain.vo.RequestId;
import com.ecomovilidad.core.shared.domain.DomainEvent;
import com.ecomovilidad.core.shared.domain.TenantId;

import java.util.UUID;

public final class BusChangeRequestedEvent extends DomainEvent {

    private final RequestId requestId;
    private final UUID studentId;
    private final String reason;

    public BusChangeRequestedEvent(TenantId tenantId, RequestId requestId,
                                    UUID studentId, String reason) {
        super("BUS_CHANGE_REQUESTED", tenantId);
        this.requestId = requestId;
        this.studentId = studentId;
        this.reason = reason;
    }

    public RequestId getRequestId() { return requestId; }
    public UUID getStudentId() { return studentId; }
    public String getReason() { return reason; }
}
