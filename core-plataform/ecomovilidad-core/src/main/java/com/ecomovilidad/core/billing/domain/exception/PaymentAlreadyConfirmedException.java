package com.ecomovilidad.core.billing.domain.exception;

import com.ecomovilidad.core.billing.domain.vo.PaymentId;
import com.ecomovilidad.core.shared.exception.DomainException;

public final class PaymentAlreadyConfirmedException extends DomainException {

    public PaymentAlreadyConfirmedException(PaymentId paymentId) {
        super("PAYMENT_ALREADY_CONFIRMED",
              "El pago " + paymentId + " ya fue confirmado y no puede modificarse.");
    }
}
