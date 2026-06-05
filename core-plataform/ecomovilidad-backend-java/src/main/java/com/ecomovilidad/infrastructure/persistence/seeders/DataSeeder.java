package com.ecomovilidad.infrastructure.persistence.seeders;

import com.ecomovilidad.domain.comunidad.Estudiante;
import com.ecomovilidad.domain.flota.Conductor;
import com.ecomovilidad.domain.flota.Vehiculo;
import com.ecomovilidad.infrastructure.persistence.repositories.ConductorJpaRepository;
import com.ecomovilidad.infrastructure.persistence.repositories.EstudianteJpaRepository;
import com.ecomovilidad.infrastructure.persistence.repositories.VehiculoJpaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Random;
import java.util.UUID;

/**
 * Data Seeder — @Component ApplicationRunner.
 * Equivalente a DataSeeder.cs en .NET.
 * Idempotente: solo siembra si la tabla vehiculos está vacía.
 *
 * Crea: 5 Vehículos, 5 Conductores, 100 Estudiantes
 * Todo bajo tenant: 00000000-0000-0000-0000-000000000001
 */
@Component
public class DataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final VehiculoJpaRepository vehiculoRepository;
    private final ConductorJpaRepository conductorRepository;
    private final EstudianteJpaRepository estudianteRepository;

    public DataSeeder(VehiculoJpaRepository vehiculoRepository,
                      ConductorJpaRepository conductorRepository,
                      EstudianteJpaRepository estudianteRepository) {
        this.vehiculoRepository = vehiculoRepository;
        this.conductorRepository = conductorRepository;
        this.estudianteRepository = estudianteRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (vehiculoRepository.count() > 0) {
            log.info("✅ DataSeeder: datos ya existen, saltando seed.");
            return;
        }

        log.info("▶ Iniciando DataSeeder...");

        UUID tenantPrincipal = UUID.fromString("00000000-0000-0000-0000-000000000001");
        String[] zonas = {"Equipetrol", "Las Palmas", "Av. Busch", "Urubó", "Centro"};
        Random rnd = new Random();

        // ── 5 Vehículos ────────────────────────────────────────────────
        for (int i = 1; i <= 5; i++) {
            String placa = "ECO-" + (rnd.nextInt(900) + 100);
            BigDecimal fuelRate = BigDecimal.valueOf(rnd.nextDouble() * 0.2 + 0.1)
                    .setScale(4, RoundingMode.HALF_UP);
            Vehiculo v = Vehiculo.crear(placa, 30, fuelRate);
            v.setTenantId(tenantPrincipal);
            vehiculoRepository.save(v);
        }

        // ── 5 Conductores ──────────────────────────────────────────────
        if (conductorRepository.count() == 0) {
            for (int i = 1; i <= 5; i++) {
                String licencia = "LIC" + (rnd.nextInt(90000) + 10000);
                Conductor c = Conductor.crear("Conductor " + i, licencia, "Mañana");
                c.setTenantId(tenantPrincipal);
                conductorRepository.save(c);
            }
        }

        // ── 100 Estudiantes ────────────────────────────────────────────
        for (int i = 1; i <= 100; i++) {
            UUID tutorId = UUID.randomUUID();
            String parada = zonas[rnd.nextInt(zonas.length)];
            Estudiante e = Estudiante.crear("Estudiante " + i, tutorId, parada);
            e.setTenantId(tenantPrincipal);
            estudianteRepository.save(e);
        }

        log.info("✅ Seed completado: 5 Conductores, 5 Vehículos, 100 Estudiantes listos.");
    }
}
