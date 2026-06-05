package com.ecomovilidad.domain.tenants;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tenants", schema = "public")
public class Tenant {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "nombre", nullable = false, length = 200)
    private String nombre;

    @Column(name = "codigo", nullable = false, unique = true, length = 20)
    private String codigo;

    @Column(name = "estado", nullable = false, length = 20)
    private String estado;

    @Column(name = "creado_en", nullable = false, updatable = false)
    private LocalDateTime creadoEn;

    protected Tenant() {}

    public static Tenant crear(String nombre) {
        var t = new Tenant();
        t.id = UUID.randomUUID();
        t.nombre = nombre.trim();
        t.codigo = generarCodigo(nombre);
        t.estado = "Activo";
        t.creadoEn = LocalDateTime.now();
        return t;
    }

    private static String generarCodigo(String nombre) {
        String limpio = nombre.toUpperCase().replaceAll("[^A-Z0-9]", "");
        String base = limpio.isEmpty() ? "INST" : limpio.substring(0, Math.min(4, limpio.length()));
        int sufijo = (int) (Math.random() * 9000) + 1000;
        return base + sufijo;
    }

    public UUID getId()              { return id; }
    public String getNombre()        { return nombre; }
    public String getCodigo()        { return codigo; }
    public String getEstado()        { return estado; }
    public LocalDateTime getCreadoEn() { return creadoEn; }
}
