package com.ecomovilidad.infrastructure.persistence.repositories;

import com.ecomovilidad.domain.rutas.RutaVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RutaVersionJpaRepository extends JpaRepository<RutaVersion, UUID> {

    List<RutaVersion> findByRutaIdOrderByVersionDesc(UUID rutaId);
}
