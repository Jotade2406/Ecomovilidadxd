package com.ecomovilidad.core.servicerequests.application;

import com.ecomovilidad.core.servicerequests.domain.model.BusChangeRequest;
import com.ecomovilidad.core.servicerequests.domain.model.EmergencyRequest;
import com.ecomovilidad.core.servicerequests.port.in.RequestBusChangeUseCase;
import com.ecomovilidad.core.servicerequests.port.in.RequestEmergencyBusUseCase;
import com.ecomovilidad.core.servicerequests.port.out.BusChangeRequestRepositoryPort;
import com.ecomovilidad.core.servicerequests.port.out.EmergencyRequestRepositoryPort;
import com.ecomovilidad.core.shared.port.out.DomainEventPublisherPort;

import java.util.Objects;

public class ServiceRequestApplicationService
        implements RequestBusChangeUseCase, RequestEmergencyBusUseCase {

    private final BusChangeRequestRepositoryPort busChangeRepository;
    private final EmergencyRequestRepositoryPort emergencyRepository;
    private final DomainEventPublisherPort eventPublisher;

    public ServiceRequestApplicationService(
            BusChangeRequestRepositoryPort busChangeRepository,
            EmergencyRequestRepositoryPort emergencyRepository,
            DomainEventPublisherPort eventPublisher) {
        this.busChangeRepository = Objects.requireNonNull(busChangeRepository);
        this.emergencyRepository = Objects.requireNonNull(emergencyRepository);
        this.eventPublisher = Objects.requireNonNull(eventPublisher);
    }

    @Override
    public BusChangeRequest execute(RequestBusChangeUseCase.Command cmd) {
        var request = BusChangeRequest.create(cmd.tenantId(), cmd.studentId(), cmd.reason());
        var saved = busChangeRepository.save(request);
        eventPublisher.publishAll(saved.pullDomainEvents());
        return saved;
    }

    @Override
    public EmergencyRequest execute(RequestEmergencyBusUseCase.Command cmd) {
        var request = EmergencyRequest.create(cmd.tenantId(), cmd.studentId(),
                cmd.location(), cmd.description());
        var saved = emergencyRepository.save(request);
        eventPublisher.publishAll(saved.pullDomainEvents());
        return saved;
    }
}
