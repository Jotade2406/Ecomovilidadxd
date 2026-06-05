package com.ecomovilidad.infrastructure.persistence.repositories;

import com.ecomovilidad.domain.viajes.Viaje;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ViajeJpaRepository extends JpaRepository<Viaje, UUID> {

    List<Viaje> findByTenantIdOrderByCreadoEnDesc(UUID tenantId);

    Optional<Viaje> findByIdAndTenantId(UUID id, UUID tenantId);
}
