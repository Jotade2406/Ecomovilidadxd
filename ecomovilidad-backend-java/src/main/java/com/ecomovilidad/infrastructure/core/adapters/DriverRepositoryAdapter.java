package com.ecomovilidad.infrastructure.core.adapters;

import com.ecomovilidad.core.shared.domain.TenantId;
import com.ecomovilidad.core.transport.domain.vo.DriverId;
import com.ecomovilidad.core.transport.port.out.DriverRepositoryPort;
import com.ecomovilidad.infrastructure.persistence.repositories.ConductorJpaRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Secondary adapter: exposes JPA {@code Conductor} data as {@link DriverRepositoryPort}.
 */
@Component
@Transactional(readOnly = true)
public class DriverRepositoryAdapter implements DriverRepositoryPort {

    private final ConductorJpaRepository conductorRepository;

    public DriverRepositoryAdapter(ConductorJpaRepository conductorRepository) {
        this.conductorRepository = conductorRepository;
    }

    @Override
    public boolean existsById(DriverId driverId, TenantId tenantId) {
        return conductorRepository.findById(driverId.value())
                .map(c -> tenantId.value().equals(c.getTenantId()))
                .orElse(false);
    }
}
