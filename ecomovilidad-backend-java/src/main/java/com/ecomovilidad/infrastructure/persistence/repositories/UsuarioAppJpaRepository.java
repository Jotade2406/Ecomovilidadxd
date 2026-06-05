package com.ecomovilidad.infrastructure.persistence.repositories;

import com.ecomovilidad.domain.auth.UsuarioApp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UsuarioAppJpaRepository extends JpaRepository<UsuarioApp, UUID> {
    Optional<UsuarioApp> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
    List<UsuarioApp> findByRole(String role);
    List<UsuarioApp> findByTenantId(UUID tenantId);
}
