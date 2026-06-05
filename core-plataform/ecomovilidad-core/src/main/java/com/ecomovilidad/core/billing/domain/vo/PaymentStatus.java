package com.ecomovilidad.core.billing.domain.vo;

public enum PaymentStatus {
    PENDIENTE,
    PAGADO,
    VENCIDO;

    public static PaymentStatus fromLegacy(String value) {
        return valueOf(value.toUpperCase());
    }
}
