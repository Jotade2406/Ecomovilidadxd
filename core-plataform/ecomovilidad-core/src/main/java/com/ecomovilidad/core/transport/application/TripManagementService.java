package com.ecomovilidad.core.transport.application;

import com.ecomovilidad.core.shared.port.out.DomainEventPublisherPort;
import com.ecomovilidad.core.transport.domain.exception.InactiveRouteAssignmentException;
import com.ecomovilidad.core.transport.domain.exception.TripAlreadyActiveException;
import com.ecomovilidad.core.transport.domain.model.Trip;
import com.ecomovilidad.core.transport.port.in.BoardStudentUseCase;
import com.ecomovilidad.core.transport.port.in.CloseTripUseCase;
import com.ecomovilidad.core.transport.port.in.StartTripUseCase;
import com.ecomovilidad.core.transport.port.out.RouteAssignmentRepositoryPort;
import com.ecomovilidad.core.transport.port.out.TripRepositoryPort;

import java.util.Objects;

/**
 * Application Service: orquesta los use cases del ciclo de vida de un Viaje.
 */
public class TripManagementService
        implements StartTripUseCase, BoardStudentUseCase, CloseTripUseCase {

    private final TripRepositoryPort tripRepository;
    private final RouteAssignmentRepositoryPort assignmentRepository;
    private final DomainEventPublisherPort eventPublisher;

    public TripManagementService(TripRepositoryPort tripRepository,
                                  RouteAssignmentRepositoryPort assignmentRepository,
                                  DomainEventPublisherPort eventPublisher) {
        this.tripRepository = Objects.requireNonNull(tripRepository);
        this.assignmentRepository = Objects.requireNonNull(assignmentRepository);
        this.eventPublisher = Objects.requireNonNull(eventPublisher);
    }

    // ── StartTripUseCase ─────────────────────────────────────────────────

    @Override
    public Trip execute(StartTripUseCase.Command cmd) {
        if (tripRepository.existsActiveForRoute(cmd.routeId(), cmd.tenantId()))
            throw new TripAlreadyActiveException(cmd.routeId());

        var assignment = assignmentRepository
                .findActiveByRoute(cmd.routeId(), cmd.tenantId())
                .orElseThrow(() -> new InactiveRouteAssignmentException(cmd.routeId()));

        var trip = Trip.start(cmd.tenantId(), cmd.routeId(),
                assignment.getId(), assignment.getBusId(),
                assignment.getDriverId(), assignment.getBusCapacity());

        var saved = tripRepository.save(trip);
        eventPublisher.publishAll(saved.pullDomainEvents());
        return saved;
    }

    // ── BoardStudentUseCase ──────────────────────────────────────────────

    @Override
    public Trip execute(BoardStudentUseCase.Command cmd) {
        var trip = loadTrip(cmd.tripId(), cmd.tenantId());
        trip.boardStudent(cmd.studentId());
        var saved = tripRepository.save(trip);
        eventPublisher.publishAll(saved.pullDomainEvents());
        return saved;
    }

    // ── CloseTripUseCase ─────────────────────────────────────────────────

    @Override
    public Trip complete(CompleteCommand cmd) {
        var trip = loadTrip(cmd.tripId(), cmd.tenantId());
        trip.complete();
        var saved = tripRepository.save(trip);
        eventPublisher.publishAll(saved.pullDomainEvents());
        return saved;
    }

    @Override
    public Trip cancel(CancelCommand cmd) {
        var trip = loadTrip(cmd.tripId(), cmd.tenantId());
        trip.cancel();
        var saved = tripRepository.save(trip);
        eventPublisher.publishAll(saved.pullDomainEvents());
        return saved;
    }

    // ── Private helpers ──────────────────────────────────────────────────

    private Trip loadTrip(com.ecomovilidad.core.transport.domain.vo.TripId tripId,
                           com.ecomovilidad.core.shared.domain.TenantId tenantId) {
        return tripRepository.findById(tripId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Viaje no encontrado: " + tripId));
    }
}
