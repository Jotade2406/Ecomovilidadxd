package com.ecomovilidad.api;

import com.ecomovilidad.domain.viajes.EstadoViaje;
import com.ecomovilidad.infrastructure.persistence.repositories.*;
import com.ecomovilidad.infrastructure.security.TenantProvider;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/Stats")
@Tag(name = "Stats", description = "Estadísticas del dashboard")
@SecurityRequirement(name = "Bearer")
public class StatsController {

    // kg CO2 ahorrado por viaje completado (estimado: 15 estudiantes × 12 km × 0.19 kg/km)
    private static final double CO2_KG_POR_VIAJE = 34.2;

    private final RutaJpaRepository rutaRepo;
    private final ViajeJpaRepository viajeRepo;
    private final EstudianteJpaRepository estudianteRepo;
    private final ConductorJpaRepository conductorRepo;
    private final VehiculoJpaRepository vehiculoRepo;
    private final TenantProvider tenantProvider;

    public StatsController(
            RutaJpaRepository rutaRepo,
            ViajeJpaRepository viajeRepo,
            EstudianteJpaRepository estudianteRepo,
            ConductorJpaRepository conductorRepo,
            VehiculoJpaRepository vehiculoRepo,
            TenantProvider tenantProvider) {
        this.rutaRepo = rutaRepo;
        this.viajeRepo = viajeRepo;
        this.estudianteRepo = estudianteRepo;
        this.conductorRepo = conductorRepo;
        this.vehiculoRepo = vehiculoRepo;
        this.tenantProvider = tenantProvider;
    }

    public record StatsResponse(
            long rutasActivas,
            long rutasTotal,
            long viajesEnCurso,
            long viajesHoy,
            long viajesCompletadosTotal,
            long totalEstudiantes,
            long totalConductores,
            long totalVehiculos,
            double co2AhorradoKg,
            double co2AhorradoTon
    ) {}

    @GetMapping
    @Operation(summary = "Estadísticas globales del tenant para el dashboard")
    public ResponseEntity<StatsResponse> getStats() {
        UUID tenantId = tenantProvider.getTenantId();
        LocalDate hoy = LocalDate.now();

        var rutas = rutaRepo.findByTenantIdOrderByFechaCreacionDesc(tenantId);
        long rutasActivas = rutas.stream().filter(r -> "Activa".equals(r.getEstado())).count();

        var viajes = viajeRepo.findByTenantIdOrderByCreadoEnDesc(tenantId);
        long viajesEnCurso    = viajes.stream().filter(v -> v.getEstado() == EstadoViaje.EnCurso).count();
        long viajesHoy        = viajes.stream().filter(v -> v.getCreadoEn().toLocalDate().equals(hoy)).count();
        long viajesCompletados = viajes.stream().filter(v -> v.getEstado() == EstadoViaje.Completado).count();

        long totalEstudiantes = estudianteRepo.findByTenantId(tenantId).size();
        long totalConductores = conductorRepo.findByTenantId(tenantId).size();
        long totalVehiculos   = vehiculoRepo.findByTenantId(tenantId).size();

        double co2Kg  = viajesCompletados * CO2_KG_POR_VIAJE;
        double co2Ton = Math.round(co2Kg / 10.0) / 100.0;

        return ResponseEntity.ok(new StatsResponse(
                rutasActivas, rutas.size(),
                viajesEnCurso, viajesHoy, viajesCompletados,
                totalEstudiantes, totalConductores, totalVehiculos,
                co2Kg, co2Ton
        ));
    }
}
