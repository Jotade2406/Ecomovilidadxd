package com.ecomovilidad.api;

import com.ecomovilidad.application.tenants.TenantService;
import com.ecomovilidad.application.usuarios.UsuarioAdminService;
import com.ecomovilidad.domain.auth.UsuarioApp;
import com.ecomovilidad.domain.tenants.Tenant;
import com.ecomovilidad.infrastructure.persistence.repositories.UsuarioAppJpaRepository;
import com.ecomovilidad.infrastructure.security.JwtTokenProvider;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/SuperAdmin")
@Tag(name = "SuperAdmin", description = "Panel de administración central — solo acceso interno")
public class SuperAdminController {

    private static final UUID SA_TENANT_ID = new UUID(0, 0);

    @Value("${superadmin.password}")
    private String superadminPassword;

    private final JwtTokenProvider jwtTokenProvider;
    private final TenantService tenantService;
    private final UsuarioAppJpaRepository usuarioRepo;
    private final UsuarioAdminService usuarioAdminService;

    public SuperAdminController(JwtTokenProvider jwtTokenProvider,
                                TenantService tenantService,
                                UsuarioAppJpaRepository usuarioRepo,
                                UsuarioAdminService usuarioAdminService) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.tenantService = tenantService;
        this.usuarioRepo = usuarioRepo;
        this.usuarioAdminService = usuarioAdminService;
    }

    // ─── DTOs ─────────────────────────────────────────────────────────

    public record LoginRequest(String password) {}

    public record TenantInfo(
            String id,
            String nombre,
            String codigo,
            String estado,
            LocalDateTime creadoEn,
            long totalUsuarios
    ) {}

    public record CrearTenantRequest(String nombre) {}
    public record CrearTenantConAdminRequest(
            String nombreInstitucion,
            String nombreAdmin,
            String emailAdmin,
            String passwordAdmin
    ) {}
    public record TenantConAdminInfo(TenantInfo tenant, UsuarioTenantInfo admin) {}
    public record UsuarioTenantInfo(String id, String email, String nombre, String role) {}
    public record CambiarRolRequest(String nuevoRol) {}
    public record AdminDisponible(String id, String email, String nombre, String tenantActual) {}

    // ─── POST /api/SuperAdmin/login ───────────────────────────────────

    @PostMapping("/login")
    @Operation(summary = "Autenticación del administrador central")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        if (req.password() == null || !req.password().equals(superadminPassword)) {
            return ResponseEntity.status(401)
                    .body(Map.of("message", "Contraseña incorrecta."));
        }
        String token = jwtTokenProvider.generateToken(
                "superadmin@ecomovilidad.bo",
                "SuperAdmin",
                SA_TENANT_ID,
                "Sistema Central"
        );
        return ResponseEntity.ok(Map.of(
                "token", token,
                "expiresAt", LocalDateTime.now().plusHours(24)
        ));
    }

    // ─── GET /api/SuperAdmin/tenants ──────────────────────────────────

    @GetMapping("/tenants")
    @Operation(summary = "Lista todas las instituciones con su código y cantidad de usuarios")
    public ResponseEntity<List<TenantInfo>> listarTenants() {
        List<TenantInfo> result = tenantService.listar().stream()
                .map(t -> new TenantInfo(
                        t.getId().toString(),
                        t.getNombre(),
                        t.getCodigo(),
                        t.getEstado(),
                        t.getCreadoEn(),
                        usuarioRepo.findByTenantId(t.getId()).size()
                ))
                .sorted((a, b) -> b.creadoEn().compareTo(a.creadoEn()))
                .toList();
        return ResponseEntity.ok(result);
    }

    // ─── POST /api/SuperAdmin/tenants ─────────────────────────────────

    @PostMapping("/tenants")
    @Operation(summary = "Crea una nueva institución y retorna su código de acceso")
    public ResponseEntity<?> crearTenant(@RequestBody CrearTenantRequest req) {
        if (req.nombre() == null || req.nombre().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "El nombre de la institución es requerido."));
        }
        if (tenantService.existsByNombre(req.nombre())) {
            return ResponseEntity.status(409)
                    .body(Map.of("message", "Ya existe una institución con ese nombre."));
        }
        Tenant nuevo = tenantService.crear(req.nombre().trim());
        return ResponseEntity.status(201).body(new TenantInfo(
                nuevo.getId().toString(),
                nuevo.getNombre(),
                nuevo.getCodigo(),
                nuevo.getEstado(),
                nuevo.getCreadoEn(),
                0L
        ));
    }

    // ─── POST /api/SuperAdmin/tenants/con-admin ───────────────────────

    @PostMapping("/tenants/con-admin")
    @Operation(summary = "Crea una institución y su administrador en un solo paso")
    public ResponseEntity<?> crearTenantConAdmin(@RequestBody CrearTenantConAdminRequest req) {
        if (req.nombreInstitucion() == null || req.nombreInstitucion().isBlank())
            return ResponseEntity.badRequest().body(Map.of("message", "El nombre de la institución es requerido."));
        if (req.nombreAdmin() == null || req.nombreAdmin().isBlank())
            return ResponseEntity.badRequest().body(Map.of("message", "El nombre del administrador es requerido."));
        if (req.emailAdmin() == null || req.emailAdmin().isBlank())
            return ResponseEntity.badRequest().body(Map.of("message", "El email del administrador es requerido."));
        if (req.passwordAdmin() == null || req.passwordAdmin().isBlank())
            return ResponseEntity.badRequest().body(Map.of("message", "La contraseña del administrador es requerida."));
        if (tenantService.existsByNombre(req.nombreInstitucion()))
            return ResponseEntity.status(409).body(Map.of("message", "Ya existe una institución con ese nombre."));
        if (usuarioRepo.existsByEmailIgnoreCase(req.emailAdmin()))
            return ResponseEntity.status(409).body(Map.of("message", "El email del administrador ya está en uso."));

        Tenant tenant = tenantService.crear(req.nombreInstitucion().trim());
        UsuarioApp admin;
        try {
            admin = usuarioAdminService.crearUsuario(
                    req.nombreAdmin().trim(),
                    "AdminInstitucion",
                    req.emailAdmin().trim(),
                    req.passwordAdmin(),
                    tenant.getId()
            );
        } catch (IllegalArgumentException e) {
            tenantService.eliminar(tenant.getId());
            return ResponseEntity.status(409).body(Map.of("message", e.getMessage()));
        }

        return ResponseEntity.status(201).body(new TenantConAdminInfo(
                new TenantInfo(
                        tenant.getId().toString(),
                        tenant.getNombre(),
                        tenant.getCodigo(),
                        tenant.getEstado(),
                        tenant.getCreadoEn(),
                        1L
                ),
                new UsuarioTenantInfo(
                        admin.getId().toString(),
                        admin.getEmail(),
                        admin.getNombre(),
                        admin.getRole()
                )
        ));
    }

    // ─── GET /api/SuperAdmin/tenants/{id}/usuarios ────────────────────

    @GetMapping("/tenants/{id}/usuarios")
    @Operation(summary = "Lista todos los usuarios de una institución")
    public ResponseEntity<?> usuariosDeTenant(@PathVariable UUID id) {
        if (tenantService.findById(id).isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "Institución no encontrada."));
        }
        var usuarios = usuarioRepo.findByTenantId(id).stream()
                .map(u -> new UsuarioTenantInfo(
                        u.getId().toString(),
                        u.getEmail(),
                        u.getNombre(),
                        u.getRole()
                ))
                .toList();
        return ResponseEntity.ok(usuarios);
    }

    // ─── PUT /api/SuperAdmin/usuarios/{userId}/rol ────────────────────

    @PutMapping("/usuarios/{userId}/rol")
    @Operation(summary = "Cambia el rol de un usuario (asignar/revocar AdminInstitucion)")
    public ResponseEntity<?> cambiarRol(@PathVariable UUID userId,
                                        @RequestBody CambiarRolRequest req) {
        var roles = Set.of("Estudiante", "Chofer", "Cliente", "AdminInstitucion");
        if (req.nuevoRol() == null || !roles.contains(req.nuevoRol())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Rol inválido."));
        }
        var userOpt = usuarioRepo.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "Usuario no encontrado."));
        }
        var user = userOpt.get();
        user.setRole(req.nuevoRol());
        usuarioRepo.save(user);
        return ResponseEntity.ok(Map.of(
                "id", user.getId().toString(),
                "email", user.getEmail(),
                "nombre", user.getNombre(),
                "role", user.getRole()
        ));
    }

    // ─── GET /api/SuperAdmin/admins ──────────────────────────────────
    // Lista todos los usuarios con rol AdminInstitucion

    @GetMapping("/admins")
    @Operation(summary = "Lista todas las cuentas de AdminInstitucion registradas")
    public ResponseEntity<List<AdminDisponible>> listarAdmins() {
        var admins = usuarioRepo.findByRole("AdminInstitucion").stream()
                .map(u -> new AdminDisponible(
                        u.getId().toString(),
                        u.getEmail(),
                        u.getNombre(),
                        u.getTenantId().toString()
                ))
                .toList();
        return ResponseEntity.ok(admins);
    }

    // ─── PUT /api/SuperAdmin/tenants/{tenantId}/asignar-admin/{userId} ─

    @PutMapping("/tenants/{tenantId}/asignar-admin/{userId}")
    @Operation(summary = "Asigna un AdminInstitucion a una institución (actualiza su tenant_id)")
    public ResponseEntity<?> asignarAdmin(@PathVariable UUID tenantId,
                                          @PathVariable UUID userId) {
        if (tenantService.findById(tenantId).isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "Institución no encontrada."));
        }
        var userOpt = usuarioRepo.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "Usuario no encontrado."));
        }
        var user = userOpt.get();
        if (!"AdminInstitucion".equals(user.getRole())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "El usuario no tiene rol AdminInstitucion."));
        }

        // Desasignar admins anteriores de este tenant → vuelven al tenant demo (sin asignación)
        UUID tenantDemo = UUID.fromString("00000000-0000-0000-0000-000000000001");
        usuarioRepo.findByTenantId(tenantId).stream()
                .filter(u -> "AdminInstitucion".equals(u.getRole()) && !u.getId().equals(userId))
                .forEach(u -> {
                    u.setTenantId(tenantDemo);
                    usuarioRepo.save(u);
                });

        user.setTenantId(tenantId);
        usuarioRepo.save(user);
        return ResponseEntity.ok(Map.of(
                "message", "Admin asignado correctamente.",
                "userId", userId.toString(),
                "tenantId", tenantId.toString()
        ));
    }

    // ─── DELETE /api/SuperAdmin/tenants/{id} ──────────────────────────

    @DeleteMapping("/tenants/{id}")
    @Operation(summary = "Elimina una institución (solo si no tiene usuarios)")
    public ResponseEntity<?> eliminarTenant(@PathVariable UUID id) {
        var tenant = tenantService.findById(id).orElse(null);
        if (tenant == null) {
            return ResponseEntity.status(404)
                    .body(Map.of("message", "Institución no encontrada."));
        }
        long usuarios = usuarioRepo.findByTenantId(id).size();
        if (usuarios > 0) {
            return ResponseEntity.status(409)
                    .body(Map.of("message",
                            "No se puede eliminar: la institución tiene " + usuarios + " usuario(s) registrado(s)."));
        }
        tenantService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
