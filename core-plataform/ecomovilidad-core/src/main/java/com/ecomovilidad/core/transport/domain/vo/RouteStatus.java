package com.ecomovilidad.core.transport.domain.vo;

import com.ecomovilidad.core.transport.domain.exception.InvalidRouteTransitionException;
import java.util.Set;

/**
 * Estado de una Ruta. Implementa la máquina de estados como tabla de transiciones
 * válidas — ningún código externo puede violar los invariantes del ciclo de vida.
 *
 * <pre>
 *   BORRADOR ──→ ACTIVA ──→ SUSPENDIDA ──→ ACTIVA
 *      │           │               │
 *      └─────────→ FINALIZADA ←───┘
 * </pre>
 */
public enum RouteStatus {

    BORRADOR {
        @Override
        public Set<RouteStatus> allowedTransitions() { return Set.of(ACTIVA); }
    },
    ACTIVA {
        @Override
        public Set<RouteStatus> allowedTransitions() { return Set.of(SUSPENDIDA, FINALIZADA); }
    },
    SUSPENDIDA {
        @Override
        public Set<RouteStatus> allowedTransitions() { return Set.of(ACTIVA, FINALIZADA); }
    },
    FINALIZADA {
        @Override
        public Set<RouteStatus> allowedTransitions() { return Set.of(); }
    };

    public abstract Set<RouteStatus> allowedTransitions();

    public RouteStatus transitionTo(RouteStatus target) {
        if (!allowedTransitions().contains(target)) {
            throw new InvalidRouteTransitionException(this, target);
        }
        return target;
    }

    public boolean isOperational() {
        return this == ACTIVA;
    }

    /** Mapea desde los literales del backend existente para compatibilidad. */
    public static RouteStatus fromLegacy(String value) {
        return switch (value.toUpperCase()) {
            case "BORRADOR"   -> BORRADOR;
            case "ACTIVA"     -> ACTIVA;
            case "SUSPENDIDA" -> SUSPENDIDA;
            case "FINALIZADA" -> FINALIZADA;
            default -> throw new IllegalArgumentException("Estado de ruta desconocido: " + value);
        };
    }
}
