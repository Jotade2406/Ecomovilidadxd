package com.ecomovilidad.domain.viajes;

/**
 * Estados posibles de un Viaje operativo.
 * Equivalente a EstadoViaje.cs enum en .NET.
 */
public enum EstadoViaje {
    Programado,
    EnCurso,
    Completado,
    Cancelado
}
