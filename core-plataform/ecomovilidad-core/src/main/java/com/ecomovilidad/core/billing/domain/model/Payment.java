package com.ecomovilidad.core.billing.domain.model;

import com.ecomovilidad.core.billing.domain.event.PaymentConfirmedEvent;
import com.ecomovilidad.core.billing.domain.exception.PaymentAlreadyConfirmedException;
import com.ecomovilidad.core.billing.domain.vo.Money;
import com.ecomovilidad.core.billing.domain.vo.PaymentId;
import com.ecomovilidad.core.billing.domain.vo.PaymentStatus;
import com.ecomovilidad.core.billing.domain.vo.PlanType;
import com.ecomovilidad.core.shared.domain.AggregateRoot;
import com.ecomovilidad.core.shared.domain.TenantId;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Objects;
import java.util.UUID;

/**
 * Aggregate Root: Pago de plan de transporte.
 *
 * <p>Invariantes:
 * <ul>
 *   <li>Un pago PAGADO no puede confirmarse ni vencerse.</li>
 *   <li>El monto debe ser positivo.</li>
 *   <li>La referencia de pago es obligatoria al confirmar.</li>
 * </ul>
 */
public class Payment extends AggregateRoot<PaymentId> {

    private final UUID studentId;
    private final PlanType planType;
    private final Money amount;
    private final LocalDate dueDate;
    private PaymentStatus status;
    private String referenceCode;
    private Instant confirmedAt;
    private final Instant createdAt;

    private Payment(PaymentId id, TenantId tenantId, UUID studentId,
                    PlanType planType, Money amount, LocalDate dueDate) {
        super(id, tenantId);
        this.studentId = Objects.requireNonNull(studentId, "StudentId es requerido");
        this.planType = Objects.requireNonNull(planType, "PlanType es requerido");
        this.amount = Objects.requireNonNull(amount, "Amount es requerido");
        this.dueDate = Objects.requireNonNull(dueDate, "DueDate es requerida");
        this.status = PaymentStatus.PENDIENTE;
        this.createdAt = Instant.now();
    }

    // ── Factory Methods ──────────────────────────────────────────────────

    public static Payment create(TenantId tenantId, UUID studentId,
                                  PlanType planType, Money amount, LocalDate dueDate) {
        if (amount.isZero())
            throw new IllegalArgumentException("El monto del pago no puede ser cero");
        return new Payment(PaymentId.newId(), tenantId, studentId, planType, amount, dueDate);
    }

    public static Payment reconstitute(PaymentId id, TenantId tenantId, UUID studentId,
                                        PlanType planType, Money amount, LocalDate dueDate,
                                        PaymentStatus status, String referenceCode,
                                        Instant confirmedAt, Instant createdAt) {
        var p = new Payment(id, tenantId, studentId, planType, amount, dueDate);
        p.status = status;
        p.referenceCode = referenceCode;
        p.confirmedAt = confirmedAt;
        return p;
    }

    // ── Comandos de dominio ──────────────────────────────────────────────

    public void confirm(String referenceCode) {
        if (status == PaymentStatus.PAGADO)
            throw new PaymentAlreadyConfirmedException(getId());
        if (status == PaymentStatus.VENCIDO)
            throw new IllegalStateException("No se puede confirmar un pago vencido");
        if (referenceCode == null || referenceCode.isBlank())
            throw new IllegalArgumentException("La referencia de pago es requerida");

        this.status = PaymentStatus.PAGADO;
        this.referenceCode = referenceCode;
        this.confirmedAt = Instant.now();
        registerEvent(new PaymentConfirmedEvent(getTenantId(), getId(),
                studentId, amount, referenceCode));
    }

    public void expire() {
        if (status == PaymentStatus.PAGADO)
            throw new IllegalStateException("No se puede vencer un pago ya confirmado");
        if (status == PaymentStatus.VENCIDO)
            return; // idempotente
        this.status = PaymentStatus.VENCIDO;
    }

    // ── Getters ──────────────────────────────────────────────────────────

    public UUID getStudentId() { return studentId; }
    public PlanType getPlanType() { return planType; }
    public Money getAmount() { return amount; }
    public LocalDate getDueDate() { return dueDate; }
    public PaymentStatus getStatus() { return status; }
    public String getReferenceCode() { return referenceCode; }
    public Instant getConfirmedAt() { return confirmedAt; }
    public Instant getCreatedAt() { return createdAt; }
}
