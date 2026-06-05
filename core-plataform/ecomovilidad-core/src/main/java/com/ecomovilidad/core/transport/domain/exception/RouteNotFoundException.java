package com.ecomovilidad.core.transport.domain.exception;

import com.ecomovilidad.core.shared.exception.DomainException;
import com.ecomovilidad.core.transport.domain.vo.RouteId;

public final class RouteNotFoundException extends DomainException {

    public RouteNotFoundException(RouteId id) {
        super("ROUTE_NOT_FOUND", "Ruta no encontrada: " + id);
    }
}
