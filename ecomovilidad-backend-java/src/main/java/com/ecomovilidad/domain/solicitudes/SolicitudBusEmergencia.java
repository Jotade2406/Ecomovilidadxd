package com.ecomovilidad.domain.solicitudes;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.UUID;

@Document(collection = "solicitudes_bus_emergencia")
public class SolicitudBusEmergencia {

    @Id
    private String id;

    @Field("tenant_id")
    private UUID tenantId;

    @Field("estudiante_id")
    private UUID estudianteId;

    private String descripcion;
    private String ubicacion;
    private EstadoSolicitud estado;

    @Field("fecha_solicitud")
    private LocalDateTime fechaSolicitud;

    @Field("fecha_atencion")
    private LocalDateTime fechaAtencion;

    public SolicitudBusEmergencia() {}

    public static SolicitudBusEmergencia crear(UUID tenantId, UUID estudianteId,
                                                String descripcion, String ubicacion) {
        if (estudianteId == null) throw new IllegalArgumentException("EstudianteId requerido.");
        if (descripcion == null || descripcion.isBlank()) throw new IllegalArgumentException("Descripción requerida.");

        SolicitudBusEmergencia s = new SolicitudBusEmergencia();
        s.id = UUID.randomUUID().toString();
        s.tenantId = tenantId;
        s.estudianteId = estudianteId;
        s.descripcion = descripcion;
        s.ubicacion = ubicacion;
        s.estado = EstadoSolicitud.PENDIENTE;
        s.fechaSolicitud = LocalDateTime.now();
        return s;
    }

    public void atender() {
        if (estado != EstadoSolicitud.PENDIENTE)
            throw new IllegalStateException("La solicitud ya fue atendida.");
        this.estado = EstadoSolicitud.APROBADA;
        this.fechaAtencion = LocalDateTime.now();
    }

    public String getId() { return id; }
    public UUID getTenantId() { return tenantId; }
    public UUID getEstudianteId() { return estudianteId; }
    public String getDescripcion() { return descripcion; }
    public String getUbicacion() { return ubicacion; }
    public EstadoSolicitud getEstado() { return estado; }
    public LocalDateTime getFechaSolicitud() { return fechaSolicitud; }
    public LocalDateTime getFechaAtencion() { return fechaAtencion; }
}
