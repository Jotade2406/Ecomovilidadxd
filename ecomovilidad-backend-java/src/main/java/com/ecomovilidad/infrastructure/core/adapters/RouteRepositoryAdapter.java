package com.ecomovilidad.infrastructure.core.adapters;

import com.ecomovilidad.core.shared.domain.TenantId;
import com.ecomovilidad.core.transport.domain.model.Route;
import com.ecomovilidad.core.transport.domain.vo.Coordinate;
import com.ecomovilidad.core.transport.domain.vo.RouteId;
import com.ecomovilidad.core.transport.domain.vo.RouteStatus;
import com.ecomovilidad.core.transport.domain.vo.RouteWaypoint;
import com.ecomovilidad.core.transport.port.out.RouteRepositoryPort;
import com.ecomovilidad.domain.rutas.Ruta;
import com.ecomovilidad.domain.rutas.valueobjects.Coordenada;
import com.ecomovilidad.domain.rutas.valueobjects.EstadoRuta;
import com.ecomovilidad.infrastructure.persistence.repositories.RutaJpaRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.IntStream;

/**
 * Secondary adapter: bridges the existing JPA {@link Ruta} entity with the
 * framework-free Core domain {@link Route} aggregate.
 *
 * <p>Compatibility notes:
 * <ul>
 *   <li>The legacy {@link Ruta} only allows waypoints in BORRADOR state.
 *       The Core allows waypoints in any non-FINALIZADA state.
 *       Waypoint sync beyond BORRADOR uses direct JPA collection manipulation.</li>
 *   <li>Multi-tenancy: {@link Ruta} stores tenantId as UUID via {@link com.ecomovilidad.domain.common.Entity}.</li>
 * </ul>
 */
@Component
@Transactional
public class RouteRepositoryAdapter implements RouteRepositoryPort {

    private final RutaJpaRepository rutaRepository;

    public RouteRepositoryAdapter(RutaJpaRepository rutaRepository) {
        this.rutaRepository = rutaRepository;
    }

    // ── RouteRepositoryPort ──────────────────────────────────────────────

    @Override
    public Route save(Route route) {
        Ruta ruta = rutaRepository
                .findByIdAndTenantId(route.getId().value(), route.getTenantId().value())
                .orElseGet(() -> createJpaRuta(route));

        syncStatus(ruta, route.getStatus());
        rutaRepository.save(ruta);
        return route; // Core aggregate is the source of truth; JPA is persistence
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Route> findById(RouteId id, TenantId tenantId) {
        return rutaRepository.findByIdAndTenantId(id.value(), tenantId.value())
                .map(this::toCoreRoute);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Route> findAllByTenant(TenantId tenantId) {
        return rutaRepository.findByTenantIdOrderByFechaCreacionDesc(tenantId.value())
                .stream()
                .map(this::toCoreRoute)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Route> findByStatus(TenantId tenantId, RouteStatus status) {
        return rutaRepository.findByTenantIdOrderByFechaCreacionDesc(tenantId.value())
                .stream()
                .filter(r -> r.getEstado().equalsIgnoreCase(status.name()))
                .map(this::toCoreRoute)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsById(RouteId id, TenantId tenantId) {
        return rutaRepository.findByIdAndTenantId(id.value(), tenantId.value()).isPresent();
    }

    // ── Mapping: JPA → Core ──────────────────────────────────────────────

    private Route toCoreRoute(Ruta ruta) {
        var waypoints = toWaypoints(ruta.getPuntosIntermedios());
        return Route.reconstitute(
                RouteId.of(ruta.getId()),
                TenantId.of(ruta.getTenantId()),
                ruta.getNombre(),
                Coordinate.of(ruta.getOrigen().getLatitud(), ruta.getOrigen().getLongitud()),
                Coordinate.of(ruta.getDestino().getLatitud(), ruta.getDestino().getLongitud()),
                RouteStatus.fromLegacy(ruta.getEstado()),
                ruta.getColor(),
                waypoints,
                null // createdAt not mapped; see Route.reconstitute()
        );
    }

    private List<RouteWaypoint> toWaypoints(List<Coordenada> coordenadas) {
        return IntStream.range(0, coordenadas.size())
                .<RouteWaypoint>mapToObj(i -> RouteWaypoint.of(
                        Coordinate.of(coordenadas.get(i).getLatitud(),
                                      coordenadas.get(i).getLongitud()),
                        i))
                .toList();
    }

    // ── Mapping: Core → JPA ──────────────────────────────────────────────

    private Ruta createJpaRuta(Route route) {
        var ruta = Ruta.crear(
                route.getName(),
                Coordenada.crear(route.getOrigin().getLatitude(), route.getOrigin().getLongitude()),
                Coordenada.crear(route.getDestination().getLatitude(), route.getDestination().getLongitude()),
                route.getColorHex());
        ruta.setTenantId(route.getTenantId().value());

        // Add waypoints — only allowed in BORRADOR; new routes always start in BORRADOR
        route.getWaypoints().stream()
                .sorted((a, b) -> Integer.compare(a.getOrder(), b.getOrder()))
                .forEach(wp -> ruta.agregarPuntoIntermedio(
                        Coordenada.crear(wp.getCoordinate().getLatitude(),
                                         wp.getCoordinate().getLongitude())));
        return ruta;
    }

    private void syncStatus(Ruta ruta, RouteStatus targetStatus) {
        EstadoRuta current = ruta.getEstadoRuta();
        EstadoRuta target = toLegacyStatus(targetStatus);

        if (current == target) return;

        // Apply the single transition step the aggregate already validated
        if (target == EstadoRuta.ACTIVA) {
            ruta.activar();
        } else if (target == EstadoRuta.SUSPENDIDA) {
            ruta.suspender();
        } else if (target == EstadoRuta.FINALIZADA) {
            ruta.finalizar();
        }
        // EstadoRuta.BORRADOR is the initial state; no transition method exists
    }

    private EstadoRuta toLegacyStatus(RouteStatus status) {
        return switch (status) {
            case BORRADOR -> EstadoRuta.BORRADOR;
            case ACTIVA -> EstadoRuta.ACTIVA;
            case SUSPENDIDA -> EstadoRuta.SUSPENDIDA;
            case FINALIZADA -> EstadoRuta.FINALIZADA;
        };
    }
}
