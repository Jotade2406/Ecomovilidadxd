package com.ecomovilidad.core.servicerequests.domain.model;

import com.ecomovilidad.core.servicerequests.domain.event.EmergencyRequestedEvent;
import com.ecomovilidad.core.servicerequests.domain.vo.RequestId;
import com.ecomovilidad.core.servicerequests.domain.vo.RequestStatus;
import com.ecomovilidad.core.shared.domain.AggregateRoot;
import com.ecomovilidad.core.shared.domain.TenantId;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

/**
 * Aggregate Root: Solicitud de Bus de Emergencia.
 */
public class EmergencyRequest extends AggregateRoot<RequestId> {

    private final UUID studentId;
    private final String location;
    private final String description;
    private RequestStatus status;
    private String attendedBy;
    private final Instant requestedAt;
    private Instant attendedAt;

    private EmergencyRequest(RequestId id, TenantId tenantId,
                              UUID studentId, String location, String description) {
        super(id, tenantId);
        this.studentId = Objects.requireNonNull(studentId, "StudentId es requerido");
        if (location == null || location.isBlank())
            throw new IllegalArgumentException("La ubicación es requerida para emergencias");
        this.location = location;
        this.description = description;
        this.status = RequestStatus.PENDIENTE;
        this.requestedAt = Instant.now();
    }

    // ── Factory Methods ──────────────────────────────────────────────────

    public static EmergencyRequest create(TenantId tenantId, UUID studentId,
                                           String location, String description) {
        var id = RequestId.newId();
        var request = new EmergencyRequest(id, tenantId, studentId, location, description);
        request.registerEvent(new EmergencyRequestedEvent(tenantId, id, studentId, location));
        return request;
    }

    public static EmergencyRequest reconstitute(RequestId id, TenantId tenantId,
                                                 UUID studentId, String location,
                                                 String description, RequestStatus status,
                                                 String attendedBy, Instant requestedAt,
                                                 Instant attendedAt) {
        var r = new EmergencyRequest(id, tenantId, studentId, location, description);
        r.status = status;
        r.attendedBy = attendedBy;
        r.attendedAt = attendedAt;
        return r;
    }

    // ── Comandos de dominio ──────────────────────────────────────────────

    public void attend(String operatorId) {
        this.status = this.status.transitionTo(RequestStatus.APROBADA);
        this.attendedBy = Objects.requireNonNull(operatorId, "El operador es requerido");
        this.attendedAt = Instant.now();
    }

    public void dismiss(String reason) {
        this.status = this.status.transitionTo(RequestStatus.RECHAZADA);
        this.attendedAt = Instant.now();
    }

    // ── Getters ──────────────────────────────────────────────────────────

    public UUID getStudentId() { return studentId; }
    public String getLocation() { return location; }
    public String getDescription() { return description; }
    public RequestStatus getStatus() { return status; }
    public String getAttendedBy() { return attendedBy; }
    public Instant getRequestedAt() { return requestedAt; }
    public Instant getAttendedAt() { return attendedAt; }
}
