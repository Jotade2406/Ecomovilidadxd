package com.ecomovilidad.infrastructure.persistence.repositories;

import com.ecomovilidad.domain.asignaciones.AsignacionRuta;
import com.ecomovilidad.domain.asignaciones.EstadoAsignacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AsignacionRutaJpaRepository extends JpaRepository<AsignacionRuta, UUID> {

    List<AsignacionRuta> findByTenantIdOrderByFechaCreacionDesc(UUID tenantId);

    List<AsignacionRuta> findByEstadoAndTenantId(EstadoAsignacion estado, UUID tenantId);

    Optional<AsignacionRuta> findByVehiculoIdAndEstadoAndTenantId(
            UUID vehiculoId, EstadoAsignacion estado, UUID tenantId);

    Optional<AsignacionRuta> findByIdAndTenantId(UUID id, UUID tenantId);
}
