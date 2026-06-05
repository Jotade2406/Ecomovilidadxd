package com.ecomovilidad.api;

import com.ecomovilidad.application.asistencia.dtos.AsistenciaResponse;
import com.ecomovilidad.application.asistencia.dtos.RegistrarAsistenciaRequest;
import com.ecomovilidad.application.asistencia.services.AsistenciaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/Asistencia")
@Tag(name = "Asistencia", description = "Registro de asistencia QR para viajes")
@SecurityRequirement(name = "Bearer")
@ApiResponse(responseCode = "401", description = "No autorizado (Token faltante o inválido)")
public class AsistenciaController {

    private final AsistenciaService asistenciaService;

    public AsistenciaController(AsistenciaService asistenciaService) {
        this.asistenciaService = asistenciaService;
    }

    @PostMapping
    @Operation(summary = "Registra la asistencia de un estudiante (IDA o VUELTA)")
    @ApiResponse(responseCode = "201", description = "Asistencia registrada correctamente")
    public ResponseEntity<AsistenciaResponse> registrar(@RequestBody RegistrarAsistenciaRequest request) {
        var response = asistenciaService.registrar(request);
        return ResponseEntity.created(URI.create("/api/Asistencia/" + response.id())).body(response);
    }

    @GetMapping("/viaje/{viajeId}")
    @Operation(summary = "Lista todos los registros de asistencia de un viaje")
    public ResponseEntity<List<AsistenciaResponse>> obtenerPorViaje(@PathVariable UUID viajeId) {
        return ResponseEntity.ok(asistenciaService.obtenerPorViaje(viajeId));
    }

    @GetMapping("/estudiante/{estudianteId}")
    @Operation(summary = "Lista el historial de asistencia de un estudiante")
    public ResponseEntity<List<AsistenciaResponse>> obtenerPorEstudiante(@PathVariable UUID estudianteId) {
        return ResponseEntity.ok(asistenciaService.obtenerPorEstudiante(estudianteId));
    }
}
