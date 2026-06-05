package com.ecomovilidad.infrastructure.core.adapters;

import com.ecomovilidad.core.shared.domain.TenantId;
import com.ecomovilidad.core.transport.domain.vo.BusCapacity;
import com.ecomovilidad.core.transport.domain.vo.BusId;
import com.ecomovilidad.core.transport.port.out.BusRepositoryPort;
import com.ecomovilidad.infrastructure.persistence.repositories.VehiculoJpaRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Secondary adapter: exposes JPA {@code Vehiculo} data as {@link BusRepositoryPort}.
 * Translates between UUID-based bus identity and the typed {@link BusId} Value Object.
 */
@Component
@Transactional(readOnly = true)
public class BusRepositoryAdapter implements BusRepositoryPort {

    private final VehiculoJpaRepository vehiculoRepository;

    public BusRepositoryAdapter(VehiculoJpaRepository vehiculoRepository) {
        this.vehiculoRepository = vehiculoRepository;
    }

    @Override
    public Optional<BusCapacity> findCapacityById(BusId busId, TenantId tenantId) {
        return vehiculoRepository.findById(busId.value())
                .filter(v -> tenantId.value().equals(v.getTenantId()))
                .map(v -> BusCapacity.of(v.getCapacidad()));
    }

    @Override
    public boolean existsById(BusId busId, TenantId tenantId) {
        return vehiculoRepository.findById(busId.value())
                .map(v -> tenantId.value().equals(v.getTenantId()))
                .orElse(false);
    }
}
