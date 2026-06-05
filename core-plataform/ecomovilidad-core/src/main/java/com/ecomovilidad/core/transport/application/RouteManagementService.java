package com.ecomovilidad.core.transport.application;

import com.ecomovilidad.core.shared.port.out.DomainEventPublisherPort;
import com.ecomovilidad.core.transport.domain.exception.RouteNotFoundException;
import com.ecomovilidad.core.transport.domain.model.Route;
import com.ecomovilidad.core.transport.domain.model.RouteAssignment;
import com.ecomovilidad.core.transport.port.in.AddWaypointsUseCase;
import com.ecomovilidad.core.transport.port.in.AssignRouteUseCase;
import com.ecomovilidad.core.transport.port.in.CreateRouteUseCase;
import com.ecomovilidad.core.transport.port.in.ManageRouteStatusUseCase;
import com.ecomovilidad.core.transport.port.out.BusRepositoryPort;
import com.ecomovilidad.core.transport.port.out.DriverRepositoryPort;
import com.ecomovilidad.core.transport.port.out.RouteAssignmentRepositoryPort;
import com.ecomovilidad.core.transport.port.out.RouteRepositoryPort;

import java.util.Objects;

/**
 * Application Service: orquesta los use cases de Route y RouteAssignment.
 *
 * <p>Regla: nunca toma decisiones de dominio — solo coordina puertos.
 * Toda la lógica de negocio vive en los aggregates y value objects del dominio.
 */
public class RouteManagementService
        implements CreateRouteUseCase, ManageRouteStatusUseCase,
                   AddWaypointsUseCase, AssignRouteUseCase {

    private final RouteRepositoryPort routeRepository;
    private final RouteAssignmentRepositoryPort assignmentRepository;
    private final BusRepositoryPort busRepository;
    private final DriverRepositoryPort driverRepository;
    private final DomainEventPublisherPort eventPublisher;

    public RouteManagementService(RouteRepositoryPort routeRepository,
                                   RouteAssignmentRepositoryPort assignmentRepository,
                                   BusRepositoryPort busRepository,
                                   DriverRepositoryPort driverRepository,
                                   DomainEventPublisherPort eventPublisher) {
        this.routeRepository = Objects.requireNonNull(routeRepository);
        this.assignmentRepository = Objects.requireNonNull(assignmentRepository);
        this.busRepository = Objects.requireNonNull(busRepository);
        this.driverRepository = Objects.requireNonNull(driverRepository);
        this.eventPublisher = Objects.requireNonNull(eventPublisher);
    }

    // ── CreateRouteUseCase ───────────────────────────────────────────────

    @Override
    public Route execute(CreateRouteUseCase.Command cmd) {
        var route = Route.create(cmd.tenantId(), cmd.name(),
                cmd.origin(), cmd.destination(), cmd.colorHex());
        var saved = routeRepository.save(route);
        eventPublisher.publishAll(saved.pullDomainEvents());
        return saved;
    }

    // ── ManageRouteStatusUseCase ─────────────────────────────────────────

    @Override
    public Route activate(ActivateCommand cmd) {
        var route = loadRoute(cmd.routeId(), cmd.tenantId());
        route.activate();
        var saved = routeRepository.save(route);
        eventPublisher.publishAll(saved.pullDomainEvents());
        return saved;
    }

    @Override
    public Route suspend(SuspendCommand cmd) {
        var route = loadRoute(cmd.routeId(), cmd.tenantId());
        route.suspend();
        var saved = routeRepository.save(route);
        eventPublisher.publishAll(saved.pullDomainEvents());
        return saved;
    }

    @Override
    public Route finalize_(FinalizeCommand cmd) {
        var route = loadRoute(cmd.routeId(), cmd.tenantId());
        route.finalize_();
        var saved = routeRepository.save(route);
        eventPublisher.publishAll(saved.pullDomainEvents());
        return saved;
    }

    // ── AddWaypointsUseCase ──────────────────────────────────────────────

    @Override
    public Route execute(AddWaypointsUseCase.Command cmd) {
        var route = loadRoute(cmd.routeId(), cmd.tenantId());
        route.replaceWaypoints(cmd.waypoints());
        var saved = routeRepository.save(route);
        eventPublisher.publishAll(saved.pullDomainEvents());
        return saved;
    }

    // ── AssignRouteUseCase ───────────────────────────────────────────────

    @Override
    public RouteAssignment execute(AssignRouteUseCase.Command cmd) {
        loadRoute(cmd.routeId(), cmd.tenantId()); // validates route exists

        if (!busRepository.existsById(cmd.busId(), cmd.tenantId()))
            throw new IllegalArgumentException("Bus no encontrado: " + cmd.busId());

        if (!driverRepository.existsById(cmd.driverId(), cmd.tenantId()))
            throw new IllegalArgumentException("Conductor no encontrado: " + cmd.driverId());

        var capacity = busRepository.findCapacityById(cmd.busId(), cmd.tenantId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "No se pudo obtener la capacidad del bus: " + cmd.busId()));

        // Revoke any existing active assignment for this route
        assignmentRepository.findActiveByRoute(cmd.routeId(), cmd.tenantId())
                .ifPresent(existing -> {
                    existing.revoke();
                    assignmentRepository.save(existing);
                });

        var assignment = RouteAssignment.create(cmd.tenantId(), cmd.routeId(),
                cmd.busId(), cmd.driverId(), capacity);
        return assignmentRepository.save(assignment);
    }

    // ── Private helpers ──────────────────────────────────────────────────

    private Route loadRoute(com.ecomovilidad.core.transport.domain.vo.RouteId routeId,
                             com.ecomovilidad.core.shared.domain.TenantId tenantId) {
        return routeRepository.findById(routeId, tenantId)
                .orElseThrow(() -> new RouteNotFoundException(routeId));
    }
}
