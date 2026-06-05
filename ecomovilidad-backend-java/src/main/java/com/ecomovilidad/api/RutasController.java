package com.ecomovilidad.api;

import com.ecomovilidad.application.rutas.dtos.*;
import com.ecomovilidad.application.rutas.services.RutaService;
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
 * Controlador RESTful para el Bounded Context de Rutas.
 * Delega toda la lógica al RutaService de la capa Application.
 * Equivalente a RutasController.cs en .NET.
 */
@RestController
@RequestMapping("/api/Rutas")
@Tag(name = "Rutas", description = "CRUD de Rutas con gestión de estados")
@SecurityRequirement(name = "Bearer")
@ApiResponse(responseCode = "401", description = "No autorizado (Token faltante o inválido)")
public class RutasController {

    private final RutaService rutaService;

    public RutasController(RutaService rutaService) {
        this.rutaService = rutaService;
    }

    // ─── POST /api/Rutas ───────────────────────────────────────────────

    @PostMapping
    @Operation(summary = "Crea una nueva ruta en estado Borrador")
    public ResponseEntity<RutaResponse> crear(@RequestBody CrearRutaRequest request) {
        var response = rutaService.crear(request);
        return ResponseEntity.created(URI.create("/api/Rutas/" + response.id())).body(response);
    }

    // ─── GET /api/Rutas ────────────────────────────────────────────────

    @GetMapping
    @Operation(summary = "Lista todas las rutas del tenant actual")
    public ResponseEntity<List<RutaResponse>> obtenerTodas() {
        return ResponseEntity.ok(rutaService.obtenerTodas());
    }

    // ─── GET /api/Rutas/{id} ───────────────────────────────────────────

    @GetMapping("/{id}")
    @Operation(summary = "Obtiene una ruta por su identificador")
    public ResponseEntity<RutaResponse> obtenerPorId(@PathVariable UUID id) {
        var response = rutaService.obtenerPorId(id);
        return response != null ? ResponseEntity.ok(response) : ResponseEntity.notFound().build();
    }

    // ─── PATCH /api/Rutas/{id}/activar ─────────────────────────────────

    @PatchMapping("/{id}/activar")
    @Operation(summary = "Activa una ruta (Borrador → Activa)")
    public ResponseEntity<RutaResponse> activar(@PathVariable UUID id) {
        return ResponseEntity.ok(rutaService.activar(id));
    }

    // ─── PATCH /api/Rutas/{id}/suspender ───────────────────────────────

    @PatchMapping("/{id}/suspender")
    @Operation(summary = "Suspende una ruta (Activa → Suspendida)")
    public ResponseEntity<RutaResponse> suspender(@PathVariable UUID id) {
        return ResponseEntity.ok(rutaService.suspender(id));
    }

    // ─── PATCH /api/Rutas/{id}/finalizar ───────────────────────────────

    @PatchMapping("/{id}/finalizar")
    @Operation(summary = "Finaliza una ruta (Activa → Finalizada)")
    public ResponseEntity<RutaResponse> finalizar(@PathVariable UUID id) {
        return ResponseEntity.ok(rutaService.finalizar(id));
    }

    // ─── POST /api/Rutas/{id}/puntos-intermedios ───────────────────────

    @PostMapping("/{id}/puntos-intermedios")
    @Operation(summary = "Agrega puntos intermedios a una ruta en estado Borrador")
    public ResponseEntity<RutaResponse> agregarPuntosIntermedios(
            @PathVariable UUID id,
            @RequestBody List<AgregarPuntoIntermedioRequest> requests) {
        return ResponseEntity.ok(rutaService.agregarPuntosIntermedios(id, requests));
    }

    // ─── DELETE /api/Rutas/{id} ────────────────────────────────────────

    @DeleteMapping("/{id}")
    @Operation(summary = "Elimina una ruta")
    public ResponseEntity<Void> eliminar(@PathVariable UUID id) {
        rutaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    // ─── GET /api/Rutas/{id}/historial ──────────────────────────────────

    @GetMapping("/{id}/historial")
    @Operation(summary = "Obtiene el historial de versiones de una ruta")
    public ResponseEntity<List<RutaVersionResponse>> obtenerHistorial(@PathVariable UUID id) {
        return ResponseEntity.ok(rutaService.obtenerHistorial(id));
    }
}
