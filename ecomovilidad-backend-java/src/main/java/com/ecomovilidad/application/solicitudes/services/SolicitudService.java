package com.ecomovilidad.application.solicitudes.services;

import com.ecomovilidad.application.solicitudes.dtos.*;
import com.ecomovilidad.domain.solicitudes.SolicitudBusEmergencia;
import com.ecomovilidad.domain.solicitudes.SolicitudCambioBus;
import com.ecomovilidad.infrastructure.persistence.mongodb.SolicitudBusEmergenciaMongoRepository;
import com.ecomovilidad.infrastructure.persistence.mongodb.SolicitudCambioBusMongoRepository;
import com.ecomovilidad.infrastructure.security.TenantProvider;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SolicitudService {

    private final SolicitudCambioBusMongoRepository cambioBusRepository;
    private final SolicitudBusEmergenciaMongoRepository emergenciaRepository;
    private final TenantProvider tenantProvider;

    public SolicitudService(SolicitudCambioBusMongoRepository cambioBusRepository,
                            SolicitudBusEmergenciaMongoRepository emergenciaRepository,
                            TenantProvider tenantProvider) {
        this.cambioBusRepository = cambioBusRepository;
        this.emergenciaRepository = emergenciaRepository;
        this.tenantProvider = tenantProvider;
    }

    // ── Cambio de Bus ────────────────────────────────────────────────────

    public SolicitudCambioBusResponse crearCambioBus(CrearSolicitudCambioBusRequest request) {
        UUID tenantId = tenantProvider.getTenantId();
        var solicitud = SolicitudCambioBus.crear(tenantId, request.estudianteId(),
                request.busActualId(), request.busDeseadoId(), request.motivo());
        cambioBusRepository.save(solicitud);
        return toCambioBusResponse(solicitud);
    }

    public List<SolicitudCambioBusResponse> obtenerCambiosBus() {
        UUID tenantId = tenantProvider.getTenantId();
        return cambioBusRepository.findByTenantIdOrderByFechaSolicitudDesc(tenantId)
                .stream().map(this::toCambioBusResponse).collect(Collectors.toList());
    }

    public List<SolicitudCambioBusResponse> obtenerCambiosBusPorEstudiante(UUID estudianteId) {
        UUID tenantId = tenantProvider.getTenantId();
        return cambioBusRepository.findByEstudianteIdAndTenantIdOrderByFechaSolicitudDesc(estudianteId, tenantId)
                .stream().map(this::toCambioBusResponse).collect(Collectors.toList());
    }

    public SolicitudCambioBusResponse resolverCambioBus(String id, ResolverSolicitudRequest request) {
        var solicitud = cambioBusRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Solicitud de cambio de bus '" + id + "' no encontrada."));
        solicitud.resolver(request.estado(), request.notas());
        cambioBusRepository.save(solicitud);
        return toCambioBusResponse(solicitud);
    }

    // ── Bus de Emergencia ────────────────────────────────────────────────

    public SolicitudEmergenciaResponse crearEmergencia(CrearSolicitudEmergenciaRequest request) {
        UUID tenantId = tenantProvider.getTenantId();
        var solicitud = SolicitudBusEmergencia.crear(tenantId, request.estudianteId(),
                request.descripcion(), request.ubicacion());
        emergenciaRepository.save(solicitud);
        return toEmergenciaResponse(solicitud);
    }

    public List<SolicitudEmergenciaResponse> obtenerEmergencias() {
        UUID tenantId = tenantProvider.getTenantId();
        return emergenciaRepository.findByTenantIdOrderByFechaSolicitudDesc(tenantId)
                .stream().map(this::toEmergenciaResponse).collect(Collectors.toList());
    }

    public List<SolicitudEmergenciaResponse> obtenerEmergenciasPorEstudiante(UUID estudianteId) {
        UUID tenantId = tenantProvider.getTenantId();
        return emergenciaRepository.findByEstudianteIdAndTenantIdOrderByFechaSolicitudDesc(estudianteId, tenantId)
                .stream().map(this::toEmergenciaResponse).collect(Collectors.toList());
    }

    public SolicitudEmergenciaResponse atenderEmergencia(String id) {
        var solicitud = emergenciaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Solicitud de emergencia '" + id + "' no encontrada."));
        solicitud.atender();
        emergenciaRepository.save(solicitud);
        return toEmergenciaResponse(solicitud);
    }

    // ─── Helpers ────────────────────────────────────────────────────────

    private SolicitudCambioBusResponse toCambioBusResponse(SolicitudCambioBus s) {
        return new SolicitudCambioBusResponse(
                s.getId(), s.getTenantId(), s.getEstudianteId(),
                s.getBusActualId(), s.getBusDeseadoId(), s.getMotivo(),
                s.getEstado(), s.getFechaSolicitud(), s.getFechaResolucion(), s.getNotas());
    }

    private SolicitudEmergenciaResponse toEmergenciaResponse(SolicitudBusEmergencia s) {
        return new SolicitudEmergenciaResponse(
                s.getId(), s.getTenantId(), s.getEstudianteId(),
                s.getDescripcion(), s.getUbicacion(), s.getEstado(),
                s.getFechaSolicitud(), s.getFechaAtencion());
    }
}
