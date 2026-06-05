package com.ecomovilidad.domain.comunidad;

import com.ecomovilidad.domain.common.Entity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entidad de dominio que representa un Estudiante.
 * Equivalente a Estudiante.cs en .NET.
 */
@jakarta.persistence.Entity
@Table(name = "\"Estudiantes\"", schema = "public")
public class Estudiante extends Entity {

    @Column(name = "nombre", nullable = false)
    private String nombre;

    @Column(name = "codigo_qr", nullable = false)
    private String codigoQR;

    @Column(name = "qr_code_ttl", nullable = false)
    private LocalDateTime qrCodeTTL;

    @Column(name = "tutor_id", nullable = false)
    private UUID tutorId;

    @Column(name = "parada_asignada", nullable = false)
    private String paradaAsignada;

    // Constructor JPA
    protected Estudiante() { super(); }

    public static Estudiante crear(String nombre, UUID tutorId, String paradaAsignada) {
        Estudiante estudiante = new Estudiante();
        estudiante.nombre = nombre;
        estudiante.tutorId = tutorId;
        estudiante.paradaAsignada = paradaAsignada;
        estudiante.generarNuevoQR();
        return estudiante;
    }

    public void generarNuevoQR() {
        if (qrCodeTTL != null && qrCodeTTL.isAfter(LocalDateTime.now())) return;
        codigoQR = "QR_" + getId() + "_" + UUID.randomUUID().toString().substring(0, 8);
        qrCodeTTL = LocalDateTime.now().plusDays(1);
    }

    public String getNombre() { return nombre; }
    public String getCodigoQR() { return codigoQR; }
    public LocalDateTime getQrCodeTTL() { return qrCodeTTL; }
    public UUID getTutorId() { return tutorId; }
    public String getParadaAsignada() { return paradaAsignada; }
}
