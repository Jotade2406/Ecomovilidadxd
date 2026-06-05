package com.ecomovilidad.domain.viajes;

import com.ecomovilidad.domain.common.AggregateRoot;
import com.ecomovilidad.domain.viajes.events.ViajeCerradoEvent;
import com.ecomovilidad.domain.viajes.events.ViajeIniciadoEvent;
import com.ecomovilidad.domain.viajes.exceptions.ViajeNoEnCursoException;
import com.ecomovilidad.domain.viajes.exceptions.ViajeYaIniciadoException;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

/**
 * Aggregate Root del Bounded Context de Viajes.
 * Representa la ejecución en tiempo real de una Ruta, asignando
 * un Conductor y un Vehículo para trasladar a los estudiantes.
 * Equivalente a Viaje.cs en .NET.
 */
@jakarta.persistence.Entity
@Table(name = "\"Viajes\"", schema = "public")
public class Viaje extends AggregateRoot {

    @Column(name = "ruta_id", nullable = false)
    private UUID rutaId;

    @Column(name = "vehiculo_id", nullable = false)
    private UUID vehiculoId;

    @Column(name = "conductor_id", nullable = false)
    private UUID conductorId;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 20)
    private EstadoViaje estado;

    @Column(name = "fecha_inicio")
    private LocalDateTime fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDateTime fechaFin;

    @Column(name = "creado_en", nullable = false)
    private LocalDateTime creadoEn;

    // ─── Relación Many-to-Many con Estudiantes (Sprint 2) ─────────────

    @OneToMany(mappedBy = "viaje", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EstudianteEnViaje> estudiantesEnViaje = new ArrayList<>();

    // Constructor JPA
    protected Viaje() { super(); }

    // ─── Factory Method ────────────────────────────────────────────────

    public static Viaje crear(UUID rutaId, UUID vehiculoId, UUID conductorId) {
        if (rutaId == null) throw new IllegalArgumentException("El RutaId es requerido.");
        if (vehiculoId == null) throw new IllegalArgumentException("El VehiculoId es requerido.");
        if (conductorId == null) throw new IllegalArgumentException("El ConductorId es requerido.");

        Viaje viaje = new Viaje();
        viaje.rutaId = rutaId;
        viaje.vehiculoId = vehiculoId;
        viaje.conductorId = conductorId;
        viaje.estado = EstadoViaje.Programado;
        viaje.creadoEn = LocalDateTime.now();
        return viaje;
    }

    // ─── Transiciones de estado ────────────────────────────────────────

    public void iniciarViaje() {
        if (estado == EstadoViaje.EnCurso) throw new ViajeYaIniciadoException(getId());
        if (estado != EstadoViaje.Programado) throw new IllegalStateException("Solo viajes Programados pueden iniciarse.");

        estado = EstadoViaje.EnCurso;
        fechaInicio = LocalDateTime.now();
        raiseDomainEvent(new ViajeIniciadoEvent(getId(), rutaId, conductorId, vehiculoId));
    }

    public void completarViaje() {
        if (estado != EstadoViaje.EnCurso) throw new ViajeNoEnCursoException();
        estado = EstadoViaje.Completado;
        fechaFin = LocalDateTime.now();
        raiseDomainEvent(new ViajeCerradoEvent(getId(), fechaFin, estudiantesEnViaje.size()));
    }

    public void cancelarViaje() {
        if (estado == EstadoViaje.Completado || estado == EstadoViaje.Cancelado)
            throw new IllegalStateException("No se puede cancelar.");
        estado = EstadoViaje.Cancelado;
        fechaFin = LocalDateTime.now();
    }

    // ─── Gestión de estudiantes (Sprint 2) ─────────────────────────────

    public void agregarEstudiante(EstudianteEnViaje estudiante) {
        if (estado != EstadoViaje.EnCurso && estado != EstadoViaje.Programado)
            throw new IllegalStateException("No se pueden agregar estudiantes a un viaje " + estado + ".");
        estudiantesEnViaje.add(estudiante);
    }

    public int getCantidadEstudiantes() {
        return estudiantesEnViaje.size();
    }

    public List<EstudianteEnViaje> getEstudiantesEnViaje() {
        return Collections.unmodifiableList(estudiantesEnViaje);
    }

    // ─── Getters ───────────────────────────────────────────────────────

    public UUID getRutaId() { return rutaId; }
    public UUID getVehiculoId() { return vehiculoId; }
    public UUID getConductorId() { return conductorId; }
    public EstadoViaje getEstado() { return estado; }
    public LocalDateTime getFechaInicio() { return fechaInicio; }
    public LocalDateTime getFechaFin() { return fechaFin; }
    public LocalDateTime getCreadoEn() { return creadoEn; }
}
