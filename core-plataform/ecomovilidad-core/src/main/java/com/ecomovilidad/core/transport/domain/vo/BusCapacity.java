package com.ecomovilidad.core.transport.domain.vo;

import java.util.Objects;

/**
 * Capacidad de un bus. Value Object que encapsula el invariante de que
 * la capacidad debe ser positiva y que los pasajeros no pueden excederla.
 */
public final class BusCapacity {

    private final int total;

    private BusCapacity(int total) {
        if (total <= 0)
            throw new IllegalArgumentException("La capacidad del bus debe ser mayor a cero: " + total);
        this.total = total;
    }

    public static BusCapacity of(int total) {
        return new BusCapacity(total);
    }

    public boolean canAccommodate(int passengers) {
        return passengers <= total;
    }

    public int remaining(int currentPassengers) {
        return Math.max(0, total - currentPassengers);
    }

    public int getTotal() { return total; }

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof BusCapacity bc)) return false;
        return total == bc.total;
    }

    @Override
    public int hashCode() { return Objects.hash(total); }

    @Override
    public String toString() { return "BusCapacity[" + total + "]"; }
}
