package com.ecomovilidad.domain.flota;

import com.ecomovilidad.domain.common.Entity;
import jakarta.persistence.*;
import java.math.BigDecimal;

/**
 * Entidad de dominio que representa un Vehículo de la flota.
 * Equivalente a Vehiculo.cs en .NET.
 */
@jakarta.persistence.Entity
@Table(name = "\"Vehiculos\"", schema = "public")
public class Vehiculo extends Entity {

    @Column(name = "placa", nullable = false)
    private String placa;

    @Column(name = "capacidad", nullable = false)
    private int capacidad;

    @Column(name = "estado", nullable = false)
    private String estado;

    @Column(name = "fuel_rate", nullable = false, precision = 10, scale = 4)
    private BigDecimal fuelRate;

    // Constructor JPA
    protected Vehiculo() { super(); }

    public static Vehiculo crear(String placa, int capacidad, BigDecimal fuelRate) {
        if (placa == null || placa.isBlank()) throw new IllegalArgumentException("Placa requerida.");
        if (capacidad <= 0) throw new IllegalArgumentException("Capacidad inválida.");
        if (fuelRate == null || fuelRate.compareTo(BigDecimal.ZERO) <= 0) throw new IllegalArgumentException("FuelRate inválido.");

        Vehiculo vehiculo = new Vehiculo();
        vehiculo.placa = placa;
        vehiculo.capacidad = capacidad;
        vehiculo.estado = "Activo";
        vehiculo.fuelRate = fuelRate;
        return vehiculo;
    }

    public String getPlaca() { return placa; }
    public int getCapacidad() { return capacidad; }
    public String getEstado() { return estado; }
    public BigDecimal getFuelRate() { return fuelRate; }
}
