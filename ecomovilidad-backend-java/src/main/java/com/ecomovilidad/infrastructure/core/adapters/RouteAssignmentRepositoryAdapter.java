package com.ecomovilidad.infrastructure.core.adapters;

import com.ecomovilidad.core.shared.domain.TenantId;
import com.ecomovilidad.core.transport.domain.model.RouteAssignment;
import com.ecomovilidad.core.transport.domain.vo.AssignmentId;
import com.ecomovilidad.core.transport.domain.vo.BusCapacity;
import com.ecomovilidad.core.transport.domain.vo.BusId;
import com.ecomovilidad.core.transport.domain.vo.DriverId;
import com.ecomovilidad.core.transport.domain.vo.RouteId;
import com.ecomovilidad.core.transport.port.out.RouteAssignmentRepositoryPort;
import com.ecomovilidad.domain.asignaciones.AsignacionRuta;
import com.ecomovilidad.domain.asignaciones.EstadoAsignacion;
import com.ecomovilidad.domain.flota.Vehiculo;
import com.ecomovilidad.infrastructure.persistence.repositories.AsignacionRutaJpaRepository;
import com.ecomovilidad.infrastructure.persistence.repositories.VehiculoJpaRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneId;
import java.util.Optional;

/**
 * Secondary adapter: bridges {@link AsignacionRuta} JPA entity with the Core
 * {@link RouteAssignment} domain entity.
 *
 * <p>Compatibility notes:
 * <ul>
 *   <li>The legacy model tracks active/inactive via {@link EstadoAsignacion}.
 *       The Core uses a boolean {@code active} flag — they map 1-to-1.</li>
 *   <li>The legacy model does not store {@code revokedAt} — reconstituted as {@code null}.</li>
 *   <li>{@link BusCapacity} is not stored in the assignment; it is resolved from the Vehiculo.</li>
 * </ul>
 */
@Component
@Transactional
public class RouteAssignmentRepositoryAdapter implements RouteAssignmentRepositoryPort {

    private final AsignacionRutaJpaRepository asignacionRepository;
    private final VehiculoJpaRepository vehiculoRepository;

    public RouteAssignmentRepositoryAdapter(AsignacionRutaJpaRepository asignacionRepository,
                                             VehiculoJpaRepository vehiculoRepository) {
        this.asignacionRepository = asignacionRepository;
        this.vehiculoRepository = vehiculoRepository;
    }

    // ── RouteAssignmentRepositoryPort ────────────────────────────────────

    @Override
    public RouteAssignment save(RouteAssignment assignment) {
        AsignacionRuta jpa = asignacionRepository
                .findByIdAndTenantId(assignment.getId().value(), assignment.getTenantId().value())
                .orElseGet(() -> {
                    AsignacionRuta newJpa = AsignacionRuta.crear(
                            assignment.getRouteId().value(),
                            assignment.getBusId().value(),
                            assignment.getDriverId().value());
                    newJpa.setTenantId(assignment.getTenantId().value());
                    return newJpa;
                });

        if (!assignment.isActive() && jpa.getEstado() == EstadoAsignacion.ACTIVA) {
            jpa.desactivar();
        }

        asignacionRepository.save(jpa);
        return assignment;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<RouteAssignment> findActiveByRoute(RouteId routeId, TenantId tenantId) {
        return asignacionRepository
                .findByEstadoAndTenantId(EstadoAsignacion.ACTIVA, tenantId.value())
                .stream()
                .filter(a -> routeId.value().equals(a.getRutaId()))
                .findFirst()
                .map(a -> toCore(a, tenantId));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<RouteAssignment> findById(AssignmentId id, TenantId tenantId) {
        return asignacionRepository.findByIdAndTenantId(id.value(), tenantId.value())
                .map(a -> toCore(a, tenantId));
    }

    // ── Mapping ──────────────────────────────────────────────────────────

    private RouteAssignment toCore(AsignacionRuta jpa, TenantId tenantId) {
        BusCapacity capacity = vehiculoRepository.findById(jpa.getVehiculoId())
                .map(Vehiculo::getCapacidad)
                .map(BusCapacity::of)
                .orElse(BusCapacity.of(1));

        return RouteAssignment.reconstitute(
                AssignmentId.of(jpa.getId()),
                tenantId,
                RouteId.of(jpa.getRutaId()),
                BusId.of(jpa.getVehiculoId()),
                DriverId.of(jpa.getConductorId()),
                capacity,
                jpa.getEstado() == EstadoAsignacion.ACTIVA,
                jpa.getFechaCreacion().atZone(ZoneId.systemDefault()).toInstant(),
                null // revokedAt not stored in legacy model
        );
    }
}
