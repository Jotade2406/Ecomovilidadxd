package com.ecomovilidad.core.billing.application;

import com.ecomovilidad.core.billing.domain.model.Payment;
import com.ecomovilidad.core.billing.port.in.ConfirmPaymentUseCase;
import com.ecomovilidad.core.billing.port.in.CreatePaymentUseCase;
import com.ecomovilidad.core.billing.port.out.PaymentRepositoryPort;
import com.ecomovilidad.core.shared.port.out.DomainEventPublisherPort;

import java.util.Objects;

public class BillingApplicationService
        implements CreatePaymentUseCase, ConfirmPaymentUseCase {

    private final PaymentRepositoryPort paymentRepository;
    private final DomainEventPublisherPort eventPublisher;

    public BillingApplicationService(PaymentRepositoryPort paymentRepository,
                                      DomainEventPublisherPort eventPublisher) {
        this.paymentRepository = Objects.requireNonNull(paymentRepository);
        this.eventPublisher = Objects.requireNonNull(eventPublisher);
    }

    @Override
    public Payment execute(CreatePaymentUseCase.Command cmd) {
        var payment = Payment.create(cmd.tenantId(), cmd.studentId(),
                cmd.planType(), cmd.amount(), cmd.dueDate());
        return paymentRepository.save(payment);
    }

    @Override
    public Payment execute(ConfirmPaymentUseCase.Command cmd) {
        var payment = paymentRepository.findById(cmd.paymentId(), cmd.tenantId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Pago no encontrado: " + cmd.paymentId()));
        payment.confirm(cmd.referenceCode());
        var saved = paymentRepository.save(payment);
        eventPublisher.publishAll(saved.pullDomainEvents());
        return saved;
    }
}
