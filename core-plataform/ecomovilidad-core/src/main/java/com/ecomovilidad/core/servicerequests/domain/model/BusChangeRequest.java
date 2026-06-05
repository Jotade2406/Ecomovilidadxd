package com.ecomovilidad.core.servicerequests.domain.model;

import com.ecomovilidad.core.servicerequests.domain.event.BusChangeRequestedEvent;
import com.ecomovilidad.core.servicerequests.domain.vo.RequestId;
import com.ecomovilidad.core.servicerequests.domain.vo.RequestStatus;
import com.ecomovilidad.core.shared.domain.AggregateRoot;
import com.ecomovilidad.core.shared.domain.TenantId;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

/**
 * Aggregate Root: Solicitud de Cambio de Bus.
 */
public class BusChangeRequest extends AggregateRoot<RequestId> {

    private final UUID studentId;
    private final String reason;
    private RequestStatus status;
    private String resolutionNotes;
    private final Instant requestedAt;
    private Instant resolvedAt;

    private BusChangeRequest(RequestId id, TenantId tenantId, UUID studentId, String reason) {
        super(id, tenantId);
        this.studentId = Objects.requireNonNull(studentId, "StudentId es requerido");
        if (reason == null || reason.isBlank())
            throw new IllegalArgumentException("El motivo de la solicitud es requerido");
        this.reason = reason;
        this.status = RequestStatus.PENDIENTE;
        this.requestedAt = Instant.now();
    }

    // ── Factory Methods ──────────────────────────────────────────────────

    public static BusChangeRequest create(TenantId tenantId, UUID studentId, String reason) {
        var id = RequestId.newId();
        var request = new BusChangeRequest(id, tenantId, studentId, reason);
        request.registerEvent(new BusChangeRequestedEvent(tenantId, id, studentId, reason));
        return request;
    }

    public static BusChangeRequest reconstitute(RequestId id, TenantId tenantId,
                                                 UUID studentId, String reason,
                                                 RequestStatus status, String resolutionNotes,
                                                 Instant requestedAt, Instant resolvedAt) {
        var r = new BusChangeRequest(id, tenantId, studentId, reason);
        r.status = status;
        r.resolutionNotes = resolutionNotes;
        r.resolvedAt = resolvedAt;
        return r;
    }

    // ── Comandos de dominio ──────────────────────────────────────────────

    public void approve(String notes) {
        this.status = this.status.transitionTo(RequestStatus.APROBADA);
        this.resolutionNotes = notes;
        this.resolvedAt = Instant.now();
    }

    public void reject(String notes) {
        this.status = this.status.transitionTo(RequestStatus.RECHAZADA);
        this.resolutionNotes = notes;
        this.resolvedAt = Instant.now();
    }

    public void cancel() {
        this.status = this.status.transitionTo(RequestStatus.CANCELADA);
        this.resolvedAt = Instant.now();
    }

    // ── Getters ──────────────────────────────────────────────────────────

    public UUID getStudentId() { return studentId; }
    public String getReason() { return reason; }
    public RequestStatus getStatus() { return status; }
    public String getResolutionNotes() { return resolutionNotes; }
    public Instant getRequestedAt() { return requestedAt; }
    public Instant getResolvedAt() { return resolvedAt; }
}
