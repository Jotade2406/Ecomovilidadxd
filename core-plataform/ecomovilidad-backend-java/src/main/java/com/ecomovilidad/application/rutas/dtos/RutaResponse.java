package com.ecomovilidad.application.rutas.dtos;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * DTO de salida que representa una Ruta para el consumidor de la API.
 * Desacopla el modelo de dominio de la representación externa.
 */
public record RutaResponse(
        UUID id,
        String nombre,
        CoordenadaDto origen,
        CoordenadaDto destino,
        String estado,
        String color,
        List<CoordenadaDto> puntosIntermedios,
        double distanciaTotalKm,
        LocalDateTime fechaCreacion,
        LocalDateTime fechaUltimaActualizacion
) {}
