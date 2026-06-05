package com.ecomovilidad.infrastructure.persistence.repositories;

import com.ecomovilidad.domain.comunidad.Estudiante;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EstudianteJpaRepository extends JpaRepository<Estudiante, UUID> {

    List<Estudiante> findByTenantId(UUID tenantId);

    Optional<Estudiante> findByIdAndTenantId(UUID id, UUID tenantId);
}
