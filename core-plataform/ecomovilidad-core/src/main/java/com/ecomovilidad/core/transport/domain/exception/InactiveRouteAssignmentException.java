package com.ecomovilidad.core.transport.domain.exception;

import com.ecomovilidad.core.shared.exception.DomainException;
import com.ecomovilidad.core.transport.domain.vo.RouteId;

public final class InactiveRouteAssignmentException extends DomainException {

    public InactiveRouteAssignmentException(RouteId routeId) {
        super("ROUTE_ASSIGNMENT_INACTIVE",
              "No existe una asignación activa de Ruta-Bus-Conductor para la ruta " + routeId
              + ". Configure la asignación antes de iniciar un viaje.");
    }
}
