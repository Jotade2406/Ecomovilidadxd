package com.ecomovilidad.application.comunidad.dtos;

import java.util.UUID;

/**
 * Comando para crear un nuevo estudiante.
 */
public record CrearEstudianteCommand(String nombre, UUID tutorId, String paradaAsignada) {}
