package com.ecomovilidad.application.comunidad.dtos;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO de salida para un Estudiante (no expone TenantId por seguridad).
 */
public record EstudianteDto(UUID id, String nombre, String codigoQR, LocalDateTime qrCodeTTL,
                             UUID tutorId, String paradaAsignada) {}
