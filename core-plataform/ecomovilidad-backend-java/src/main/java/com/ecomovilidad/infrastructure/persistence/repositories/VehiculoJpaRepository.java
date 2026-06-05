package com.ecomovilidad.infrastructure.persistence.repositories;

import com.ecomovilidad.domain.flota.Vehiculo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VehiculoJpaRepository extends JpaRepository<Vehiculo, UUID> {

    List<Vehiculo> findByTenantId(UUID tenantId);

    Optional<Vehiculo> findByIdAndTenantId(UUID id, UUID tenantId);
}
