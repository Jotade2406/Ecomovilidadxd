package com.ecomovilidad.api;

import com.ecomovilidad.application.solicitudes.dtos.*;
import com.ecomovilidad.application.solicitudes.services.SolicitudService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/Solicitudes")
@Tag(name = "Solicitudes", description = "Solicitudes de cambio de bus y emergencias")
@SecurityRequirement(name = "Bearer")
@ApiResponse(responseCode = "401", description = "No autorizado (Token faltante o inválido)")
public class SolicitudesController {

    private final SolicitudService solicitudService;

    public SolicitudesController(SolicitudService solicitudService) {
        this.solicitudService = solicitudService;
    }

    // ── Cambio de Bus ────────────────────────────────────────────────────

    @PostMapping("/cambio-bus")
    @Operation(summary = "Crea una solicitud de cambio de bus temporal")
    public ResponseEntity<SolicitudCambioBusResponse> crearCambioBus(
            @RequestBody CrearSolicitudCambioBusRequest request) {
        return ResponseEntity.ok(solicitudService.crearCambioBus(request));
    }

    @GetMapping("/cambio-bus")
    @Operation(summary = "Lista todas las solicitudes de cambio de bus del tenant")
    public ResponseEntity<List<SolicitudCambioBusResponse>> obtenerCambiosBus() {
        return ResponseEntity.ok(solicitudService.obtenerCambiosBus());
    }

    @GetMapping("/cambio-bus/estudiante/{estudianteId}")
    @Operation(summary = "Lista las solicitudes de cambio de bus de un estudiante")
    public ResponseEntity<List<SolicitudCambioBusResponse>> obtenerCambiosBusPorEstudiante(
            @PathVariable UUID estudianteId) {
        return ResponseEntity.ok(solicitudService.obtenerCambiosBusPorEstudiante(estudianteId));
    }

    @PatchMapping("/cambio-bus/{id}/resolver")
    @Operation(summary = "Aprueba o rechaza una solicitud de cambio de bus")
    public ResponseEntity<SolicitudCambioBusResponse> resolverCambioBus(
            @PathVariable String id, @RequestBody ResolverSolicitudRequest request) {
        return ResponseEntity.ok(solicitudService.resolverCambioBus(id, request));
    }

    // ── Bus de Emergencia ────────────────────────────────────────────────

    @PostMapping("/emergencia")
    @Operation(summary = "Crea una solicitud de bus de emergencia (missed bus)")
    public ResponseEntity<SolicitudEmergenciaResponse> crearEmergencia(
            @RequestBody CrearSolicitudEmergenciaRequest request) {
        return ResponseEntity.ok(solicitudService.crearEmergencia(request));
    }

    @GetMapping("/emergencia")
    @Operation(summary = "Lista todas las solicitudes de emergencia del tenant")
    public ResponseEntity<List<SolicitudEmergenciaResponse>> obtenerEmergencias() {
        return ResponseEntity.ok(solicitudService.obtenerEmergencias());
    }

    @GetMapping("/emergencia/estudiante/{estudianteId}")
    @Operation(summary = "Lista las solicitudes de emergencia de un estudiante")
    public ResponseEntity<List<SolicitudEmergenciaResponse>> obtenerEmergenciasPorEstudiante(
            @PathVariable UUID estudianteId) {
        return ResponseEntity.ok(solicitudService.obtenerEmergenciasPorEstudiante(estudianteId));
    }

    @PatchMapping("/emergencia/{id}/atender")
    @Operation(summary = "Marca una solicitud de emergencia como atendida")
    public ResponseEntity<SolicitudEmergenciaResponse> atenderEmergencia(@PathVariable String id) {
        return ResponseEntity.ok(solicitudService.atenderEmergencia(id));
    }
}
