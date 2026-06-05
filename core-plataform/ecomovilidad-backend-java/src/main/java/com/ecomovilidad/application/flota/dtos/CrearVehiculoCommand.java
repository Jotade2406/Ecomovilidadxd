package com.ecomovilidad.application.flota.dtos;

import java.math.BigDecimal;

/**
 * Comando para crear un nuevo vehículo.
 */
public record CrearVehiculoCommand(String placa, int capacidad, BigDecimal fuelRate) {}
