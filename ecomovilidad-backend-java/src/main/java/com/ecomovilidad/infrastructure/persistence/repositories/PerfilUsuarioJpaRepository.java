package com.ecomovilidad.infrastructure.persistence.repositories;

import com.ecomovilidad.domain.perfil.PerfilUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PerfilUsuarioJpaRepository extends JpaRepository<PerfilUsuario, UUID> {

    Optional<PerfilUsuario> findByEmailAndTenantId(String email, UUID tenantId);
}
