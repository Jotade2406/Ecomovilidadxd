package com.ecomovilidad.infrastructure.persistence.repositories;

import com.ecomovilidad.domain.pagos.EstadoPago;
import com.ecomovilidad.domain.pagos.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PagoJpaRepository extends JpaRepository<Pago, UUID> {

    List<Pago> findByTenantIdOrderByFechaCreacionDesc(UUID tenantId);

    List<Pago> findByEstudianteIdAndTenantIdOrderByFechaCreacionDesc(UUID estudianteId, UUID tenantId);

    List<Pago> findByEstadoAndTenantId(EstadoPago estado, UUID tenantId);

    Optional<Pago> findByIdAndTenantId(UUID id, UUID tenantId);
}
