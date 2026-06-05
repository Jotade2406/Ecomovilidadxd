package com.ecomovilidad.infrastructure.persistence.repositories;

import com.ecomovilidad.domain.viajes.EstadoEstudianteEnViaje;
import com.ecomovilidad.domain.viajes.EstudianteEnViaje;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EstudianteEnViajeJpaRepository extends JpaRepository<EstudianteEnViaje, UUID> {

    List<EstudianteEnViaje> findByViajeIdAndTenantId(UUID viajeId, UUID tenantId);

    Optional<EstudianteEnViaje> findByViajeIdAndEstudianteIdAndTenantId(
            UUID viajeId, UUID estudianteId, UUID tenantId);

    int countByViajeIdAndEstado(UUID viajeId, EstadoEstudianteEnViaje estado);
}
