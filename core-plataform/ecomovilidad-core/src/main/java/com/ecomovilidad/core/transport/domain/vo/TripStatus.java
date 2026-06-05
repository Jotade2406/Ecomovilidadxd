package com.ecomovilidad.core.transport.domain.vo;

import com.ecomovilidad.core.transport.domain.exception.InvalidTripTransitionException;
import java.util.Set;

/**
 * Estado del ciclo de vida de un Viaje.
 * <pre>
 *   PROGRAMADO ──→ EN_CURSO ──→ COMPLETADO
 *       │              │
 *       └──────────────┴────→ CANCELADO
 * </pre>
 */
public enum TripStatus {

    PROGRAMADO {
        @Override
        public Set<TripStatus> allowedTransitions() { return Set.of(EN_CURSO, CANCELADO); }
    },
    EN_CURSO {
        @Override
        public Set<TripStatus> allowedTransitions() { return Set.of(COMPLETADO, CANCELADO); }
    },
    COMPLETADO {
        @Override
        public Set<TripStatus> allowedTransitions() { return Set.of(); }
    },
    CANCELADO {
        @Override
        public Set<TripStatus> allowedTransitions() { return Set.of(); }
    };

    public abstract Set<TripStatus> allowedTransitions();

    public TripStatus transitionTo(TripStatus target) {
        if (!allowedTransitions().contains(target)) {
            throw new InvalidTripTransitionException(this, target);
        }
        return target;
    }

    public boolean isActive() { return this == EN_CURSO; }
    public boolean isTerminal() { return this == COMPLETADO || this == CANCELADO; }
}
