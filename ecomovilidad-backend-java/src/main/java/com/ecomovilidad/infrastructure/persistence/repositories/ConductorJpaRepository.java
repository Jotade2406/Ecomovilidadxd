package com.ecomovilidad.infrastructure.persistence.repositories;

import com.ecomovilidad.domain.flota.Conductor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConductorJpaRepository extends JpaRepository<Conductor, UUID> {

    List<Conductor> findByTenantId(UUID tenantId);

    Optional<Conductor> findByIdAndTenantId(UUID id, UUID tenantId);

    boolean existsByLicencia(String licencia);

    Optional<Conductor> findByLicencia(String licencia);
}
