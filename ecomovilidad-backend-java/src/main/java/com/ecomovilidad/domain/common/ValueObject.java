package com.ecomovilidad.domain.common;

import java.util.List;
import java.util.Objects;

/**
 * Clase base para Value Objects.
 * Igualdad por valor estructural, no por referencia.
 * Equivalente a ValueObject.cs en .NET.
 */
public abstract class ValueObject {

    protected abstract List<Object> getEqualityComponents();

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ValueObject other = (ValueObject) o;
        return getEqualityComponents().equals(other.getEqualityComponents());
    }

    @Override
    public int hashCode() {
        return Objects.hash(getEqualityComponents().toArray());
    }
}
