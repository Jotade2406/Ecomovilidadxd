package com.ecomovilidad.application.rutas.services;

import com.ecomovilidad.application.rutas.dtos.*;
import com.ecomovilidad.application.rutas.mappers.RutaMapper;
import com.ecomovilidad.domain.rutas.Ruta;
import com.ecomovilidad.domain.rutas.RutaVersion;
import com.ecomovilidad.domain.rutas.valueobjects.Coordenada;
import com.ecomovilidad.infrastructure.persistence.repositories.RutaJpaRepository;
import com.ecomovilidad.infrastructure.persistence.repositories.RutaVersionJpaRepository;
import com.ecomovilidad.infrastructure.security.TenantProvider;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Servicio de aplicación para el Bounded Context de Rutas.
 * Consolida todos los Use Cases de .NET en un solo Service (idiomático en Spring).
 * Equivale a: CrearRutaUseCase, ObtenerRutaPorIdUseCase, ObtenerTodasLasRutasUseCase,
 *             ActivarRutaUseCase, SuspenderRutaUseCase, FinalizarRutaUseCase,
 *             AgregarPuntoIntermedioUseCase, EliminarRutaUseCase, ObtenerHistorialRutaUseCase.
 */
@Service
@Transactional
public class RutaService {

    private final RutaJpaRepository rutaRepository;
    private final RutaVersionJpaRepository rutaVersionRepository;
    private final TenantProvider tenantProvider;

    public RutaService(RutaJpaRepository rutaRepository,
                       RutaVersionJpaRepository rutaVersionRepository,
                       TenantProvider tenantProvider) {
        this.rutaRepository = rutaRepository;
        this.rutaVersionRepository = rutaVersionRepository;
        this.tenantProvider = tenantProvider;
    }

    /** Crea una nueva ruta en estado Borrador. */
    public RutaResponse crear(CrearRutaRequest request) {
        var origen = Coordenada.crear(request.origenLatitud(), request.origenLongitud());
        var destino = Coordenada.crear(request.destinoLatitud(), request.destinoLongitud());

        var ruta = Ruta.crear(request.nombre(), origen, destino, request.color());
        ruta.setTenantId(tenantProvider.getTenantId());

        rutaRepository.save(ruta);
        return RutaMapper.toResponse(ruta);
    }

    /** Lista todas las rutas del tenant actual, ordenadas por fecha de creación desc. */
    @Transactional(readOnly = true)
    public List<RutaResponse> obtenerTodas() {
        UUID tenantId = tenantProvider.getTenantId();
        return rutaRepository.findByTenantIdOrderByFechaCreacionDesc(tenantId)
                .stream()
                .map(RutaMapper::toResponse)
                .collect(Collectors.toList());
    }

    /** Obtiene una ruta por su identificador. */
    @Transactional(readOnly = true)
    public RutaResponse obtenerPorId(UUID id) {
        UUID tenantId = tenantProvider.getTenantId();
        var ruta = rutaRepository.findByIdAndTenantId(id, tenantId)
                .orElse(null);
        return ruta != null ? RutaMapper.toResponse(ruta) : null;
    }

    /** Activa una ruta (Borrador → Activa). */
    public RutaResponse activar(UUID rutaId) {
        var ruta = findOrThrow(rutaId);
        ruta.activar();
        rutaRepository.save(ruta);
        return RutaMapper.toResponse(ruta);
    }

    /** Suspende una ruta (Activa → Suspendida). */
    public RutaResponse suspender(UUID rutaId) {
        var ruta = findOrThrow(rutaId);
        ruta.suspender();
        rutaRepository.save(ruta);
        return RutaMapper.toResponse(ruta);
    }

    /** Finaliza una ruta (Activa → Finalizada). */
    public RutaResponse finalizar(UUID rutaId) {
        var ruta = findOrThrow(rutaId);
        ruta.finalizar();
        rutaRepository.save(ruta);
        return RutaMapper.toResponse(ruta);
    }

    /** Agrega puntos intermedios a una ruta en estado Borrador. */
    public RutaResponse agregarPuntosIntermedios(UUID rutaId, List<AgregarPuntoIntermedioRequest> requests) {
        var ruta = findOrThrow(rutaId);
        for (var req : requests) {
            var punto = Coordenada.crear(req.latitud(), req.longitud());
            ruta.agregarPuntoIntermedio(punto);
        }
        rutaRepository.save(ruta);
        return RutaMapper.toResponse(ruta);
    }

    /** Elimina una ruta por su identificador. */
    public void eliminar(UUID rutaId) {
        var ruta = findOrThrow(rutaId);
        rutaRepository.delete(ruta);
    }

    /** Obtiene el historial de versiones de una ruta. */
    @Transactional(readOnly = true)
    public List<RutaVersionResponse> obtenerHistorial(UUID rutaId) {
        return rutaVersionRepository.findByRutaIdOrderByVersionDesc(rutaId)
                .stream()
                .map(v -> new RutaVersionResponse(
                        v.getId(), v.getVersion(), v.getCambioDescripcion(),
                        v.getCreadoPor(), v.getCreadoEn(), v.getSnapshot()))
                .collect(Collectors.toList());
    }

    // ─── Helper ────────────────────────────────────────────────────────

    private Ruta findOrThrow(UUID rutaId) {
        UUID tenantId = tenantProvider.getTenantId();
        return rutaRepository.findByIdAndTenantId(rutaId, tenantId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "No se encontró la ruta con Id '" + rutaId + "'."));
    }
}
