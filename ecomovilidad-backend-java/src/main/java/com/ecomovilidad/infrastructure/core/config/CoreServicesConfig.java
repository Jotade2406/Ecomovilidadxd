package com.ecomovilidad.infrastructure.core.config;

import com.ecomovilidad.core.transport.application.RouteManagementService;
import com.ecomovilidad.core.transport.application.TripManagementService;
import com.ecomovilidad.core.transport.port.in.AddWaypointsUseCase;
import com.ecomovilidad.core.transport.port.in.AssignRouteUseCase;
import com.ecomovilidad.core.transport.port.in.BoardStudentUseCase;
import com.ecomovilidad.core.transport.port.in.CloseTripUseCase;
import com.ecomovilidad.core.transport.port.in.CreateRouteUseCase;
import com.ecomovilidad.core.transport.port.in.ManageRouteStatusUseCase;
import com.ecomovilidad.core.transport.port.in.StartTripUseCase;
import com.ecomovilidad.core.transport.port.out.BusRepositoryPort;
import com.ecomovilidad.core.transport.port.out.DriverRepositoryPort;
import com.ecomovilidad.core.transport.port.out.RouteAssignmentRepositoryPort;
import com.ecomovilidad.core.transport.port.out.RouteRepositoryPort;
import com.ecomovilidad.core.transport.port.out.TripRepositoryPort;
import com.ecomovilidad.core.shared.port.out.DomainEventPublisherPort;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Wires the framework-free Core application services into the Spring context.
 *
 * <p>Core services are plain Java objects — they have no Spring annotations.
 * This configuration class is the ONLY place that knows about both Spring and
 * the Core, following the Hexagonal Architecture dependency rule:
 * Infrastructure → Application → Domain (never the reverse).
 */
@Configuration
public class CoreServicesConfig {

    @Bean
    public RouteManagementService routeManagementService(
            RouteRepositoryPort routeRepository,
            RouteAssignmentRepositoryPort assignmentRepository,
            BusRepositoryPort busRepository,
            DriverRepositoryPort driverRepository,
            DomainEventPublisherPort eventPublisher) {
        return new RouteManagementService(routeRepository, assignmentRepository,
                busRepository, driverRepository, eventPublisher);
    }

    // Explicit use case aliases — lets controllers inject by interface, not concrete class
    @Bean
    public CreateRouteUseCase createRouteUseCase(RouteManagementService service) {
        return service;
    }

    @Bean
    public ManageRouteStatusUseCase manageRouteStatusUseCase(RouteManagementService service) {
        return service;
    }

    @Bean
    public AddWaypointsUseCase addWaypointsUseCase(RouteManagementService service) {
        return service;
    }

    @Bean
    public AssignRouteUseCase assignRouteUseCase(RouteManagementService service) {
        return service;
    }

    @Bean
    public TripManagementService tripManagementService(
            TripRepositoryPort tripRepository,
            RouteAssignmentRepositoryPort assignmentRepository,
            DomainEventPublisherPort eventPublisher) {
        return new TripManagementService(tripRepository, assignmentRepository, eventPublisher);
    }

    @Bean
    public StartTripUseCase startTripUseCase(TripManagementService service) {
        return service;
    }

    @Bean
    public BoardStudentUseCase boardStudentUseCase(TripManagementService service) {
        return service;
    }

    @Bean
    public CloseTripUseCase closeTripUseCase(TripManagementService service) {
        return service;
    }
}
