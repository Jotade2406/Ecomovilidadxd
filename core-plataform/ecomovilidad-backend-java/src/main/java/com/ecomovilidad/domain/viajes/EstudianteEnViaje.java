package com.ecomovilidad.domain.viajes;

import com.ecomovilidad.domain.common.Entity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entidad de vinculación entre Viaje y Estudiante (Many-to-Many).
 * Representa la asignación de un estudiante a un viaje específico,
 * con seguimiento de estado individual (asignado, en transporte, descendido, ausente).
 */
@jakarta.persistence.Entity
@Table(name = "\"ViajesEstudiantes\"", schema = "public",
       uniqueConstraints = @UniqueConstraint(
           name = "UK_viaje_estudiante",
           columnNames = {"viaje_id", "estudiante_id"}
       ))
public class EstudianteEnViaje extends Entity {

    @Column(name = "viaje_id", nullable = false)
    private UUID viajeId;

    @Column(name = "estudiante_id", nullable = false)
    private UUID estudianteId;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 20)
    private EstadoEstudianteEnViaje estado;

    @Column(name = "orden_asignacion", nullable = false)
    private int ordenAsignacion;

    @Column(name = "hora_asignacion", nullable = false)
    private LocalDateTime horaAsignacion;

    @Column(name = "hora_descenso")
    private LocalDateTime horaDescenso;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "viaje_id", insertable = false, updatable = false)
    private Viaje viaje;

    // Constructor JPA
    protected EstudianteEnViaje() { super(); }

    // ─── Factory Method ────────────────────────────────────────────────

    public static EstudianteEnViaje crear(UUID viajeId, UUID estudianteId, int orden) {
        if (viajeId == null) throw new IllegalArgumentException("El ViajeId es requerido.");
        if (estudianteId == null) throw new IllegalArgumentException("El EstudianteId es requerido.");

        EstudianteEnViaje ev = new EstudianteEnViaje();
        ev.viajeId = viajeId;
        ev.estudianteId = estudianteId;
        ev.estado = EstadoEstudianteEnViaje.ASIGNADO;
        ev.ordenAsignacion = orden;
        ev.horaAsignacion = LocalDateTime.now();
        return ev;
    }

    // ─── Transiciones de estado ────────────────────────────────────────

    public void marcarEnTransporte() {
        if (estado != EstadoEstudianteEnViaje.ASIGNADO)
            throw new IllegalStateException("Solo estudiantes ASIGNADOS pueden pasar a EN_TRANSPORTE.");
        estado = EstadoEstudianteEnViaje.EN_TRANSPORTE;
    }

    public void marcarDescendido() {
        if (estado != EstadoEstudianteEnViaje.EN_TRANSPORTE)
            throw new IllegalStateException("Solo estudiantes EN_TRANSPORTE pueden marcarse como DESCENDIDO.");
        estado = EstadoEstudianteEnViaje.DESCENDIDO;
        horaDescenso = LocalDateTime.now();
    }

    public void marcarAusente() {
        if (estado == EstadoEstudianteEnViaje.DESCENDIDO || estado == EstadoEstudianteEnViaje.AUSENTE)
            throw new IllegalStateException("No se puede marcar como ausente un estudiante que ya descendió.");
        estado = EstadoEstudianteEnViaje.AUSENTE;
    }

    // ─── Getters ───────────────────────────────────────────────────────

    public UUID getViajeId() { return viajeId; }
    public UUID getEstudianteId() { return estudianteId; }
    public EstadoEstudianteEnViaje getEstado() { return estado; }
    public int getOrdenAsignacion() { return ordenAsignacion; }
    public LocalDateTime getHoraAsignacion() { return horaAsignacion; }
    public LocalDateTime getHoraDescenso() { return horaDescenso; }
    public Viaje getViaje() { return viaje; }
}
