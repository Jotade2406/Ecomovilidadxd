package com.ecomovilidad.infrastructure.core.adapters;

import com.ecomovilidad.core.shared.domain.TenantId;
import com.ecomovilidad.core.transport.domain.model.Trip;
import com.ecomovilidad.core.transport.domain.vo.AssignmentId;
import com.ecomovilidad.core.transport.domain.vo.BusCapacity;
import com.ecomovilidad.core.transport.domain.vo.BusId;
import com.ecomovilidad.core.transport.domain.vo.DriverId;
import com.ecomovilidad.core.transport.domain.vo.RouteId;
import com.ecomovilidad.core.transport.domain.vo.TripId;
import com.ecomovilidad.core.transport.domain.vo.TripStatus;
import com.ecomovilidad.core.transport.port.out.TripRepositoryPort;
import com.ecomovilidad.domain.asignaciones.EstadoAsignacion;
import com.ecomovilidad.domain.flota.Vehiculo;
import com.ecomovilidad.domain.viajes.EstadoViaje;
import com.ecomovilidad.domain.viajes.EstudianteEnViaje;
import com.ecomovilidad.domain.viajes.Viaje;
import com.ecomovilidad.infrastructure.persistence.repositories.AsignacionRutaJpaRepository;
import com.ecomovilidad.infrastructure.persistence.repositories.VehiculoJpaRepository;
import com.ecomovilidad.infrastructure.persistence.repositories.ViajeJpaRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Secondary adapter: bridges {@link Viaje} JPA entity with the Core {@link Trip} aggregate.
 *
 * <p>Compatibility notes:
 * <ul>
 *   <li>The Core's {@link Trip} starts directly in {@code EN_CURSO}. The legacy {@link Viaje}
 *       starts in {@code Programado} and transitions to {@code EnCurso} via {@code iniciarViaje()}.
 *       On first save of a new trip the adapter applies both steps.</li>
 *   <li>{@link BusCapacity} and {@link AssignmentId} are not stored on {@code Viaje};
 *       they are resolved at read-time from adjacent repositories.</li>
 *   <li>Boarded students are stored as {@link EstudianteEnViaje} child entities (orphanRemoval).
 *       New boardings are synced by comparing Core's {@code boardedStudentIds} against persisted list.</li>
 * </ul>
 */
@Component
@Transactional
public class TripRepositoryAdapter implements TripRepositoryPort {

    private final ViajeJpaRepository viajeRepository;
    private final VehiculoJpaRepository vehiculoRepository;
    private final AsignacionRutaJpaRepository asignacionRepository;

    public TripRepositoryAdapter(ViajeJpaRepository viajeRepository,
                                  VehiculoJpaRepository vehiculoRepository,
                                  AsignacionRutaJpaRepository asignacionRepository) {
        this.viajeRepository = viajeRepository;
        this.vehiculoRepository = vehiculoRepository;
        this.asignacionRepository = asignacionRepository;
    }

    // ── TripRepositoryPort ───────────────────────────────────────────────

