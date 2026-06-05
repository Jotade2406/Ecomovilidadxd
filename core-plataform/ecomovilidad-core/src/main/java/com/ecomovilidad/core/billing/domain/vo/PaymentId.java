package com.ecomovilidad.core.billing.domain.vo;

import java.util.Objects;
import java.util.UUID;

public record PaymentId(UUID value) {

    public PaymentId {
        Objects.requireNonNull(value, "PaymentId no puede ser nulo");
    }

    public static PaymentId newId() { return new PaymentId(UUID.randomUUID()); }
    public static PaymentId of(UUID uuid) { return new PaymentId(uuid); }
    public static PaymentId of(String uuid) { return new PaymentId(UUID.fromString(uuid)); }

    @Override
    public String toString() { return value.toString(); }
}
