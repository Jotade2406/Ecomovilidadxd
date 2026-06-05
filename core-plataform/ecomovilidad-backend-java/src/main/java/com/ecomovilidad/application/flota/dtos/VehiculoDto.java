package com.ecomovilidad.application.flota.dtos;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * DTO de salida para un Vehículo (no expone TenantId por seguridad).
 */
public record VehiculoDto(UUID id, String placa, int capacidad, String estado, BigDecimal fuelRate) {}
