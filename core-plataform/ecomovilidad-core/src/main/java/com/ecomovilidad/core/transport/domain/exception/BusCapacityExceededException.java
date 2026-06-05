package com.ecomovilidad.core.transport.domain.exception;

import com.ecomovilidad.core.shared.exception.DomainException;
import com.ecomovilidad.core.transport.domain.vo.BusId;

public final class BusCapacityExceededException extends DomainException {

    public BusCapacityExceededException(BusId busId, int capacity, int requested) {
        super("BUS_CAPACITY_EXCEEDED",
              "El bus " + busId + " tiene capacidad " + capacity
              + " pero se intentaron agregar " + requested + " estudiantes");
    }
}
