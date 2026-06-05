package com.ecomovilidad.application.pagos.dtos;

import com.ecomovilidad.domain.pagos.TipoPlan;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CrearPagoRequest(
        UUID estudianteId,
        TipoPlan tipoPlan,
        BigDecimal monto,
        LocalDate fechaVencimiento
) {}
