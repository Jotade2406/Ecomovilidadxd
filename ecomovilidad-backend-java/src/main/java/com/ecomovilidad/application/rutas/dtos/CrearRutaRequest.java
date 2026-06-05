package com.ecomovilidad.application.rutas.dtos;

/**
 * DTO de entrada para la creación de una ruta.
 */
public record CrearRutaRequest(
        String nombre,
        double origenLatitud,
        double origenLongitud,
        double destinoLatitud,
        double destinoLongitud,
        String color
) {
    public CrearRutaRequest {
        if (color == null || color.isBlank()) color = "#3b82f6";
    }
}
