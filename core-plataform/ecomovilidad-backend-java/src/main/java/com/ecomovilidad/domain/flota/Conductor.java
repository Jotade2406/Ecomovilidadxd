package com.ecomovilidad.domain.flota;

import com.ecomovilidad.domain.common.Entity;
import jakarta.persistence.*;
import java.util.regex.Pattern;

/**
 * Entidad de dominio que representa un Conductor.
 * Equivalente a Conductor.cs en .NET.
 */
@jakarta.persistence.Entity
@Table(name = "\"Conductores\"", schema = "public")
public class Conductor extends Entity {

    private static final Pattern LICENCIA_PATTERN = Pattern.compile("^[A-Z0-9]{5,15}$");

    @Column(name = "nombre", nullable = false)
    private String nombre;

    @Column(name = "licencia", nullable = false)
    private String licencia;

    @Column(name = "turnos", nullable = false)
    private String turnos;

    // Constructor JPA
    protected Conductor() { super(); }

    public static Conductor crear(String nombre, String licencia, String turnos) {
        if (nombre == null || nombre.isBlank()) throw new IllegalArgumentException("Nombre requerido.");
        if (!LICENCIA_PATTERN.matcher(licencia).matches()) throw new IllegalArgumentException("Licencia inválida.");

        Conductor conductor = new Conductor();
        conductor.nombre = nombre;
        conductor.licencia = licencia;
        conductor.turnos = turnos;
        return conductor;
    }

    public String getNombre() { return nombre; }
    public String getLicencia() { return licencia; }
    public String getTurnos() { return turnos; }
}
