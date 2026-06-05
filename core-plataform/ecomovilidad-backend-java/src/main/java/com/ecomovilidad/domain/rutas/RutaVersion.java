package com.ecomovilidad.domain.rutas;

import com.ecomovilidad.domain.common.Entity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Representa una snapshot histórica del estado de una Ruta.
 * Equivalente a RutaVersion.cs en .NET.
 */
@jakarta.persistence.Entity
@Table(name = "ruta_versiones", schema = "rutas")
public class RutaVersion extends Entity {

    @Column(name = "ruta_id", nullable = false)
    private UUID rutaId;

    @Column(name = "version", nullable = false)
    private int version;

    @Column(name = "snapshot", nullable = false, columnDefinition = "jsonb")
    private String snapshot;

    @Column(name = "cambio_descripcion", nullable = false, length = 500)
    private String cambioDescripcion;

    @Column(name = "creado_por", nullable = false, length = 200)
    private String creadoPor;

    @Column(name = "creado_en", nullable = false)
    private LocalDateTime creadoEn;

    protected RutaVersion() { super(); }

    public static RutaVersion crear(UUID rutaId, int version, String snapshot,
                                     String cambioDescripcion, String creadoPor) {
        RutaVersion rv = new RutaVersion();
        rv.rutaId = rutaId;
        rv.version = version;
        rv.snapshot = snapshot;
        rv.cambioDescripcion = cambioDescripcion != null ? cambioDescripcion : "Sin descripción";
        rv.creadoPor = creadoPor != null ? creadoPor : "Sistema";
        rv.creadoEn = LocalDateTime.now();
        return rv;
    }

    public UUID getRutaId() { return rutaId; }
    public int getVersion() { return version; }
    public String getSnapshot() { return snapshot; }
    public String getCambioDescripcion() { return cambioDescripcion; }
    public String getCreadoPor() { return creadoPor; }
    public LocalDateTime getCreadoEn() { return creadoEn; }
}
