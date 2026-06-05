package com.ecomovilidad.core.transport.domain.exception;

import com.ecomovilidad.core.shared.exception.DomainException;
import com.ecomovilidad.core.transport.domain.vo.TripStatus;

public final class InvalidTripTransitionException extends DomainException {

    public InvalidTripTransitionException(TripStatus from, TripStatus to) {
        super("TRIP_INVALID_TRANSITION",
              "No es posible transicionar un viaje de " + from + " a " + to);
    }
}
