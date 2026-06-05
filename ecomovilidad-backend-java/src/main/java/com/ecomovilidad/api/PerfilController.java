package com.ecomovilidad.api;

import com.ecomovilidad.application.perfil.dtos.ActualizarPerfilRequest;
import com.ecomovilidad.application.perfil.dtos.PerfilResponse;
import com.ecomovilidad.application.perfil.services.PerfilService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/Perfil")
@Tag(name = "Perfil", description = "Gestión del perfil del usuario autenticado")
@SecurityRequirement(name = "Bearer")
@ApiResponse(responseCode = "401", description = "No autorizado (Token faltante o inválido)")
public class PerfilController {

    private final PerfilService perfilService;

    public PerfilController(PerfilService perfilService) {
        this.perfilService = perfilService;
    }

    @GetMapping("/me")
    @Operation(summary = "Obtiene el perfil del usuario autenticado (crea uno por defecto si no existe)")
    public ResponseEntity<PerfilResponse> obtenerMiPerfil() {
        return ResponseEntity.ok(perfilService.obtenerMiPerfil());
    }

    @PutMapping("/me")
    @Operation(summary = "Actualiza el perfil del usuario autenticado")
    public ResponseEntity<PerfilResponse> actualizarMiPerfil(@RequestBody ActualizarPerfilRequest request) {
        return ResponseEntity.ok(perfilService.actualizarMiPerfil(request));
    }
}
