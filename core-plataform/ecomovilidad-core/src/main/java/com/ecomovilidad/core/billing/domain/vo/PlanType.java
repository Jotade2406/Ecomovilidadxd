package com.ecomovilidad.core.billing.domain.vo;

public enum PlanType {
    MENSUAL,
    ANUAL;

    public static PlanType fromLegacy(String value) {
        return valueOf(value.toUpperCase());
    }
}
