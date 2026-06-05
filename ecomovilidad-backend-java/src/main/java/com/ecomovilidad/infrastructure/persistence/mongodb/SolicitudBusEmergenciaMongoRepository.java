package com.ecomovilidad.infrastructure.persistence.mongodb;

import com.ecomovilidad.domain.solicitudes.EstadoSolicitud;
import com.ecomovilidad.domain.solicitudes.SolicitudBusEmergencia;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SolicitudBusEmergenciaMongoRepository extends MongoRepository<SolicitudBusEmergencia, String> {

    List<SolicitudBusEmergencia> findByTenantIdOrderByFechaSolicitudDesc(UUID tenantId);

    List<SolicitudBusEmergencia> findByEstudianteIdAndTenantIdOrderByFechaSolicitudDesc(UUID estudianteId, UUID tenantId);

    List<SolicitudBusEmergencia> findByEstadoAndTenantId(EstadoSolicitud estado, UUID tenantId);
}
