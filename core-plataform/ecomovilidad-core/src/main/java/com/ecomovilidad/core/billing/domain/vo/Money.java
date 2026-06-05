package com.ecomovilidad.core.billing.domain.vo;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Objects;

public final class Money {

    private final BigDecimal amount;

    private Money(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) < 0)
            throw new IllegalArgumentException("El monto no puede ser negativo: " + amount);
        this.amount = amount.setScale(2, RoundingMode.HALF_UP);
    }

    public static Money of(BigDecimal amount) { return new Money(amount); }
    public static Money of(String amount) { return new Money(new BigDecimal(amount)); }
    public static Money zero() { return new Money(BigDecimal.ZERO); }

    public BigDecimal amount() { return amount; }

    public boolean isZero() { return amount.compareTo(BigDecimal.ZERO) == 0; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Money m)) return false;
        return amount.compareTo(m.amount) == 0;
    }

    @Override
    public int hashCode() { return Objects.hash(amount.stripTrailingZeros()); }

    @Override
    public String toString() { return amount.toPlainString(); }
}
