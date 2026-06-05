package com.ecomovilidad.infrastructure.persistence.mongodb;

import com.ecomovilidad.domain.solicitudes.EstadoSolicitud;
import com.ecomovilidad.domain.solicitudes.SolicitudCambioBus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SolicitudCambioBusMongoRepository extends MongoRepository<SolicitudCambioBus, String> {

    List<SolicitudCambioBus> findByTenantIdOrderByFechaSolicitudDesc(UUID tenantId);

    List<SolicitudCambioBus> findByEstudianteIdAndTenantIdOrderByFechaSolicitudDesc(UUID estudianteId, UUID tenantId);

    List<SolicitudCambioBus> findByEstadoAndTenantId(EstadoSolicitud estado, UUID tenantId);
}
