package com.ecomovilidad.domain.asignaciones;

import com.ecomovilidad.domain.common.Entity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entidad que vincula una Ruta fija a un Vehículo y un Conductor.
 * Un vehículo solo puede tener una asignación ACTIVA a la vez.
 */
@jakarta.persistence.Entity
@Table(name = "\"AsignacionesRutas\"", schema = "public")
public class AsignacionRuta extends Entity {

    @Column(name = "ruta_id", nullable = false)
    private UUID rutaId;

    @Column(name = "vehiculo_id", nullable = false)
    private UUID vehiculoId;

    @Column(name = "conductor_id", nullable = false)
    private UUID conductorId;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 20)
    private EstadoAsignacion estado;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;

    // Constructor JPA
    protected AsignacionRuta() { super(); }

    // ─── Factory Method ────────────────────────────────────────────────

    public static AsignacionRuta crear(UUID rutaId, UUID vehiculoId, UUID conductorId) {
        if (rutaId == null) throw new IllegalArgumentException("RutaId requerido.");
        if (vehiculoId == null) throw new IllegalArgumentException("VehiculoId requerido.");
        if (conductorId == null) throw new IllegalArgumentException("ConductorId requerido.");

        AsignacionRuta a = new AsignacionRuta();
        a.rutaId = rutaId;
        a.vehiculoId = vehiculoId;
        a.conductorId = conductorId;
        a.estado = EstadoAsignacion.ACTIVA;
        a.fechaCreacion = LocalDateTime.now();
        return a;
    }

    public void desactivar() {
        if (estado == EstadoAsignacion.INACTIVA)
            throw new IllegalStateException("La asignación ya está inactiva.");
        estado = EstadoAsignacion.INACTIVA;
    }

    // ─── Getters ───────────────────────────────────────────────────────

    public UUID getRutaId() { return rutaId; }
    public UUID getVehiculoId() { return vehiculoId; }
    public UUID getConductorId() { return conductorId; }
    public EstadoAsignacion getEstado() { return estado; }
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
}
