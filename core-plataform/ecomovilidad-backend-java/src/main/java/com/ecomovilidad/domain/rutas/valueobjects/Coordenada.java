package com.ecomovilidad.domain.rutas.valueobjects;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

/**
 * Representa una coordenada geográfica (latitud/longitud).
 * Inmutable. Validación en construcción.
 * Equivalente a Coordenada.cs ValueObject en .NET.
 */
@Embeddable
public class Coordenada {

    @Column(name = "latitud", nullable = false)
    private double latitud;

    @Column(name = "longitud", nullable = false)
    private double longitud;

    // Constructor JPA
    protected Coordenada() {}

    private Coordenada(double latitud, double longitud) {
        this.latitud = latitud;
        this.longitud = longitud;
    }

    /**
     * Factory method con validación de rango geográfico.
     */
    public static Coordenada crear(double latitud, double longitud) {
        if (latitud < -90 || latitud > 90)
            throw new IllegalArgumentException("La latitud debe estar entre -90 y 90.");
        if (longitud < -180 || longitud > 180)
            throw new IllegalArgumentException("La longitud debe estar entre -180 y 180.");
        return new Coordenada(latitud, longitud);
    }

    /**
     * Calcula la distancia aproximada en kilómetros usando la fórmula de Haversine.
     */
    public double distanciaKmHacia(Coordenada destino) {
        final double radioTierraKm = 6371.0;
        double dLat = Math.toRadians(destino.latitud - this.latitud);
        double dLon = Math.toRadians(destino.longitud - this.longitud);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(this.latitud)) *
                   Math.cos(Math.toRadians(destino.latitud)) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return radioTierraKm * c;
    }

    public double getLatitud() { return latitud; }
    public double getLongitud() { return longitud; }

    @Override
    public String toString() {
        return "(" + latitud + ", " + longitud + ")";
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Coordenada that = (Coordenada) o;
        return Double.compare(that.latitud, latitud) == 0
                && Double.compare(that.longitud, longitud) == 0;
    }

    @Override
    public int hashCode() {
        return java.util.Objects.hash(latitud, longitud);
    }
}
