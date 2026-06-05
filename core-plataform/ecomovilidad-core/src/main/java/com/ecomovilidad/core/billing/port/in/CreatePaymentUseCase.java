package com.ecomovilidad.core.billing.port.in;

import com.ecomovilidad.core.billing.domain.model.Payment;
import com.ecomovilidad.core.billing.domain.vo.Money;
import com.ecomovilidad.core.billing.domain.vo.PlanType;
import com.ecomovilidad.core.shared.domain.TenantId;

import java.time.LocalDate;
import java.util.UUID;

public interface CreatePaymentUseCase {

    record Command(TenantId tenantId, UUID studentId, PlanType planType,
                   Money amount, LocalDate dueDate) {}

    Payment execute(Command command);
}
