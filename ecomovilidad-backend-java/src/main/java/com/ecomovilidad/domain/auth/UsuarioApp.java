package com.ecomovilidad.domain.auth;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entidad JPA para usuarios de autenticación.
 * Persiste en la tabla usuarios_app de PostgreSQL.
 */
@Entity
@Table(name = "usuarios_app")
public class UsuarioApp {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String role;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "creado_en", nullable = false)
    private LocalDateTime creadoEn;

    // JPA
    protected UsuarioApp() {}

    public UsuarioApp(String email, String passwordHash, String nombre, String role, UUID tenantId) {
        this.email = email.toLowerCase();
        this.passwordHash = passwordHash;
        this.nombre = nombre;
        this.role = role;
        this.tenantId = tenantId;
        this.creadoEn = LocalDateTime.now();
    }

    public UUID getId()             { return id; }
    public String getEmail()        { return email; }
    public String getPasswordHash() { return passwordHash; }
    public String getNombre()       { return nombre; }
    public String getRole()         { return role; }
    public UUID getTenantId()       { return tenantId; }
    public LocalDateTime getCreadoEn() { return creadoEn; }

    public void setRole(String role)       { this.role = role; }
    public void setTenantId(UUID tenantId) { this.tenantId = tenantId; }
}
