package com.ecomovilidad.application.rutas.dtos;

/**
 * DTO anidado para coordenadas.
 */
public record CoordenadaDto(double latitud, double longitud, int orden) {
    public CoordenadaDto(double latitud, double longitud) {
        this(latitud, longitud, 0);
    }
}
