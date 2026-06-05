package com.ecomovilidad.infrastructure.core.adapters;

import com.ecomovilidad.core.shared.domain.DomainEvent;
import com.ecomovilidad.core.shared.port.out.DomainEventPublisherPort;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

/**
 * Secondary adapter: publishes Core domain events via Spring's {@link ApplicationEventPublisher}.
 * Allows existing Spring event listeners in the backend to react to Core domain events.
 */
@Component
public class SpringDomainEventPublisher implements DomainEventPublisherPort {

    private final ApplicationEventPublisher springPublisher;

    public SpringDomainEventPublisher(ApplicationEventPublisher springPublisher) {
        this.springPublisher = springPublisher;
    }

    @Override
    public void publish(DomainEvent event) {
        springPublisher.publishEvent(event);
    }
}
