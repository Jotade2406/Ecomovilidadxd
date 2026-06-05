package com.ecomovilidad.api;

import com.ecomovilidad.application.flota.dtos.ConductorResponse;
import com.ecomovilidad.application.flota.dtos.CrearVehiculoCommand;
import com.ecomovilidad.application.flota.dtos.VehiculoDto;
import com.ecomovilidad.application.flota.services.FlotaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

/**
 * Controlador RESTful para la gestión de Flota.
 * Requiere rol AdminInstitucion (configurado en SecurityConfig).
 * Equivalente a FlotaController.cs en .NET.
 */
@RestController
@RequestMapping("/api/Flota")
@Tag(name = "Flota", description = "Gestión de vehículos y conductores")
@SecurityRequirement(name = "Bearer")
@ApiResponse(responseCode = "401", description = "No autorizado (Token faltante o inválido)")
public class FlotaController {

    private final FlotaService flotaService;

    public FlotaController(FlotaService flotaService) {
        this.flotaService = flotaService;
    }

    @PostMapping("/vehiculos")
    @Operation(summary = "Crea un nuevo vehículo")
    public ResponseEntity<VehiculoDto> crearVehiculo(@RequestBody CrearVehiculoCommand command) {
        var response = flotaService.crearVehiculo(command);
        return ResponseEntity.created(URI.create("/api/Flota/vehiculos/" + response.id())).body(response);
    }

    @GetMapping("/vehiculos")
    @Operation(summary = "Lista todos los vehículos del tenant actual")
    public ResponseEntity<List<VehiculoDto>> obtenerVehiculos() {
        return ResponseEntity.ok(flotaService.obtenerVehiculos());
    }

    @GetMapping("/conductores")
    @Operation(summary = "Lista todos los conductores del tenant actual")
    public ResponseEntity<List<ConductorResponse>> listarConductores() {
        return ResponseEntity.ok(flotaService.listarConductores());
    }

    @GetMapping("/conductores/mi-perfil")
    @Operation(summary = "Obtiene el perfil del conductor del usuario autenticado")
    public ResponseEntity<ConductorResponse> miPerfil(Authentication authentication) {
        return flotaService.findConductorByEmail(authentication.getName())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}

