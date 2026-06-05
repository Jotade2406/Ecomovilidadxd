package com.ecomovilidad.core.transport.domain.vo;

import java.util.Objects;

/**
 * Coordenada geográfica (latitud, longitud). Value Object inmutable.
 * Encapsula la validación de rango y la fórmula de Haversine para
 * cálculos de distancia — sin depender de ninguna librería externa.
 */
public final class Coordinate {

    private static final double EARTH_RADIUS_KM = 6371.0;

    private final double latitude;
    private final double longitude;

    private Coordinate(double latitude, double longitude) {
        if (latitude < -90 || latitude > 90)
            throw new IllegalArgumentException("Latitud fuera de rango [-90, 90]: " + latitude);
        if (longitude < -180 || longitude > 180)
            throw new IllegalArgumentException("Longitud fuera de rango [-180, 180]: " + longitude);
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public static Coordinate of(double latitude, double longitude) {
        return new Coordinate(latitude, longitude);
    }

    /**
     * Distancia en kilómetros hacia {@code other} usando la fórmula de Haversine.
     */
    public double distanceKmTo(Coordinate other) {
        Objects.requireNonNull(other, "La coordenada destino no puede ser nula");
        double dLat = Math.toRadians(other.latitude - this.latitude);
        double dLon = Math.toRadians(other.longitude - this.longitude);
        double sinDLat = Math.sin(dLat / 2);
        double sinDLon = Math.sin(dLon / 2);
        double a = sinDLat * sinDLat
                + Math.cos(Math.toRadians(this.latitude))
                * Math.cos(Math.toRadians(other.latitude))
                * sinDLon * sinDLon;
        return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    public double getLatitude() { return latitude; }
    public double getLongitude() { return longitude; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Coordinate c)) return false;
        return Double.compare(latitude, c.latitude) == 0
                && Double.compare(longitude, c.longitude) == 0;
    }

    @Override
    public int hashCode() { return Objects.hash(latitude, longitude); }

    @Override
    public String toString() { return "Coordinate[" + latitude + ", " + longitude + "]"; }
}
