package com.ecomovilidad.application.pagos.dtos;

import com.ecomovilidad.domain.pagos.EstadoPago;
import com.ecomovilidad.domain.pagos.TipoPlan;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record PagoResponse(
        UUID id,
        UUID estudianteId,
        String nombreEstudiante,
        TipoPlan tipoPlan,
        EstadoPago estado,
        BigDecimal monto,
        LocalDate fechaVencimiento,
        LocalDateTime fechaPago,
        String referenciaPago,
        LocalDateTime fechaCreacion
) {}
