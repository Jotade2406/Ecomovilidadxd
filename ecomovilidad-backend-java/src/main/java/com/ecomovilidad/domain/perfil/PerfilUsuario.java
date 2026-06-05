package com.ecomovilidad.domain.perfil;

import com.ecomovilidad.domain.common.Entity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@jakarta.persistence.Entity
@Table(name = "\"PerfilesUsuario\"", schema = "public")
public class PerfilUsuario extends Entity {

    @Column(name = "email", nullable = false, length = 100)
    private String email;

    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @Column(name = "telefono", length = 20)
    private String telefono;

    @Column(name = "avatar_url", length = 255)
    private String avatarUrl;

    @Column(name = "preferencia_notificaciones", nullable = false)
    private boolean preferenciaNotificaciones = true;

    @Column(name = "tema", nullable = false, length = 20)
    private String tema = "dark";

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion", nullable = false)
    private LocalDateTime fechaActualizacion;

    protected PerfilUsuario() { super(); }

    public static PerfilUsuario crear(String email, String nombre, UUID tenantId) {
        if (email == null || email.isBlank()) throw new IllegalArgumentException("Email requerido.");
        if (nombre == null || nombre.isBlank()) throw new IllegalArgumentException("Nombre requerido.");

        PerfilUsuario p = new PerfilUsuario();
        p.email = email;
        p.nombre = nombre;
        p.setTenantId(tenantId);
        p.fechaCreacion = LocalDateTime.now();
        p.fechaActualizacion = LocalDateTime.now();
        return p;
    }

    public void actualizar(String nombre, String telefono, String avatarUrl,
                           boolean preferenciaNotificaciones, String tema) {
        if (nombre != null && !nombre.isBlank()) this.nombre = nombre;
        this.telefono = telefono;
        this.avatarUrl = avatarUrl;
        this.preferenciaNotificaciones = preferenciaNotificaciones;
        if (tema != null && !tema.isBlank()) this.tema = tema;
        this.fechaActualizacion = LocalDateTime.now();
    }

    public String getEmail() { return email; }
    public String getNombre() { return nombre; }
    public String getTelefono() { return telefono; }
    public String getAvatarUrl() { return avatarUrl; }
    public boolean isPreferenciaNotificaciones() { return preferenciaNotificaciones; }
    public String getTema() { return tema; }
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public LocalDateTime getFechaActualizacion() { return fechaActualizacion; }
}
