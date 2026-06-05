package com.ecomovilidad.core.billing.port.in;

import com.ecomovilidad.core.billing.domain.model.Payment;
import com.ecomovilidad.core.billing.domain.vo.PaymentId;
import com.ecomovilidad.core.shared.domain.TenantId;

public interface ConfirmPaymentUseCase {

    record Command(TenantId tenantId, PaymentId paymentId, String referenceCode) {}

    Payment execute(Command command);
}
