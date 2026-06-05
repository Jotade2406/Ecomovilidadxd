package com.ecomovilidad.application.comunidad.services;

import com.ecomovilidad.application.comunidad.dtos.CrearEstudianteCommand;
import com.ecomovilidad.application.comunidad.dtos.EstudianteDto;
import com.ecomovilidad.domain.comunidad.Estudiante;
import com.ecomovilidad.infrastructure.persistence.repositories.EstudianteJpaRepository;
import com.ecomovilidad.infrastructure.security.TenantProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Casos de uso de gestión de comunidad (estudiantes / tutores).
 * Equivale a GestionComunidadUseCases.cs en .NET.
 */
@Service
@Transactional
public class ComunidadService {

    private final EstudianteJpaRepository estudianteRepository;
    private final TenantProvider tenantProvider;

    public ComunidadService(EstudianteJpaRepository estudianteRepository, TenantProvider tenantProvider) {
        this.estudianteRepository = estudianteRepository;
        this.tenantProvider = tenantProvider;
    }

    /** Registra un nuevo estudiante en la comunidad del tenant actual. */
    public EstudianteDto crearEstudiante(CrearEstudianteCommand command) {
        var estudiante = Estudiante.crear(command.nombre(), command.tutorId(), command.paradaAsignada());
        estudiante.setTenantId(tenantProvider.getTenantId());
        estudianteRepository.save(estudiante);
        return mapToDto(estudiante);
    }

    /** Obtiene todos los estudiantes del tenant actual. */
    @Transactional(readOnly = true)
    public List<EstudianteDto> obtenerEstudiantes() {
        UUID tenantId = tenantProvider.getTenantId();
        return estudianteRepository.findByTenantId(tenantId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private EstudianteDto mapToDto(Estudiante e) {
        return new EstudianteDto(e.getId(), e.getNombre(), e.getCodigoQR(),
                e.getQrCodeTTL(), e.getTutorId(), e.getParadaAsignada());
    }
}