    @Override
    public Trip save(Trip trip) {
        Viaje viaje = viajeRepository
                .findByIdAndTenantId(trip.getId().value(), trip.getTenantId().value())
                .orElseGet(() -> createJpaViaje(trip));

        syncStatus(viaje, trip.getStatus());
        syncBoardedStudents(viaje, trip.getBoardedStudentIds());

        viajeRepository.save(viaje);
        return trip;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Trip> findById(TripId id, TenantId tenantId) {
        return viajeRepository.findByIdAndTenantId(id.value(), tenantId.value())
                .map(v -> toCore(v, tenantId));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Trip> findActiveByRoute(RouteId routeId, TenantId tenantId) {
        return viajeRepository.findByTenantIdOrderByCreadoEnDesc(tenantId.value())
                .stream()
                .filter(v -> routeId.value().equals(v.getRutaId())
                          && v.getEstado() == EstadoViaje.EnCurso)
                .findFirst()
                .map(v -> toCore(v, tenantId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Trip> findByStatus(TenantId tenantId, TripStatus status) {
        EstadoViaje legacyStatus = toLegacyStatus(status);
        return viajeRepository.findByTenantIdOrderByCreadoEnDesc(tenantId.value())
                .stream()
                .filter(v -> v.getEstado() == legacyStatus)
                .map(v -> toCore(v, tenantId))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsActiveForRoute(RouteId routeId, TenantId tenantId) {
        return viajeRepository.findByTenantIdOrderByCreadoEnDesc(tenantId.value())
                .stream()
                .anyMatch(v -> routeId.value().equals(v.getRutaId())
                            && v.getEstado() == EstadoViaje.EnCurso);
    }

    // ── Mapping: JPA → Core ──────────────────────────────────────────────

    private Trip toCore(Viaje viaje, TenantId tenantId) {
        BusCapacity capacity = vehiculoRepository.findById(viaje.getVehiculoId())
                .map(Vehiculo::getCapacidad)
                .map(BusCapacity::of)
                .orElse(BusCapacity.of(1));

        AssignmentId assignmentId = resolveAssignmentId(viaje, tenantId);

        List<UUID> boardedStudentIds = viaje.getEstudiantesEnViaje()
                .stream()
                .map(EstudianteEnViaje::getEstudianteId)
                .toList();

        var startedAt = viaje.getFechaInicio() != null
                ? viaje.getFechaInicio().atZone(ZoneId.systemDefault()).toInstant()
                : viaje.getCreadoEn().atZone(ZoneId.systemDefault()).toInstant();

        var closedAt = viaje.getFechaFin() != null
                ? viaje.getFechaFin().atZone(ZoneId.systemDefault()).toInstant()
                : null;

        return Trip.reconstitute(
                TripId.of(viaje.getId()),
                tenantId,
                RouteId.of(viaje.getRutaId()),
                assignmentId,
                BusId.of(viaje.getVehiculoId()),
                DriverId.of(viaje.getConductorId()),
                capacity,
                toCoreStatus(viaje.getEstado()),
                boardedStudentIds,
                startedAt,
                closedAt
        );
    }

    // ── Mapping: Core → JPA ──────────────────────────────────────────────

    private Viaje createJpaViaje(Trip trip) {
        Viaje viaje = Viaje.crear(
                trip.getRouteId().value(),
                trip.getBusId().value(),
                trip.getDriverId().value());
        viaje.setTenantId(trip.getTenantId().value());
        // Core trip starts EN_CURSO; legacy starts Programado → transition immediately
        viaje.iniciarViaje();
        return viaje;
    }

    private void syncStatus(Viaje viaje, TripStatus targetStatus) {
        if (viaje.getEstado() == toLegacyStatus(targetStatus)) return;

        if (targetStatus == TripStatus.COMPLETADO) {
            viaje.completarViaje();
        } else if (targetStatus == TripStatus.CANCELADO) {
            viaje.cancelarViaje();
        }
    }

    private void syncBoardedStudents(Viaje viaje, List<UUID> coreStudentIds) {
        Set<UUID> alreadyPersisted = viaje.getEstudiantesEnViaje()
                .stream()
                .map(EstudianteEnViaje::getEstudianteId)
                .collect(Collectors.toSet());

        int nextOrder = viaje.getEstudiantesEnViaje().size();
        for (UUID studentId : coreStudentIds) {
            if (!alreadyPersisted.contains(studentId)) {
                viaje.agregarEstudiante(
                        EstudianteEnViaje.crear(viaje.getId(), studentId, nextOrder++));
            }
        }
    }

    // ── Status conversions ───────────────────────────────────────────────

    private TripStatus toCoreStatus(EstadoViaje estado) {
        if (estado == EstadoViaje.Programado) return TripStatus.PROGRAMADO;
        if (estado == EstadoViaje.EnCurso)    return TripStatus.EN_CURSO;
        if (estado == EstadoViaje.Completado) return TripStatus.COMPLETADO;
        return TripStatus.CANCELADO;
    }

    private EstadoViaje toLegacyStatus(TripStatus status) {
        if (status == TripStatus.PROGRAMADO)  return EstadoViaje.Programado;
        if (status == TripStatus.EN_CURSO)    return EstadoViaje.EnCurso;
        if (status == TripStatus.COMPLETADO)  return EstadoViaje.Completado;
        return EstadoViaje.Cancelado;
    }

    // ── Helpers ──────────────────────────────────────────────────────────

    private AssignmentId resolveAssignmentId(Viaje viaje, TenantId tenantId) {
        return asignacionRepository
                .findByEstadoAndTenantId(EstadoAsignacion.ACTIVA, tenantId.value())
                .stream()
                .filter(a -> viaje.getRutaId().equals(a.getRutaId())
                          && viaje.getVehiculoId().equals(a.getVehiculoId()))
                .findFirst()
                .map(a -> AssignmentId.of(a.getId()))
                .orElse(AssignmentId.newId()); // no active assignment found (trip already closed)
    }
}
