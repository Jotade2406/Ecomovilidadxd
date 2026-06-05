package com.ecomovilidad.application.viajes.services;

import com.ecomovilidad.application.viajes.dtos.*;
import com.ecomovilidad.domain.comunidad.Estudiante;
import com.ecomovilidad.domain.rutas.valueobjects.EstadoRuta;
import com.ecomovilidad.domain.viajes.EstadoViaje;
import com.ecomovilidad.domain.viajes.EstudianteEnViaje;
import com.ecomovilidad.domain.viajes.Viaje;
import com.ecomovilidad.infrastructure.persistence.repositories.*;
import com.ecomovilidad.infrastructure.security.TenantProvider;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Servicio de aplicación para el Bounded Context de Viajes.
 * Sprint 1: IniciarViajeUseCase, ObtenerViajesUseCase, CompletarViaje, CancelarViaje.
 * Sprint 2: AsignarEstudiantes, CerrarViaje, ObtenerEstudiantesEnViaje, TransporteDescenso.
 */
@Service
@Transactional
public class ViajeService {

    private final ViajeJpaRepository viajeRepository;
    private final RutaJpaRepository rutaRepository;
    private final VehiculoJpaRepository vehiculoRepository;
    private final ConductorJpaRepository conductorRepository;
    private final EstudianteJpaRepository estudianteRepository;
    private final EstudianteEnViajeJpaRepository estudianteEnViajeRepository;
    private final TenantProvider tenantProvider;

    public ViajeService(ViajeJpaRepository viajeRepository,
                        RutaJpaRepository rutaRepository,
                        VehiculoJpaRepository vehiculoRepository,
                        ConductorJpaRepository conductorRepository,
                        EstudianteJpaRepository estudianteRepository,
                        EstudianteEnViajeJpaRepository estudianteEnViajeRepository,
                        TenantProvider tenantProvider) {
        this.viajeRepository = viajeRepository;
        this.rutaRepository = rutaRepository;
        this.vehiculoRepository = vehiculoRepository;
        this.conductorRepository = conductorRepository;
        this.estudianteRepository = estudianteRepository;
        this.estudianteEnViajeRepository = estudianteEnViajeRepository;
        this.tenantProvider = tenantProvider;
    }

    // ═══════════════════════════════════════════════════════════════════
    // SPRINT 1 — Métodos existentes
    // ═══════════════════════════════════════════════════════════════════

    /** Crea e inicia un viaje: asigna conductor + vehículo a una ruta activa. */
    public ViajeResponse iniciarViaje(IniciarViajeRequest request) {
        UUID tenantId = tenantProvider.getTenantId();

        // Validar Ruta existe y está Activa
        var ruta = rutaRepository.findByIdAndTenantId(request.rutaId(), tenantId)
                .orElseThrow(() -> new EntityNotFoundException("La ruta '" + request.rutaId() + "' no existe."));

        if (!ruta.getEstadoRuta().equals(EstadoRuta.ACTIVA))
            throw new IllegalStateException(
                    "La ruta '" + ruta.getNombre() + "' no está activa (estado actual: " +
                    ruta.getEstado() + "). Solo rutas activas pueden iniciar viajes.");

        // Validar Vehículo existe
        var vehiculo = vehiculoRepository.findByIdAndTenantId(request.vehiculoId(), tenantId)
                .orElseThrow(() -> new EntityNotFoundException("El vehículo '" + request.vehiculoId() + "' no existe."));

        if (!"Activo".equals(vehiculo.getEstado()))
            throw new IllegalStateException(
                    "El vehículo '" + vehiculo.getPlaca() + "' no está disponible (estado: " + vehiculo.getEstado() + ").");

        // Validar Conductor existe
        conductorRepository.findByIdAndTenantId(request.conductorId(), tenantId)
                .orElseThrow(() -> new EntityNotFoundException("El conductor '" + request.conductorId() + "' no existe."));

        // Crear e iniciar viaje
        var viaje = Viaje.crear(request.rutaId(), request.vehiculoId(), request.conductorId());
        viaje.iniciarViaje();
        viaje.setTenantId(tenantId);

        viajeRepository.save(viaje);
        return toResponse(viaje);
    }

