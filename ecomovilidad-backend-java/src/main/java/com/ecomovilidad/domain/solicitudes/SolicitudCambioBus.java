package com.ecomovilidad.domain.solicitudes;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.UUID;

@Document(collection = "solicitudes_cambio_bus")
public class SolicitudCambioBus {

    @Id
    private String id;

    @Field("tenant_id")
    private UUID tenantId;

    @Field("estudiante_id")
    private UUID estudianteId;

    @Field("bus_actual_id")
    private UUID busActualId;

    @Field("bus_deseado_id")
    private UUID busDeseadoId;

    private String motivo;
    private EstadoSolicitud estado;

    @Field("fecha_solicitud")
    private LocalDateTime fechaSolicitud;

    @Field("fecha_resolucion")
    private LocalDateTime fechaResolucion;

    private String notas;

    public SolicitudCambioBus() {}

    public static SolicitudCambioBus crear(UUID tenantId, UUID estudianteId,
                                            UUID busActualId, UUID busDeseadoId, String motivo) {
        if (estudianteId == null) throw new IllegalArgumentException("EstudianteId requerido.");
        if (motivo == null || motivo.isBlank()) throw new IllegalArgumentException("Motivo requerido.");

        SolicitudCambioBus s = new SolicitudCambioBus();
        s.id = UUID.randomUUID().toString();
        s.tenantId = tenantId;
        s.estudianteId = estudianteId;
        s.busActualId = busActualId;
        s.busDeseadoId = busDeseadoId;
        s.motivo = motivo;
        s.estado = EstadoSolicitud.PENDIENTE;
        s.fechaSolicitud = LocalDateTime.now();
        return s;
    }

    public void resolver(EstadoSolicitud nuevoEstado, String notas) {
        if (estado != EstadoSolicitud.PENDIENTE)
            throw new IllegalStateException("La solicitud ya fue resuelta.");
        this.estado = nuevoEstado;
        this.notas = notas;
        this.fechaResolucion = LocalDateTime.now();
    }

    public String getId() { return id; }
    public UUID getTenantId() { return tenantId; }
    public UUID getEstudianteId() { return estudianteId; }
    public UUID getBusActualId() { return busActualId; }
    public UUID getBusDeseadoId() { return busDeseadoId; }
    public String getMotivo() { return motivo; }
    public EstadoSolicitud getEstado() { return estado; }
    public LocalDateTime getFechaSolicitud() { return fechaSolicitud; }
    public LocalDateTime getFechaResolucion() { return fechaResolucion; }
    public String getNotas() { return notas; }
}
