package com.ecomovilidad.application.asignaciones.services;

import com.ecomovilidad.application.asignaciones.dtos.AsignacionRutaResponse;
import com.ecomovilidad.application.asignaciones.dtos.CrearAsignacionRequest;
import com.ecomovilidad.domain.asignaciones.AsignacionRuta;
import com.ecomovilidad.domain.asignaciones.EstadoAsignacion;
import com.ecomovilidad.infrastructure.persistence.repositories.*;
import com.ecomovilidad.infrastructure.security.TenantProvider;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Servicio para gestionar asignaciones fijas de Ruta-Vehículo-Conductor.
 */
@Service
@Transactional
public class AsignacionService {

    private final AsignacionRutaJpaRepository asignacionRepository;
    private final RutaJpaRepository rutaRepository;
    private final VehiculoJpaRepository vehiculoRepository;
    private final ConductorJpaRepository conductorRepository;
    private final TenantProvider tenantProvider;

    public AsignacionService(AsignacionRutaJpaRepository asignacionRepository,
                             RutaJpaRepository rutaRepository,
                             VehiculoJpaRepository vehiculoRepository,
                             ConductorJpaRepository conductorRepository,
                             TenantProvider tenantProvider) {
        this.asignacionRepository = asignacionRepository;
        this.rutaRepository = rutaRepository;
        this.vehiculoRepository = vehiculoRepository;
        this.conductorRepository = conductorRepository;
        this.tenantProvider = tenantProvider;
    }

    /** Crea una nueva asignación. Valida que el vehículo no tenga otra asignación activa. */
    public AsignacionRutaResponse crear(CrearAsignacionRequest request) {
        UUID tenantId = tenantProvider.getTenantId();

        // Validar que entidades existen
        var ruta = rutaRepository.findByIdAndTenantId(request.rutaId(), tenantId)
                .orElseThrow(() -> new EntityNotFoundException("Ruta '" + request.rutaId() + "' no existe."));

        var vehiculo = vehiculoRepository.findByIdAndTenantId(request.vehiculoId(), tenantId)
                .orElseThrow(() -> new EntityNotFoundException("Vehículo '" + request.vehiculoId() + "' no existe."));

        var conductor = conductorRepository.findByIdAndTenantId(request.conductorId(), tenantId)
                .orElseThrow(() -> new EntityNotFoundException("Conductor '" + request.conductorId() + "' no existe."));

        // Validar unicidad: vehículo no puede tener otra asignación ACTIVA
        var existente = asignacionRepository
                .findByVehiculoIdAndEstadoAndTenantId(request.vehiculoId(), EstadoAsignacion.ACTIVA, tenantId);
        if (existente.isPresent()) {
            throw new IllegalStateException(
                    "El vehículo '" + vehiculo.getPlaca() + "' ya tiene una asignación activa.");
        }

        var asignacion = AsignacionRuta.crear(request.rutaId(), request.vehiculoId(), request.conductorId());
        asignacion.setTenantId(tenantId);
        asignacionRepository.save(asignacion);

        return toResponse(asignacion, ruta.getNombre(), vehiculo.getPlaca(), conductor.getNombre());
    }

    /** Lista todas las asignaciones del tenant. */
    @Transactional(readOnly = true)
    public List<AsignacionRutaResponse> obtenerTodas() {
        UUID tenantId = tenantProvider.getTenantId();
        return asignacionRepository.findByTenantIdOrderByFechaCreacionDesc(tenantId)
                .stream().map(this::enrichResponse).collect(Collectors.toList());
    }

    /** Lista solo las asignaciones activas. */
    @Transactional(readOnly = true)
    public List<AsignacionRutaResponse> obtenerActivas() {
        UUID tenantId = tenantProvider.getTenantId();
        return asignacionRepository.findByEstadoAndTenantId(EstadoAsignacion.ACTIVA, tenantId)
                .stream().map(this::enrichResponse).collect(Collectors.toList());
    }

    /** Desactiva una asignación. */
    public AsignacionRutaResponse desactivar(UUID asignacionId) {
        var asignacion = findOrThrow(asignacionId);
        asignacion.desactivar();
        asignacionRepository.save(asignacion);
        return enrichResponse(asignacion);
    }

    /** Elimina una asignación. */
    public void eliminar(UUID asignacionId) {
        var asignacion = findOrThrow(asignacionId);
        asignacionRepository.delete(asignacion);
    }

    // ─── Helpers ────────────────────────────────────────────────────────

    private AsignacionRuta findOrThrow(UUID id) {
        UUID tenantId = tenantProvider.getTenantId();
        return asignacionRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new EntityNotFoundException("Asignación '" + id + "' no existe."));
    }

    private AsignacionRutaResponse enrichResponse(AsignacionRuta a) {
        String nombreRuta = rutaRepository.findByIdAndTenantId(a.getRutaId(), a.getTenantId())
                .map(r -> r.getNombre()).orElse("Ruta desconocida");
        String placa = vehiculoRepository.findByIdAndTenantId(a.getVehiculoId(), a.getTenantId())
                .map(v -> v.getPlaca()).orElse("Sin placa");
        String nombreConductor = conductorRepository.findByIdAndTenantId(a.getConductorId(), a.getTenantId())
                .map(c -> c.getNombre()).orElse("Sin conductor");
        return toResponse(a, nombreRuta, placa, nombreConductor);
    }

    private AsignacionRutaResponse toResponse(AsignacionRuta a, String nombreRuta,
                                               String placa, String nombreConductor) {
        return new AsignacionRutaResponse(
                a.getId(), a.getRutaId(), a.getVehiculoId(), a.getConductorId(),
                a.getEstado().toString(), nombreRuta, placa, nombreConductor,
                a.getFechaCreacion());
    }
}
