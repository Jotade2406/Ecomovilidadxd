package com.ecomovilidad.application.rutas.dtos;

/**
 * DTO de entrada para agregar un punto intermedio a una ruta.
 */
public record AgregarPuntoIntermedioRequest(
        double latitud,
        double longitud,
        int orden
) {}
