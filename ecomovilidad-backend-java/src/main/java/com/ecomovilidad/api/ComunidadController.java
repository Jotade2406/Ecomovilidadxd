package com.ecomovilidad.api;

import com.ecomovilidad.application.comunidad.dtos.CrearEstudianteCommand;
import com.ecomovilidad.application.comunidad.dtos.EstudianteDto;
import com.ecomovilidad.application.comunidad.services.ComunidadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

/**
 * Controlador RESTful para la gestión de Comunidad (estudiantes).
 * Requiere rol AdminInstitucion (configurado en SecurityConfig).
 * Equivalente a ComunidadController.cs en .NET.
 */
@RestController
@RequestMapping("/api/Comunidad")
@Tag(name = "Comunidad", description = "Gestión de estudiantes y tutores")
@SecurityRequirement(name = "Bearer")
@ApiResponse(responseCode = "401", description = "No autorizado (Token faltante o inválido)")
public class ComunidadController {

    private final ComunidadService comunidadService;

    public ComunidadController(ComunidadService comunidadService) {
        this.comunidadService = comunidadService;
    }

    @PostMapping("/estudiantes")
    @Operation(summary = "Crea un nuevo estudiante")
    public ResponseEntity<EstudianteDto> crearEstudiante(@RequestBody CrearEstudianteCommand command) {
        var response = comunidadService.crearEstudiante(command);
        return ResponseEntity.created(URI.create("/api/Comunidad/estudiantes/" + response.id())).body(response);
    }

    @GetMapping("/estudiantes")
    @Operation(summary = "Lista todos los estudiantes del tenant actual")
    public ResponseEntity<List<EstudianteDto>> obtenerEstudiantes() {
        return ResponseEntity.ok(comunidadService.obtenerEstudiantes());
    }
}
