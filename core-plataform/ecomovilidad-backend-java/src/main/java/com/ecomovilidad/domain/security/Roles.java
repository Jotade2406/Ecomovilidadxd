package com.ecomovilidad.domain.security;

/**
 * Constantes de roles para RBAC en el sistema EcoMovilidad AI.
 * Equivalente a Roles.cs en .NET.
 */
public final class Roles {

    public static final String ADMIN_INSTITUCION = "AdminInstitucion";
    public static final String COORDINADOR = "Coordinador";
    public static final String CONDUCTOR = "Conductor";
    public static final String PADRE_TUTOR = "PadreTutor";
    public static final String ESTUDIANTE = "Estudiante";
    public static final String AUDITOR = "Auditor";

    private Roles() {} // No instanciable
}
