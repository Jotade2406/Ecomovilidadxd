package com.ecomovilidad.api;

import com.ecomovilidad.application.viajes.dtos.*;
import com.ecomovilidad.application.viajes.services.ViajeService;
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
 * Controlador RESTful para el Bounded Context de Viajes.
 * Sprint 1: CRUD básico + iniciar/completar/cancelar.
 * Sprint 2: Asignar estudiantes, cerrar viaje, tracking de estado por estudiante.
 * Equivalente a ViajesController.cs en .NET.
 */
@RestController
@RequestMapping("/api/Viajes")
@Tag(name = "Viajes", description = "Gestión de viajes operativos")
@SecurityRequirement(name = "Bearer")
@ApiResponse(responseCode = "401", description = "No autorizado (Token faltante o inválido)")
public class ViajesController {

    private final ViajeService viajeService;

    public ViajesController(ViajeService viajeService) {
        this.viajeService = viajeService;
    }

    // ═══════════════════════════════════════════════════════════════════
    // SPRINT 1 — Endpoints existentes
    // ═══════════════════════════════════════════════════════════════════

    // ─── POST /api/Viajes/iniciar ────────────────────────────────────

    @PostMapping("/iniciar")
    @Operation(summary = "Crea e inicia un viaje: asigna conductor + vehículo a una ruta activa")
    public ResponseEntity<ViajeResponse> iniciar(@RequestBody IniciarViajeRequest request) {
        var response = viajeService.iniciarViaje(request);
        return ResponseEntity.created(URI.create("/api/Viajes/" + response.id())).body(response);
    }

    // ─── GET /api/Viajes ─────────────────────────────────────────────

    @GetMapping
    @Operation(summary = "Lista todos los viajes del tenant actual")
    public ResponseEntity<List<ViajeResponse>> obtenerTodos() {
        return ResponseEntity.ok(viajeService.obtenerTodos());
    }

    // ─── GET /api/Viajes/{id} ────────────────────────────────────────

    @GetMapping("/{id}")
    @Operation(summary = "Obtiene un viaje por su identificador")
    public ResponseEntity<ViajeResponse> obtenerPorId(@PathVariable UUID id) {
        var response = viajeService.obtenerPorId(id);
        return response != null ? ResponseEntity.ok(response) : ResponseEntity.notFound().build();
    }

    // ─── PATCH /api/Viajes/{id}/completar ────────────────────────────

    @PatchMapping("/{id}/completar")
    @Operation(summary = "Marca un viaje en curso como completado")
    public ResponseEntity<ViajeResponse> completar(@PathVariable UUID id) {
        return ResponseEntity.ok(viajeService.completarViaje(id));
    }

    // ─── PATCH /api/Viajes/{id}/cancelar ─────────────────────────────

    @PatchMapping("/{id}/cancelar")
    @Operation(summary = "Cancela un viaje programado o en curso")
    public ResponseEntity<ViajeResponse> cancelar(@PathVariable UUID id) {
        return ResponseEntity.ok(viajeService.cancelarViaje(id));
    }

    // ═══════════════════════════════════════════════════════════════════
    // SPRINT 2 — Estudiantes en viaje + Cerrar viaje
    // ═══════════════════════════════════════════════════════════════════

    // ─── POST /api/Viajes/{id}/asignar-estudiantes ───────────────────

    @PostMapping("/{id}/asignar-estudiantes")
    @Operation(summary = "Asigna una lista de estudiantes a un viaje en curso o programado")
    public ResponseEntity<AsignarEstudiantesResponse> asignarEstudiantes(
            @PathVariable UUID id,
            @RequestBody AsignarEstudiantesRequest request) {
        return ResponseEntity.ok(viajeService.asignarEstudiantes(id, request));
    }

    // ─── PATCH /api/Viajes/{id}/cerrar ───────────────────────────────

    @PatchMapping("/{id}/cerrar")
    @Operation(summary = "Cierra un viaje en curso → estado COMPLETADO con evento ViajeCerrado")
    public ResponseEntity<CerrarViajeResponse> cerrar(@PathVariable UUID id) {
        return ResponseEntity.ok(viajeService.cerrarViaje(id));
    }

    // ─── GET /api/Viajes/{id}/estudiantes ────────────────────────────

    @GetMapping("/{id}/estudiantes")
    @Operation(summary = "Lista los estudiantes asignados a un viaje")
    public ResponseEntity<List<EstudianteEnViajeResponse>> obtenerEstudiantes(@PathVariable UUID id) {
        return ResponseEntity.ok(viajeService.obtenerEstudiantesEnViaje(id));
    }

    // ─── PATCH /api/Viajes/{id}/estudiantes/{estudianteId}/transporte ─

    @PatchMapping("/{id}/estudiantes/{estudianteId}/transporte")
    @Operation(summary = "Marca un estudiante como EN_TRANSPORTE dentro del viaje")
    public ResponseEntity<EstudianteEnViajeResponse> marcarEnTransporte(
            @PathVariable UUID id,
            @PathVariable UUID estudianteId) {
        return ResponseEntity.ok(viajeService.marcarEstudianteEnTransporte(id, estudianteId));
    }

    // ─── PATCH /api/Viajes/{id}/estudiantes/{estudianteId}/descendido ─

    @PatchMapping("/{id}/estudiantes/{estudianteId}/descendido")
    @Operation(summary = "Marca un estudiante como DESCENDIDO (bajó del vehículo)")
    public ResponseEntity<EstudianteEnViajeResponse> marcarDescendido(
            @PathVariable UUID id,
            @PathVariable UUID estudianteId) {
        return ResponseEntity.ok(viajeService.marcarEstudianteDescendido(id, estudianteId));
    }
}
