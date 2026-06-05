package com.ecomovilidad.core.billing.domain.event;

import com.ecomovilidad.core.billing.domain.vo.PaymentId;
import com.ecomovilidad.core.billing.domain.vo.Money;
import com.ecomovilidad.core.shared.domain.DomainEvent;
import com.ecomovilidad.core.shared.domain.TenantId;

import java.util.UUID;

public final class PaymentConfirmedEvent extends DomainEvent {

    private final PaymentId paymentId;
    private final UUID studentId;
    private final Money amount;
    private final String referenceCode;

    public PaymentConfirmedEvent(TenantId tenantId, PaymentId paymentId,
                                  UUID studentId, Money amount, String referenceCode) {
        super("PAYMENT_CONFIRMED", tenantId);
        this.paymentId = paymentId;
        this.studentId = studentId;
        this.amount = amount;
        this.referenceCode = referenceCode;
    }

    public PaymentId getPaymentId() { return paymentId; }
    public UUID getStudentId() { return studentId; }
    public Money getAmount() { return amount; }
    public String getReferenceCode() { return referenceCode; }
}
