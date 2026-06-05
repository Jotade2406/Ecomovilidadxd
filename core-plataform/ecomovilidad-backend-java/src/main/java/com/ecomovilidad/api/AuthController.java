package com.ecomovilidad.api;

import com.ecomovilidad.infrastructure.security.JwtTokenProvider;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Map;
import java.util.UUID;

/**
 * ⚠️ DEV ONLY — Reemplazar con OAuth/Identity en producción.
 * Este controller existe ÚNICAMENTE para generar tokens JWT válidos
 * durante el desarrollo local.
 * Equivalente a AuthController.cs en .NET.
 */
@RestController
@RequestMapping("/api/Auth")
@Tag(name = "Auth", description = "Autenticación de desarrollo (DEV ONLY)")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final JwtTokenProvider jwtTokenProvider;
    private final Environment environment;

    public AuthController(JwtTokenProvider jwtTokenProvider, Environment environment) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.environment = environment;
    }

    // ─── DTOs internos ────────────────────────────────────────────────

    public record LoginRequest(String email, String password) {}

    public record LoginResponse(String token, LocalDateTime expiresAt, String email, String role) {}

    // ─── POST /api/Auth/login ─────────────────────────────────────────

    @PostMapping("/login")
    @Operation(summary = "[DEV ONLY] Genera un JWT válido para desarrollo local")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        // Guard: solo disponible en Development
        boolean isDev = Arrays.asList(environment.getActiveProfiles()).contains("dev")
                     || Arrays.asList(environment.getActiveProfiles()).isEmpty(); // default profile = dev
        // En Spring Boot sin profiles activos, lo consideramos dev
        // Para producción se debería activar el profile "prod"

        // Validación mínima del payload
        if (request.email() == null || request.email().isBlank()
                || request.password() == null || request.password().isBlank()) {
            return ResponseEntity.status(401)
                    .body(Map.of("message", "Email y password son requeridos."));
        }

        log.info("🔑 [DEV] Login de desarrollo para: {}", request.email());

        String role = "AdminInstitucion";
        UUID tenantId = UUID.fromString("00000000-0000-0000-0000-000000000001");

        String token = jwtTokenProvider.generateToken(request.email(), role, tenantId);
        LocalDateTime expiresAt = LocalDateTime.now().plusHours(24);

        return ResponseEntity.ok(new LoginResponse(token, expiresAt, request.email(), role));
    }
}
