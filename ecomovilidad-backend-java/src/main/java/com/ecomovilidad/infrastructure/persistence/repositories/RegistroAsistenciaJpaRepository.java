package com.ecomovilidad.infrastructure.persistence.repositories;

import com.ecomovilidad.domain.asistencia.RegistroAsistencia;
import com.ecomovilidad.domain.asistencia.TipoAsistencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RegistroAsistenciaJpaRepository extends JpaRepository<RegistroAsistencia, UUID> {

    List<RegistroAsistencia> findByViajeIdAndTenantId(UUID viajeId, UUID tenantId);

    List<RegistroAsistencia> findByEstudianteIdAndTenantIdOrderByHoraRegistroDesc(UUID estudianteId, UUID tenantId);

    Optional<RegistroAsistencia> findByEstudianteIdAndViajeIdAndTipo(
            UUID estudianteId, UUID viajeId, TipoAsistencia tipo);

    Optional<RegistroAsistencia> findByIdAndTenantId(UUID id, UUID tenantId);
}
