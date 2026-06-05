package com.ecomovilidad.infrastructure.persistence.repositories;

import com.ecomovilidad.domain.rutas.Ruta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RutaJpaRepository extends JpaRepository<Ruta, UUID> {

    @Query("SELECT r FROM Ruta r LEFT JOIN FETCH r.puntosIntermedios WHERE r.id = :id AND r.tenantId = :tenantId")
    Optional<Ruta> findByIdAndTenantId(@Param("id") UUID id, @Param("tenantId") UUID tenantId);

    @Query("SELECT r FROM Ruta r LEFT JOIN FETCH r.puntosIntermedios WHERE r.tenantId = :tenantId ORDER BY r.fechaCreacion DESC")
    List<Ruta> findByTenantIdOrderByFechaCreacionDesc(@Param("tenantId") UUID tenantId);
}
