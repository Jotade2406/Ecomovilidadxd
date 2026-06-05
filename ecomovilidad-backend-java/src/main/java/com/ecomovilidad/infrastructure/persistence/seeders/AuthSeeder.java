package com.ecomovilidad.infrastructure.persistence.seeders;

import com.ecomovilidad.domain.auth.UsuarioApp;
import com.ecomovilidad.domain.flota.Conductor;
import com.ecomovilidad.infrastructure.persistence.repositories.ConductorJpaRepository;
import com.ecomovilidad.infrastructure.persistence.repositories.UsuarioAppJpaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Siembra cuentas de auth y sincroniza Choferes con la tabla Conductores.
 * Idempotente: no duplica registros existentes.
 */
@Component
@Order(1)
public class AuthSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AuthSeeder.class);
    private static final UUID TENANT = UUID.fromString("00000000-0000-0000-0000-000000000001");

    private final UsuarioAppJpaRepository repo;
    private final ConductorJpaRepository conductorRepo;
    private final PasswordEncoder encoder;

    public AuthSeeder(UsuarioAppJpaRepository repo, ConductorJpaRepository conductorRepo,
                      PasswordEncoder encoder) {
        this.repo = repo;
        this.conductorRepo = conductorRepo;
        this.encoder = encoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        seed("admin@gmail.com",  "CALLE1DXVD2", "Administrador", "AdminInstitucion");
        seed("brayan@gmail.com", "Test1234",     "Brayan",        "Estudiante");
        seed("porro@gmail.com",  "Test1234",     "Porro",         "Chofer");
        seed("franz@gmail.com",  "Test1234",     "Franz",         "Chofer");
        log.info("✅ AuthSeeder: cuentas verificadas.");

        // Sincronizar todos los Choferes de usuarios_app → tabla Conductores
        int synced = 0;
        for (UsuarioApp u : repo.findByRole("Chofer")) {
            String licencia = licenciaDeUsuario(u.getId());
            if (!conductorRepo.existsByLicencia(licencia)) {
                Conductor c = Conductor.crear(u.getNombre(), licencia, "Mañana");
                c.setTenantId(TENANT);
                conductorRepo.save(c);
                synced++;
                log.info("  → Conductor sincronizado: {} ({})", u.getNombre(), u.getEmail());
            }
        }
        if (synced > 0) log.info("  → {} conductor(es) añadido(s) a flota.", synced);
    }

    private void seed(String email, String password, String nombre, String role) {
        if (!repo.existsByEmailIgnoreCase(email)) {
            repo.save(new UsuarioApp(email, encoder.encode(password), nombre, role, TENANT));
            log.info("  → Creado: {} ({})", email, role);
        }
    }

    public static String licenciaDeUsuario(UUID userId) {
        return userId.toString().replace("-", "").substring(0, 10).toUpperCase();
    }
}
