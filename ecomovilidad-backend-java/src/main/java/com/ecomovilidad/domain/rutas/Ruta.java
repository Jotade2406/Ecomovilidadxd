package com.ecomovilidad.domain.rutas;

import com.ecomovilidad.domain.common.AggregateRoot;
import com.ecomovilidad.domain.rutas.events.RutaCreadaEvent;
import com.ecomovilidad.domain.rutas.events.RutaEstadoCambiadoEvent;
import com.ecomovilidad.domain.rutas.exceptions.TransicionEstadoInvalidaException;
import com.ecomovilidad.domain.rutas.valueobjects.Coordenada;
import com.ecomovilidad.domain.rutas.valueobjects.EstadoRuta;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Aggregate Root del Bounded Context de Rutas.
 * Encapsula toda la lógica de negocio: creación, transiciones de estado,
 * gestión de puntos intermedios y cálculo de distancia total.
 * Equivalente a Ruta.cs en .NET.
 */
@jakarta.persistence.Entity
@Table(name = "rutas", schema = "rutas")
public class Ruta extends AggregateRoot {

    @Column(name = "nombre", nullable = false, length = 200)
    private String nombre;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "latitud", column = @Column(name = "origen_latitud", nullable = false)),
            @AttributeOverride(name = "longitud", column = @Column(name = "origen_longitud", nullable = false))
    })
    private Coordenada origen;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "latitud", column = @Column(name = "destino_latitud", nullable = false)),
            @AttributeOverride(name = "longitud", column = @Column(name = "destino_longitud", nullable = false))
    })
    private Coordenada destino;

    @Column(name = "estado", nullable = false, length = 20)
    private String estado;

    @Column(name = "color", nullable = false, length = 9)
    private String color;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_ultima_actualizacion")
    private LocalDateTime fechaUltimaActualizacion;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(
            name = "ruta_puntos_intermedios",
            schema = "rutas",
            joinColumns = @JoinColumn(name = "ruta_id")
    )
    @OrderColumn(name = "orden")
    @AttributeOverrides({
            @AttributeOverride(name = "latitud", column = @Column(name = "latitud", nullable = false)),
            @AttributeOverride(name = "longitud", column = @Column(name = "longitud", nullable = false))
    })
    private List<Coordenada> puntosIntermedios = new ArrayList<>();

    // Constructor JPA
    protected Ruta() {
        super();
    }

    private Ruta(String nombre, Coordenada origen, Coordenada destino, String color) {
        super();
        this.nombre = nombre;
        this.origen = origen;
        this.destino = destino;
        this.estado = EstadoRuta.BORRADOR.getValor();
        this.color = color;
        this.fechaCreacion = LocalDateTime.now();

        raiseDomainEvent(new RutaCreadaEvent(getId(), nombre));
    }

    // ─── Factory Method ────────────────────────────────────────────────

    public static Ruta crear(String nombre, Coordenada origen, Coordenada destino, String color) {
        if (nombre == null || nombre.isBlank())
            throw new IllegalArgumentException("El nombre de la ruta no puede estar vacío.");
        if (nombre.length() > 200)
            throw new IllegalArgumentException("El nombre de la ruta no puede exceder 200 caracteres.");
        if (origen.equals(destino))
            throw new IllegalArgumentException("El origen y el destino no pueden ser iguales.");

        String normalizedColor = (color == null || color.isBlank()) ? "#3b82f6" : color.trim();
        return new Ruta(nombre, origen, destino, normalizedColor);
    }

    public static Ruta crear(String nombre, Coordenada origen, Coordenada destino) {
        return crear(nombre, origen, destino, "#3b82f6");
    }

    // ─── Comportamiento de Dominio ─────────────────────────────────────

    public void cambiarEstado(EstadoRuta nuevoEstado) {
        EstadoRuta estadoActual = getEstadoRuta();
        if (!estadoActual.puedeTransicionarA(nuevoEstado))
            throw new TransicionEstadoInvalidaException(estadoActual.getValor(), nuevoEstado.getValor());

        String estadoAnterior = this.estado;
        this.estado = nuevoEstado.getValor();
        this.fechaUltimaActualizacion = LocalDateTime.now();

        raiseDomainEvent(new RutaEstadoCambiadoEvent(getId(), estadoAnterior, nuevoEstado.getValor()));
    }

    public void activar() { cambiarEstado(EstadoRuta.ACTIVA); }
    public void suspender() { cambiarEstado(EstadoRuta.SUSPENDIDA); }
    public void finalizar() { cambiarEstado(EstadoRuta.FINALIZADA); }

    public void agregarPuntoIntermedio(Coordenada punto) {
        if (!getEstadoRuta().equals(EstadoRuta.BORRADOR))
            throw new IllegalStateException(
                    "Solo se pueden agregar puntos intermedios cuando la ruta está en estado Borrador.");
        puntosIntermedios.add(punto);
        this.fechaUltimaActualizacion = LocalDateTime.now();
    }

    public double calcularDistanciaTotalKm() {
        List<Coordenada> puntos = new ArrayList<>();
        puntos.add(origen);
        puntos.addAll(puntosIntermedios);
        puntos.add(destino);

        double total = 0;
        for (int i = 0; i < puntos.size() - 1; i++) {
            total += puntos.get(i).distanciaKmHacia(puntos.get(i + 1));
        }

        return Math.round(total * 100.0) / 100.0;
    }

    public void actualizarNombre(String nuevoNombre) {
        if (!getEstadoRuta().equals(EstadoRuta.BORRADOR))
            throw new IllegalStateException(
                    "Solo se puede renombrar una ruta en estado Borrador.");
        if (nuevoNombre == null || nuevoNombre.isBlank())
            throw new IllegalArgumentException("El nombre no puede estar vacío.");
        this.nombre = nuevoNombre;
        this.fechaUltimaActualizacion = LocalDateTime.now();
    }

    // ─── Getters ───────────────────────────────────────────────────────

    public String getNombre() { return nombre; }
    public Coordenada getOrigen() { return origen; }
    public Coordenada getDestino() { return destino; }
    public String getEstado() { return estado; }
    public EstadoRuta getEstadoRuta() { return EstadoRuta.desde(estado); }
    public String getColor() { return color; }
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public LocalDateTime getFechaUltimaActualizacion() { return fechaUltimaActualizacion; }
    public List<Coordenada> getPuntosIntermedios() { return Collections.unmodifiableList(puntosIntermedios); }
}
