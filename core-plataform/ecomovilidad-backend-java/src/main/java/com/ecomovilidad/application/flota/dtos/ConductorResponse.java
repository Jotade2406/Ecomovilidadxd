package com.ecomovilidad.application.flota.dtos;

import java.util.UUID;

/**
 * DTO de respuesta para un Conductor.
 * Nota: El campo 'nombre' se usa como display name en el frontend.
 */
public record ConductorResponse(
    UUID id,
    String nombre,
    String licencia,
    String turnos
) {}
