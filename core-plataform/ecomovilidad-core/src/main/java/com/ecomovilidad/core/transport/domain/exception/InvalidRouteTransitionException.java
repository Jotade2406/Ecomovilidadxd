package com.ecomovilidad.core.transport.domain.exception;

import com.ecomovilidad.core.shared.exception.DomainException;
import com.ecomovilidad.core.transport.domain.vo.RouteStatus;

public final class InvalidRouteTransitionException extends DomainException {

    public InvalidRouteTransitionException(RouteStatus from, RouteStatus to) {
        super("ROUTE_INVALID_TRANSITION",
              "No es posible transicionar una ruta de " + from + " a " + to);
    }
}
