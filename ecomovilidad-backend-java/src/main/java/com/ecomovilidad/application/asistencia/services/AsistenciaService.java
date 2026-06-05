package com.ecomovilidad.application.asistencia.services;

import com.ecomovilidad.application.asistencia.dtos.AsistenciaResponse;
import com.ecomovilidad.application.asistencia.dtos.RegistrarAsistenciaRequest;
import com.ecomovilidad.domain.asistencia.RegistroAsistencia;
import com.ecomovilidad.infrastructure.persistence.repositories.EstudianteJpaRepository;
import com.ecomovilidad.infrastructure.persistence.repositories.RegistroAsistenciaJpaRepository;
import com.ecomovilidad.infrastructure.security.TenantProvider;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class AsistenciaService {

    private final RegistroAsistenciaJpaRepository asistenciaRepository;
    private final EstudianteJpaRepository estudianteRepository;
    private final TenantProvider tenantProvider;

    public AsistenciaService(RegistroAsistenciaJpaRepository asistenciaRepository,
                             EstudianteJpaRepository estudianteRepository,
                             TenantProvider tenantProvider) {
        this.asistenciaRepository = asistenciaRepository;
        this.estudianteRepository = estudianteRepository;
        this.tenantProvider = tenantProvider;
    }

    public AsistenciaResponse registrar(RegistrarAsistenciaRequest request) {
        UUID tenantId = tenantProvider.getTenantId();

        var estudiante = estudianteRepository.findByIdAndTenantId(request.estudianteId(), tenantId)
                .orElseThrow(() -> new EntityNotFoundException("Estudiante '" + request.estudianteId() + "' no existe."));

        // Idempotencia: no registrar duplicados para el mismo viaje + tipo
        var existente = asistenciaRepository.findByEstudianteIdAndViajeIdAndTipo(
                request.estudianteId(), request.viajeId(), request.tipo());
        if (existente.isPresent()) {
            return toResponse(existente.get(), estudiante.getNombre());
        }

        var registro = RegistroAsistencia.registrar(
                request.estudianteId(), request.viajeId(),
                request.conductorId(), request.tipo(), request.codigoQrEscaneado());
        registro.setTenantId(tenantId);
        asistenciaRepository.save(registro);

        return toResponse(registro, estudiante.getNombre());
    }

    @Transactional(readOnly = true)
    public List<AsistenciaResponse> obtenerPorViaje(UUID viajeId) {
        UUID tenantId = tenantProvider.getTenantId();
        return asistenciaRepository.findByViajeIdAndTenantId(viajeId, tenantId)
                .stream().map(r -> {
                    String nombre = estudianteRepository.findByIdAndTenantId(r.getEstudianteId(), tenantId)
                            .map(e -> e.getNombre()).orElse("Desconocido");
                    return toResponse(r, nombre);
                }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AsistenciaResponse> obtenerPorEstudiante(UUID estudianteId) {
        UUID tenantId = tenantProvider.getTenantId();
        var estudiante = estudianteRepository.findByIdAndTenantId(estudianteId, tenantId)
                .orElseThrow(() -> new EntityNotFoundException("Estudiante '" + estudianteId + "' no existe."));
        return asistenciaRepository.findByEstudianteIdAndTenantIdOrderByHoraRegistroDesc(estudianteId, tenantId)
                .stream().map(r -> toResponse(r, estudiante.getNombre())).collect(Collectors.toList());
    }

    private AsistenciaResponse toResponse(RegistroAsistencia r, String nombreEstudiante) {
        return new AsistenciaResponse(
                r.getId(), r.getEstudianteId(), nombreEstudiante,
                r.getViajeId(), r.getConductorId(), r.getTipo(),
                r.getHoraRegistro(), r.getCodigoQrEscaneado());
    }
}
