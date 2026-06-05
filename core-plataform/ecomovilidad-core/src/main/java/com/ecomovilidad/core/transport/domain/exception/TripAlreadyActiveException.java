package com.ecomovilidad.core.transport.domain.exception;

import com.ecomovilidad.core.shared.exception.DomainException;
import com.ecomovilidad.core.transport.domain.vo.RouteId;

public final class TripAlreadyActiveException extends DomainException {

    public TripAlreadyActiveException(RouteId routeId) {
        super("TRIP_ALREADY_ACTIVE",
              "Ya existe un viaje en curso para la ruta " + routeId
              + ". Ciérralo antes de iniciar uno nuevo.");
    }
}