    /** Lista todos los viajes del tenant actual. */
    @Transactional(readOnly = true)
    public List<ViajeResponse> obtenerTodos() {
        UUID tenantId = tenantProvider.getTenantId();
        return viajeRepository.findByTenantIdOrderByCreadoEnDesc(tenantId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /** Obtiene un viaje por su identificador. */
    @Transactional(readOnly = true)
    public ViajeResponse obtenerPorId(UUID id) {
        UUID tenantId = tenantProvider.getTenantId();
        return viajeRepository.findByIdAndTenantId(id, tenantId)
                .map(this::toResponse)
                .orElse(null);
    }

    /** Completa un viaje en curso. */
    public ViajeResponse completarViaje(UUID viajeId) {
        var viaje = findViajeOrThrow(viajeId);
        viaje.completarViaje();
        viajeRepository.save(viaje);
        return toResponse(viaje);
    }

    /** Cancela un viaje programado o en curso. */
    public ViajeResponse cancelarViaje(UUID viajeId) {
        var viaje = findViajeOrThrow(viajeId);
        viaje.cancelarViaje();
        viajeRepository.save(viaje);
        return toResponse(viaje);
    }

    // ═══════════════════════════════════════════════════════════════════
    // SPRINT 2 — Asignar estudiantes, cerrar viaje, tracking
    // ═══════════════════════════════════════════════════════════════════

    /** Asigna una lista de estudiantes a un viaje en curso. */
    public AsignarEstudiantesResponse asignarEstudiantes(UUID viajeId, AsignarEstudiantesRequest request) {
        UUID tenantId = tenantProvider.getTenantId();
        var viaje = findViajeOrThrow(viajeId);

        if (viaje.getEstado() != EstadoViaje.EnCurso && viaje.getEstado() != EstadoViaje.Programado)
            throw new IllegalStateException("Solo se pueden asignar estudiantes a viajes Programados o EnCurso.");

        if (request.estudianteIds() == null || request.estudianteIds().isEmpty())
            throw new IllegalArgumentException("La lista de estudiantes no puede estar vacía.");

        // Eliminar duplicados
        var idsUnicos = request.estudianteIds().stream().distinct().toList();

        List<EstudianteEnViajeResponse> asignados = new ArrayList<>();
        int orden = viaje.getCantidadEstudiantes();

        for (UUID estudianteId : idsUnicos) {
            // Verificar que no esté ya asignado
            var yaAsignado = estudianteEnViajeRepository
                    .findByViajeIdAndEstudianteIdAndTenantId(viajeId, estudianteId, tenantId);
            if (yaAsignado.isPresent()) continue; // skip duplicado silencioso

            // Validar que estudiante existe
            var estudiante = estudianteRepository.findByIdAndTenantId(estudianteId, tenantId)
                    .orElseThrow(() -> new EntityNotFoundException("El estudiante '" + estudianteId + "' no existe."));

            orden++;
            var ev = EstudianteEnViaje.crear(viajeId, estudianteId, orden);
            ev.setTenantId(tenantId);

            estudianteEnViajeRepository.save(ev);
            viaje.agregarEstudiante(ev);

            asignados.add(toEstudianteEnViajeResponse(ev, estudiante));
        }

        return new AsignarEstudiantesResponse(viajeId, asignados.size(), asignados);
    }

    /** Cierra un viaje en curso → estado COMPLETADO + ViajeCerradoEvent. */
    public CerrarViajeResponse cerrarViaje(UUID viajeId) {
        var viaje = findViajeOrThrow(viajeId);
        viaje.completarViaje(); // dispara ViajeCerradoEvent internamente
        viajeRepository.save(viaje);

        return new CerrarViajeResponse(
                viaje.getId(),
                viaje.getEstado().toString(),
                viaje.getFechaFin(),
                viaje.getCantidadEstudiantes()
        );
    }

    /** Obtiene la lista de estudiantes asignados a un viaje. */
    @Transactional(readOnly = true)
    public List<EstudianteEnViajeResponse> obtenerEstudiantesEnViaje(UUID viajeId) {
        UUID tenantId = tenantProvider.getTenantId();

        // Validar que viaje existe
        findViajeOrThrow(viajeId);

        return estudianteEnViajeRepository.findByViajeIdAndTenantId(viajeId, tenantId)
                .stream()
                .map(ev -> {
                    var estudiante = estudianteRepository.findById(ev.getEstudianteId()).orElse(null);
                    return toEstudianteEnViajeResponse(ev, estudiante);
                })
                .collect(Collectors.toList());
    }

    /** Marca un estudiante como EN_TRANSPORTE dentro de un viaje. */
    public EstudianteEnViajeResponse marcarEstudianteEnTransporte(UUID viajeId, UUID estudianteId) {
        UUID tenantId = tenantProvider.getTenantId();
        var ev = estudianteEnViajeRepository
                .findByViajeIdAndEstudianteIdAndTenantId(viajeId, estudianteId, tenantId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "No se encontró la asignación del estudiante '" + estudianteId + "' en el viaje '" + viajeId + "'."));

        ev.marcarEnTransporte();
        estudianteEnViajeRepository.save(ev);

        var estudiante = estudianteRepository.findById(estudianteId).orElse(null);
        return toEstudianteEnViajeResponse(ev, estudiante);
    }

    /** Marca un estudiante como DESCENDIDO dentro de un viaje. */
    public EstudianteEnViajeResponse marcarEstudianteDescendido(UUID viajeId, UUID estudianteId) {
        UUID tenantId = tenantProvider.getTenantId();
        var ev = estudianteEnViajeRepository
                .findByViajeIdAndEstudianteIdAndTenantId(viajeId, estudianteId, tenantId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "No se encontró la asignación del estudiante '" + estudianteId + "' en el viaje '" + viajeId + "'."));

        ev.marcarDescendido();
        estudianteEnViajeRepository.save(ev);

        var estudiante = estudianteRepository.findById(estudianteId).orElse(null);
        return toEstudianteEnViajeResponse(ev, estudiante);
    }

    // ═══════════════════════════════════════════════════════════════════
    // Helpers
    // ═══════════════════════════════════════════════════════════════════

    private Viaje findViajeOrThrow(UUID viajeId) {
        UUID tenantId = tenantProvider.getTenantId();
        return viajeRepository.findByIdAndTenantId(viajeId, tenantId)
                .orElseThrow(() -> new EntityNotFoundException("El viaje '" + viajeId + "' no existe."));
    }

    private ViajeResponse toResponse(Viaje v) {
        return new ViajeResponse(
                v.getId(), v.getRutaId(), v.getVehiculoId(), v.getConductorId(),
                v.getEstado().toString(), v.getFechaInicio(), v.getFechaFin(), v.getCreadoEn());
    }

    private EstudianteEnViajeResponse toEstudianteEnViajeResponse(EstudianteEnViaje ev, Estudiante estudiante) {
        return new EstudianteEnViajeResponse(
                ev.getId(),
                ev.getViajeId(),
                ev.getEstudianteId(),
                estudiante != null ? estudiante.getNombre() : "Desconocido",
                estudiante != null ? estudiante.getParadaAsignada() : "Sin parada",
                ev.getEstado().toString(),
                ev.getHoraAsignacion(),
                ev.getHoraDescenso()
        );
    }
}
