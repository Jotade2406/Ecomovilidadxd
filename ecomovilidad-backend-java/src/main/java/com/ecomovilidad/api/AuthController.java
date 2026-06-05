package com.ecomovilidad.api;

import com.ecomovilidad.application.tenants.TenantService;
import com.ecomovilidad.domain.auth.UsuarioApp;
import com.ecomovilidad.domain.flota.Conductor;
import com.ecomovilidad.domain.tenants.Tenant;
import com.ecomovilidad.infrastructure.persistence.repositories.ConductorJpaRepository;
import com.ecomovilidad.infrastructure.persistence.repositories.UsuarioAppJpaRepository;
import com.ecomovilidad.infrastructure.security.JwtTokenProvider;
import com.ecomovilidad.infrastructure.security.TenantProvider;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/Auth")
@Tag(name = "Auth", description = "Autenticación persistida en PostgreSQL")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);
    private static final Set<String> ROLES_VALIDOS = Set.of("Estudiante", "Chofer", "Cliente", "AdminInstitucion");
    private static final UUID TENANT_DEMO = UUID.fromString("00000000-0000-0000-0000-000000000001");

    private final UsuarioAppJpaRepository repo;
    private final ConductorJpaRepository conductorRepo;
    private final PasswordEncoder encoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final TenantService tenantService;
    private final TenantProvider tenantProvider;

    public AuthController(UsuarioAppJpaRepository repo, ConductorJpaRepository conductorRepo,
                          PasswordEncoder encoder, JwtTokenProvider jwtTokenProvider,
                          TenantService tenantService, TenantProvider tenantProvider) {
        this.repo = repo;
        this.conductorRepo = conductorRepo;
        this.encoder = encoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.tenantService = tenantService;
        this.tenantProvider = tenantProvider;
    }

    // ─── DTOs ─────────────────────────────────────────────────────────

    public record LoginRequest(String email, String password) {}

    /**
     * tenantId: UUID de institución existente (Chofer, Estudiante, Cliente).
     * nombreInstitucion: nombre de la nueva institución (AdminInstitucion).
     * Si ambos son nulos → se usa el tenant demo (compatibilidad).
     */
    public record RegisterRequest(
            String email,
            String password,
            String nombre,
            String rol,
            String tenantId,
            String nombreInstitucion
    ) {}

    public record LoginResponse(
            String token,
            LocalDateTime expiresAt,
            String email,
            String role,
            String tenantId,
            String tenantNombre
    ) {}

    public record UserSummary(String email, String nombre, String role) {}

    // ─── GET /api/Auth/users ──────────────────────────────────────────

    @GetMapping("/users")
    @Operation(summary = "Lista usuarios del tenant autenticado (sin contraseñas)")
    public ResponseEntity<List<UserSummary>> listUsers() {
        UUID tenantId = tenantProvider.getTenantId();
        var source = (tenantId.equals(new java.util.UUID(0, 0)))
                ? repo.findAll()
                : repo.findByTenantId(tenantId);
        List<UserSummary> result = source.stream()
                .map(u -> new UserSummary(u.getEmail(), u.getNombre(), u.getRole()))
                .sorted(Comparator.comparing(UserSummary::role).thenComparing(UserSummary::email))
                .toList();
        return ResponseEntity.ok(result);
    }

    // ─── POST /api/Auth/register ──────────────────────────────────────

    @PostMapping("/register")
    @Operation(summary = "Registra un usuario; AdminInstitucion puede crear una nueva institución")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (blank(request.email()) || blank(request.password()) || blank(request.nombre())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Nombre, email y contraseña son requeridos."));
        }
        String rol = request.rol() != null ? request.rol() : "Estudiante";
        if (!ROLES_VALIDOS.contains(rol)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Rol inválido. Opciones: Estudiante, Chofer, Cliente, AdminInstitucion."));
        }
        String email = request.email().toLowerCase();
        if (repo.existsByEmailIgnoreCase(email)) {
            return ResponseEntity.status(409)
                    .body(Map.of("message", "El email ya está registrado."));
        }

        // ── Resolver tenant ────────────────────────────────────────────
        Tenant tenant;

        if ("AdminInstitucion".equals(rol) && !blank(request.nombreInstitucion())) {
            // Crear nueva institución para este administrador
            tenant = tenantService.crear(request.nombreInstitucion());
            log.info("🏫 Nueva institución creada: {} [{}]", tenant.getNombre(), tenant.getCodigo());

        } else if (!blank(request.tenantId())) {
            // Unirse a institución existente por UUID
            UUID tid;
            try {
                tid = UUID.fromString(request.tenantId());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "ID de institución inválido."));
            }
            tenant = tenantService.findById(tid).orElse(null);
            if (tenant == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Institución no encontrada."));
            }

        } else {
            // Sin tenant explícito → tenant demo (retrocompatibilidad)
            tenant = tenantService.findById(TENANT_DEMO)
                    .orElseThrow(() -> new IllegalStateException("Tenant demo no existe"));
        }

        // ── Crear usuario ──────────────────────────────────────────────
        UsuarioApp nuevo = new UsuarioApp(email, encoder.encode(request.password()),
                request.nombre(), rol, tenant.getId());
        repo.save(nuevo);

        if ("Chofer".equals(rol)) {
            String licencia = com.ecomovilidad.infrastructure.persistence.seeders.AuthSeeder
                    .licenciaDeUsuario(nuevo.getId());
            Conductor conductor = Conductor.crear(request.nombre(), licencia, "Mañana");
            conductor.setTenantId(tenant.getId());
            conductorRepo.save(conductor);
            log.info("  → Conductor creado en flota: {} ({})", request.nombre(), licencia);
        }

        log.info("✅ Registro: {} ({}) → institución '{}'", email, rol, tenant.getNombre());
        return ResponseEntity.status(201).body(buildResponse(email, rol, tenant));
    }

    // ─── POST /api/Auth/login ─────────────────────────────────────────

    @PostMapping("/login")
    @Operation(summary = "Login con credenciales almacenadas en base de datos")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        if (blank(request.email()) || blank(request.password())) {
            return ResponseEntity.status(401)
                    .body(Map.of("message", "Email y contraseña son requeridos."));
        }
        String email = request.email().toLowerCase();
        var userOpt = repo.findByEmailIgnoreCase(email);
        if (userOpt.isEmpty() || !encoder.matches(request.password(), userOpt.get().getPasswordHash())) {
            return ResponseEntity.status(401)
                    .body(Map.of("message", "Credenciales incorrectas o usuario no registrado."));
        }
        UsuarioApp u = userOpt.get();

        Tenant tenant = tenantService.findById(u.getTenantId())
                .orElseGet(() -> tenantService.findById(TENANT_DEMO).orElseThrow());

        log.info("🔑 Login: {} ({}) → '{}'", u.getEmail(), u.getRole(), tenant.getNombre());
        return ResponseEntity.ok(buildResponse(u.getEmail(), u.getRole(), tenant));
    }

    // ─── Helpers ──────────────────────────────────────────────────────

    private LoginResponse buildResponse(String email, String role, Tenant tenant) {
        String token = jwtTokenProvider.generateToken(email, role, tenant.getId(), tenant.getNombre());
        return new LoginResponse(token, LocalDateTime.now().plusHours(24),
                email, role, tenant.getId().toString(), tenant.getNombre());
    }

    private static boolean blank(String s) {
        return s == null || s.isBlank();
    }
}
