package com.ecomovilidad.infrastructure.persistence.repositories;

import com.ecomovilidad.domain.tenants.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TenantJpaRepository extends JpaRepository<Tenant, UUID> {
    Optional<Tenant> findByNombreIgnoreCase(String nombre);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM public.tenants WHERE id = :id", nativeQuery = true)
    void deleteNative(@Param("id") UUID id);
}
