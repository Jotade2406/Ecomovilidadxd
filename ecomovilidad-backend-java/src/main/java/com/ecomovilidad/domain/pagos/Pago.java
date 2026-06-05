package com.ecomovilidad.domain.pagos;

import com.ecomovilidad.domain.common.Entity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@jakarta.persistence.Entity
@Table(name = "\"Pagos\"", schema = "public")
public class Pago extends Entity {

    @Column(name = "estudiante_id", nullable = false)
    private UUID estudianteId;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_plan", nullable = false, length = 20)
    private TipoPlan tipoPlan;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 20)
    private EstadoPago estado;

    @Column(name = "monto", nullable = false, precision = 10, scale = 2)
    private BigDecimal monto;

    @Column(name = "fecha_vencimiento", nullable = false)
    private LocalDate fechaVencimiento;

    @Column(name = "fecha_pago")
    private LocalDateTime fechaPago;

    @Column(name = "referencia_pago", length = 100)
    private String referenciaPago;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;

    protected Pago() { super(); }

    public static Pago crear(UUID estudianteId, TipoPlan tipoPlan,
                             BigDecimal monto, LocalDate fechaVencimiento) {
        if (estudianteId == null) throw new IllegalArgumentException("EstudianteId requerido.");
        if (tipoPlan == null) throw new IllegalArgumentException("TipoPlan requerido.");
        if (monto == null || monto.compareTo(BigDecimal.ZERO) <= 0)
            throw new IllegalArgumentException("Monto debe ser mayor a cero.");
        if (fechaVencimiento == null) throw new IllegalArgumentException("FechaVencimiento requerida.");

        Pago p = new Pago();
        p.estudianteId = estudianteId;
        p.tipoPlan = tipoPlan;
        p.monto = monto;
        p.fechaVencimiento = fechaVencimiento;
        p.estado = EstadoPago.PENDIENTE;
        p.fechaCreacion = LocalDateTime.now();
        return p;
    }

    public void registrarPago(String referencia) {
        if (estado == EstadoPago.PAGADO)
            throw new IllegalStateException("El pago ya fue registrado.");
        this.estado = EstadoPago.PAGADO;
        this.fechaPago = LocalDateTime.now();
        this.referenciaPago = referencia;
    }

    public void marcarVencido() {
        if (estado != EstadoPago.PENDIENTE)
            throw new IllegalStateException("Solo pagos pendientes pueden marcarse como vencidos.");
        this.estado = EstadoPago.VENCIDO;
    }

    public UUID getEstudianteId() { return estudianteId; }
    public TipoPlan getTipoPlan() { return tipoPlan; }
    public EstadoPago getEstado() { return estado; }
    public BigDecimal getMonto() { return monto; }
    public LocalDate getFechaVencimiento() { return fechaVencimiento; }
    public LocalDateTime getFechaPago() { return fechaPago; }
    public String getReferenciaPago() { return referenciaPago; }
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
}
