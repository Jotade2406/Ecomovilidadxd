package com.ecomovilidad.domain.asistencia;

import com.ecomovilidad.domain.common.Entity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@jakarta.persistence.Entity
@Table(name = "\"RegistrosAsistencia\"", schema = "public")
public class RegistroAsistencia extends Entity {

    @Column(name = "estudiante_id", nullable = false)
    private UUID estudianteId;

    @Column(name = "viaje_id", nullable = false)
    private UUID viajeId;

    @Column(name = "conductor_id", nullable = false)
    private UUID conductorId;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false, length = 10)
    private TipoAsistencia tipo;

    @Column(name = "hora_registro", nullable = false)
    private LocalDateTime horaRegistro;

    @Column(name = "codigo_qr_escaneado", length = 100)
    private String codigoQrEscaneado;

    protected RegistroAsistencia() { super(); }

    public static RegistroAsistencia registrar(UUID estudianteId, UUID viajeId,
                                                UUID conductorId, TipoAsistencia tipo,
                                                String codigoQr) {
        if (estudianteId == null) throw new IllegalArgumentException("EstudianteId requerido.");
        if (viajeId == null) throw new IllegalArgumentException("ViajeId requerido.");
        if (conductorId == null) throw new IllegalArgumentException("ConductorId requerido.");
        if (tipo == null) throw new IllegalArgumentException("TipoAsistencia requerido.");

        RegistroAsistencia r = new RegistroAsistencia();
        r.estudianteId = estudianteId;
        r.viajeId = viajeId;
        r.conductorId = conductorId;
        r.tipo = tipo;
        r.horaRegistro = LocalDateTime.now();
        r.codigoQrEscaneado = codigoQr;
        return r;
    }

    public UUID getEstudianteId() { return estudianteId; }
    public UUID getViajeId() { return viajeId; }
    public UUID getConductorId() { return conductorId; }
    public TipoAsistencia getTipo() { return tipo; }
    public LocalDateTime getHoraRegistro() { return horaRegistro; }
    public String getCodigoQrEscaneado() { return codigoQrEscaneado; }
}
