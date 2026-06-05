package com.ecomovilidad.api;

import com.ecomovilidad.application.tenants.TenantService;
import com.ecomovilidad.application.usuarios.UsuarioAdminService;
import com.ecomovilidad.domain.auth.UsuarioApp;
import com.ecomovilidad.domain.tenants.Tenant;
import com.ecomovilidad.infrastructure.persistence.repositories.UsuarioAppJpaRepository;
import com.ecomovilidad.infrastructure.security.TenantProvider;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/Usuarios")
@Tag(name = "Usuarios", description = "Gestión de usuarios por institución (AdminInstitucion)")
public class UsuariosController {

    private final UsuarioAdminService service;
    private final UsuarioAppJpaRepository usuarioRepo;
    private final TenantProvider tenantProvider;
    private final TenantService tenantService;

    public UsuariosController(UsuarioAdminService service,
                               UsuarioAppJpaRepository usuarioRepo,
                               TenantProvider tenantProvider,
                               TenantService tenantService) {
        this.service = service;
        this.usuarioRepo = usuarioRepo;
        this.tenantProvider = tenantProvider;
        this.tenantService = tenantService;
    }

    // ─── DTOs ─────────────────────────────────────────────────────────

    public record GenerarRequest(String nombre, String rol) {}

    public record CrearRequest(String nombre, String rol, String email, String password) {}

    public record CredencialesResponse(
            String email, String password, boolean generadaPorIA,
            String nombre, String rol
    ) {}

    public record UsuarioResponse(String email, String nombre, String role) {}

    // ─── GET /api/Usuarios ── lista usuarios de este tenant ──────────

    @GetMapping
    @Operation(summary = "Lista los usuarios de la institución del admin autenticado")
    public ResponseEntity<List<UsuarioResponse>> listar() {
        UUID tenantId = tenantProvider.getTenantId();
        List<UsuarioResponse> result = usuarioRepo.findByTenantId(tenantId).stream()
                .sorted(Comparator.comparing(UsuarioApp::getRole)
                        .thenComparing(UsuarioApp::getNombre))
                .map(u -> new UsuarioResponse(u.getEmail(), u.getNombre(), u.getRole()))
                .toList();
        return ResponseEntity.ok(result);
    }

    // ─── POST /api/Usuarios/generar-credenciales ─────────────────────

    @PostMapping("/generar-credenciales")
    @Operation(summary = "Genera email y contraseña con IA para un nuevo usuario (preview, no guarda)")
    public ResponseEntity<?> generarCredenciales(@RequestBody GenerarRequest req) {
        if (blank(req.nombre()) || blank(req.rol())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Nombre y rol son requeridos."));
        }

        UUID tenantId = tenantProvider.getTenantId();
        Tenant tenant = tenantService.findById(tenantId).orElse(null);
        if (tenant == null) {
            return ResponseEntity.status(404)
                    .body(Map.of("message", "Institución no encontrada."));
        }

        var creds = service.generarCredenciales(req.nombre(), req.rol(), tenant);
        return ResponseEntity.ok(new CredencialesResponse(
                creds.email(), creds.password(), creds.generadaPorIA(),
                req.nombre(), req.rol()
        ));
    }

    // ─── POST /api/Usuarios/crear ─────────────────────────────────────

    @PostMapping("/crear")
    @Operation(summary = "Crea un usuario en la institución del admin autenticado")
    public ResponseEntity<?> crear(@RequestBody CrearRequest req) {
        if (blank(req.nombre()) || blank(req.rol()) || blank(req.email()) || blank(req.password())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Todos los campos son requeridos."));
        }

        UUID tenantId = tenantProvider.getTenantId();

        try {
            UsuarioApp creado = service.crearUsuario(
                    req.nombre(), req.rol(), req.email(), req.password(), tenantId
            );
            return ResponseEntity.status(201)
                    .body(new UsuarioResponse(creado.getEmail(), creado.getNombre(), creado.getRole()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(409)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    private static boolean blank(String s) {
        return s == null || s.isBlank();
    }
}
