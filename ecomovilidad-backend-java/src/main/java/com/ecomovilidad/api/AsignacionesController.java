package com.ecomovilidad.api;

import com.ecomovilidad.application.asignaciones.dtos.AsignacionRutaResponse;
import com.ecomovilidad.application.asignaciones.dtos.CrearAsignacionRequest;
import com.ecomovilidad.application.asignaciones.services.AsignacionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

/**
 * Controlador RESTful para gestionar asignaciones fijas de Ruta-Vehículo-Conductor.
 * Un vehículo mantiene su ruta fija independientemente del conductor.
 */
@RestController
@RequestMapping("/api/Asignaciones")
@Tag(name = "Asignaciones", description = "Asignaciones fijas de Ruta-Vehículo-Conductor")
@SecurityRequirement(name = "Bearer")
@ApiResponse(responseCode = "401", description = "No autorizado (Token faltante o inválido)")
public class AsignacionesController {

    private final AsignacionService asignacionService;

    public AsignacionesController(AsignacionService asignacionService) {
        this.asignacionService = asignacionService;
    }

    @PostMapping
    @Operation(summary = "Crea una nueva asignación ruta-vehículo-conductor")
    public ResponseEntity<AsignacionRutaResponse> crear(@RequestBody CrearAsignacionRequest request) {
        var response = asignacionService.crear(request);
        return ResponseEntity.created(URI.create("/api/Asignaciones/" + response.id())).body(response);
    }

    @GetMapping
    @Operation(summary = "Lista todas las asignaciones del tenant actual")
    public ResponseEntity<List<AsignacionRutaResponse>> obtenerTodas() {
        return ResponseEntity.ok(asignacionService.obtenerTodas());
    }

    @GetMapping("/activas")
    @Operation(summary = "Lista solo las asignaciones activas")
    public ResponseEntity<List<AsignacionRutaResponse>> obtenerActivas() {
        return ResponseEntity.ok(asignacionService.obtenerActivas());
    }

    @PatchMapping("/{id}/desactivar")
    @Operation(summary = "Desactiva una asignación")
    public ResponseEntity<AsignacionRutaResponse> desactivar(@PathVariable UUID id) {
        return ResponseEntity.ok(asignacionService.desactivar(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Elimina una asignación")
    public ResponseEntity<Void> eliminar(@PathVariable UUID id) {
        asignacionService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
