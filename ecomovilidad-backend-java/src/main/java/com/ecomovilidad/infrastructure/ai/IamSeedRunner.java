package com.ecomovilidad.infrastructure.ai;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Al arrancar el backend principal, registra los roles de EcoMovilidad
 * en el iam-service. La operación es idempotente (si el rol ya existe,
 * el iam-service lo devuelve sin error).
 * Si el iam-service no está disponible, simplemente se omite con un log.
 */
@Component
public class IamSeedRunner implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(IamSeedRunner.class);

    private final IamServiceClient iamClient;

    public IamSeedRunner(IamServiceClient iamClient) {
        this.iamClient = iamClient;
    }

    private record RolDef(String nombre, String descripcion) {}

    private static final RolDef[] ROLES = {
        new RolDef("AdminInstitucion", "Administrador de institución educativa — acceso completo al tenant"),
        new RolDef("Chofer",           "Conductor de bus escolar — gestiona viajes y asistencia"),
        new RolDef("Estudiante",       "Estudiante — seguimiento de ruta, QR y pagos"),
        new RolDef("Cliente",          "Cliente / Apoderado — seguimiento del estudiante"),
        new RolDef("SuperAdmin",       "Administrador central del sistema — gestiona todas las instituciones"),
    };

    @Override
    public void run(String... args) {
        if (!iamClient.estaActivo()) {
            log.warn("iam-service no disponible al iniciar — se omite la sincronización de roles");
            return;
        }

        log.info("Sincronizando roles EcoMovilidad con iam-service…");
        int ok = 0;
        for (RolDef rol : ROLES) {
            if (iamClient.registrarRol(rol.nombre(), rol.descripcion())) ok++;
        }
        log.info("Sincronización de roles completada: {}/{} registrados", ok, ROLES.length);
    }
}
