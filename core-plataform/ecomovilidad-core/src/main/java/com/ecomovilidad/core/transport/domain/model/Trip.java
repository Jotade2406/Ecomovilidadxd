package com.ecomovilidad.core.transport.domain.model;

import com.ecomovilidad.core.shared.domain.AggregateRoot;
import com.ecomovilidad.core.shared.domain.TenantId;
import com.ecomovilidad.core.transport.domain.event.StudentBoardedEvent;
import com.ecomovilidad.core.transport.domain.event.TripClosedEvent;
import com.ecomovilidad.core.transport.domain.event.TripStartedEvent;
import com.ecomovilidad.core.transport.domain.exception.BusCapacityExceededException;
import com.ecomovilidad.core.transport.domain.vo.AssignmentId;
import com.ecomovilidad.core.transport.domain.vo.BusCapacity;
import com.ecomovilidad.core.transport.domain.vo.BusId;
import com.ecomovilidad.core.transport.domain.vo.DriverId;
import com.ecomovilidad.core.transport.domain.vo.RouteId;
import com.ecomovilidad.core.transport.domain.vo.TripId;
import com.ecomovilidad.core.transport.domain.vo.TripStatus;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

/**
 * Aggregate Root: Viaje en curso.
 *
 * <p>Invariantes del dominio:
 * <ul>
 *   <li>Un viaje solo puede iniciar con una asignación activa (Ruta-Bus-Conductor).</li>
 *   <li>No se pueden agregar estudiantes una vez el viaje está cerrado o cancelado.</li>
 *   <li>La cantidad de estudiantes no puede superar la capacidad del bus.</li>
 *   <li>Un estudiante no puede abordarse dos veces en el mismo viaje.</li>
 *   <li>Las transiciones de estado siguen la máquina en {@link TripStatus}.</li>
 * </ul>
 */
public class Trip extends AggregateRoot<TripId> {

    private final RouteId routeId;
    private final AssignmentId assignmentId;
    private final BusId busId;
    private final DriverId driverId;
    private final BusCapacity busCapacity;
    private TripStatus status;
    private final List<UUID> boardedStudentIds;
    private final Instant startedAt;
    private Instant closedAt;

    private Trip(TripId id, TenantId tenantId, RouteId routeId,
                 AssignmentId assignmentId, BusId busId, DriverId driverId,
                 BusCapacity busCapacity) {
        super(id, tenantId);
        this.routeId = routeId;
        this.assignmentId = assignmentId;
        this.busId = busId;
        this.driverId = driverId;
        this.busCapacity = busCapacity;
        this.status = TripStatus.EN_CURSO;
        this.boardedStudentIds = new ArrayList<>();
        this.startedAt = Instant.now();
    }

    // ── Factory Method ───────────────────────────────────────────────────

    /**
     * Inicia un nuevo viaje desde una asignación activa.
     * La validación de que la asignación existe y la ruta está ACTIVA
     * se realiza en el use case antes de llamar a este factory.
     */
    public static Trip start(TenantId tenantId, RouteId routeId,
                             AssignmentId assignmentId, BusId busId,
                             DriverId driverId, BusCapacity busCapacity) {
        Objects.requireNonNull(tenantId, "TenantId es requerido");
        Objects.requireNonNull(routeId, "RouteId es requerido");
        Objects.requireNonNull(assignmentId, "AssignmentId es requerido");
        Objects.requireNonNull(busId, "BusId es requerido");
        Objects.requireNonNull(driverId, "DriverId es requerido");
        Objects.requireNonNull(busCapacity, "BusCapacity es requerida");

        var trip = new Trip(TripId.newId(), tenantId, routeId,
                            assignmentId, busId, driverId, busCapacity);
        trip.registerEvent(new TripStartedEvent(tenantId, trip.getId(), routeId, assignmentId));
        return trip;
    }

    /** Reconstituye un viaje desde persistencia (sin lanzar eventos). */
    public static Trip reconstitute(TripId id, TenantId tenantId, RouteId routeId,
                                    AssignmentId assignmentId, BusId busId, DriverId driverId,
                                    BusCapacity busCapacity, TripStatus status,
                                    List<UUID> boardedStudentIds, Instant startedAt,
                                    Instant closedAt) {
        var trip = new Trip(id, tenantId, routeId, assignmentId, busId, driverId, busCapacity);
        trip.status = status;
        trip.boardedStudentIds.addAll(boardedStudentIds);
        trip.closedAt = closedAt;
        return trip;
    }

    // ── Comandos de dominio ──────────────────────────────────────────────

    /**
     * Registra el abordaje de un estudiante vía QR.
     * Idempotente: si el estudiante ya abordó en este viaje, no hace nada.
     */
    public void boardStudent(UUID studentId) {
        Objects.requireNonNull(studentId, "StudentId es requerido");
        guardOpen("abordar estudiantes en");

        if (boardedStudentIds.contains(studentId)) {
            return; // idempotente — ya abordado
        }

        if (!busCapacity.canAccommodate(boardedStudentIds.size() + 1)) {
            throw new BusCapacityExceededException(busId,
                    busCapacity.getTotal(), boardedStudentIds.size() + 1);
        }

        boardedStudentIds.add(studentId);
        registerEvent(new StudentBoardedEvent(getTenantId(), getId(),
                studentId, boardedStudentIds.size()));
    }

    /** Marca el viaje como completado exitosamente. */
    public void complete() {
        guardOpen("completar");
        this.status = this.status.transitionTo(TripStatus.COMPLETADO);
        this.closedAt = Instant.now();
        registerEvent(new TripClosedEvent(getTenantId(), getId(), routeId,
                TripStatus.COMPLETADO, boardedStudentIds.size(), closedAt));
    }

    /** Cancela el viaje (puede ocurrir desde EN_CURSO o PROGRAMADO). */
    public void cancel() {
        this.status = this.status.transitionTo(TripStatus.CANCELADO);
        this.closedAt = Instant.now();
        registerEvent(new TripClosedEvent(getTenantId(), getId(), routeId,
                TripStatus.CANCELADO, boardedStudentIds.size(), closedAt));
    }

    // ── Queries de dominio ───────────────────────────────────────────────

    public boolean isOpen() {
        return status == TripStatus.EN_CURSO;
    }

    public int boardedCount() {
        return boardedStudentIds.size();
    }

    public int remainingCapacity() {
        return busCapacity.remaining(boardedStudentIds.size());
    }

    // ── Getters ──────────────────────────────────────────────────────────

    public RouteId getRouteId() { return routeId; }
    public AssignmentId getAssignmentId() { return assignmentId; }
    public BusId getBusId() { return busId; }
    public DriverId getDriverId() { return driverId; }
    public BusCapacity getBusCapacity() { return busCapacity; }
    public TripStatus getStatus() { return status; }
    public Instant getStartedAt() { return startedAt; }
    public Instant getClosedAt() { return closedAt; }
    public List<UUID> getBoardedStudentIds() {
        return Collections.unmodifiableList(boardedStudentIds);
    }

    // ── Helpers privados ─────────────────────────────────────────────────

    private void guardOpen(String operation) {
        if (!isOpen())
            throw new IllegalStateException(
                "No se puede " + operation + " un viaje con estado " + status);
    }
}
