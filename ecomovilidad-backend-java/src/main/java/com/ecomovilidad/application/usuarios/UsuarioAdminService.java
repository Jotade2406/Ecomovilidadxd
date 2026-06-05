package com.ecomovilidad.application.usuarios;

import com.ecomovilidad.domain.auth.UsuarioApp;
import com.ecomovilidad.domain.flota.Conductor;
import com.ecomovilidad.domain.tenants.Tenant;
import com.ecomovilidad.infrastructure.ai.AiServiceClient;
import com.ecomovilidad.infrastructure.ai.AnthropicClient;
import com.ecomovilidad.infrastructure.persistence.repositories.ConductorJpaRepository;
import com.ecomovilidad.infrastructure.persistence.repositories.UsuarioAppJpaRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.UUID;

@Service
public class UsuarioAdminService {

    private static final Logger log = LoggerFactory.getLogger(UsuarioAdminService.class);

    private static final String[] PALABRAS = {
            "Ruta", "Bus", "Verde", "Eco", "Viaje", "Sol", "Luna",
            "Rio", "Cielo", "Mar", "Flor", "Viento", "Puma", "Condor"
    };

    private final AiServiceClient aiServiceClient;
    private final AnthropicClient anthropic;
    private final UsuarioAppJpaRepository usuarioRepo;
    private final ConductorJpaRepository conductorRepo;
    private final PasswordEncoder encoder;
    private final ObjectMapper mapper = new ObjectMapper();

    public UsuarioAdminService(AiServiceClient aiServiceClient,
                               AnthropicClient anthropic,
                               UsuarioAppJpaRepository usuarioRepo,
                               ConductorJpaRepository conductorRepo,
                               PasswordEncoder encoder) {
        this.aiServiceClient = aiServiceClient;
        this.anthropic = anthropic;
        this.usuarioRepo = usuarioRepo;
        this.conductorRepo = conductorRepo;
        this.encoder = encoder;
    }

    // ─── Generar credenciales (preview, sin guardar) ──────────────────

    public CredencialesGeneradas generarCredenciales(String nombre, String rol, Tenant tenant) {
        String prompt = buildPrompt(nombre, rol, tenant);

        // Prioridad: ai-service → AnthropicClient directo → fallback local
        String respuesta = aiServiceClient.completar(prompt);
        if (respuesta == null) {
            respuesta = anthropic.completar(prompt);
        }

        if (respuesta != null) {
            try {
                // Limpiar markdown si Claude lo devuelve envuelto
                String limpio = respuesta.strip();
                if (limpio.startsWith("```")) {
                    limpio = limpio.replaceAll("```[a-z]*\\n?", "").strip();
                }
                var node = mapper.readTree(limpio);
                String email = node.path("email").asText();
                String password = node.path("password").asText();
                if (!email.isBlank() && !password.isBlank()) {
                    log.info("✨ Credenciales generadas por IA para '{}'", nombre);
                    return new CredencialesGeneradas(email, password, true);
                }
            } catch (Exception e) {
                log.warn("No se pudo parsear respuesta de IA: {}", e.getMessage());
            }
        }

        // Fallback: generación local
        log.info("📝 Credenciales generadas localmente para '{}'", nombre);
        return generarLocal(nombre, tenant);
    }

    // ─── Crear usuario en el tenant del admin ────────────────────────

    public UsuarioApp crearUsuario(String nombre, String rol, String email,
                                   String password, UUID tenantId) {
        if (usuarioRepo.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("El email ya está en uso: " + email);
        }
        UsuarioApp usuario = new UsuarioApp(
                email.toLowerCase().strip(),
                encoder.encode(password),
                nombre.strip(),
                rol,
                tenantId
        );
        usuarioRepo.save(usuario);

        if ("Chofer".equals(rol)) {
            String licencia = com.ecomovilidad.infrastructure.persistence.seeders.AuthSeeder
                    .licenciaDeUsuario(usuario.getId());
            Conductor conductor = Conductor.crear(nombre, licencia, "Mañana");
            conductor.setTenantId(tenantId);
            conductorRepo.save(conductor);
        }

        log.info("✅ Usuario creado por admin: {} ({}) en tenant {}", email, rol, tenantId);
        return usuario;
    }

    // ─── Helpers ─────────────────────────────────────────────────────

    private String buildPrompt(String nombre, String rol, Tenant tenant) {
        String rolLabel = switch (rol) {
            case "Chofer"          -> "Conductor de bus escolar";
            case "Estudiante"      -> "Estudiante";
            case "Cliente"         -> "Cliente / Apoderado";
            case "AdminInstitucion"-> "Administrador de institución";
            default                -> rol;
        };

        return """
                Genera credenciales de acceso para un usuario del sistema EcoMovilidad.

                Datos del usuario:
                - Nombre completo: %s
                - Rol: %s
                - Institución: %s (código: %s)

                Reglas:
                1. email: usa primera_letra_nombre + apellido + _ + codigo_institucion_minúsculas + @ecomovilidad.bo
                   - Sin tildes, sin caracteres especiales, todo minúsculas.
                   - Ejemplo: "Juan Pérez" en institución "CSJ" → "jperez_csj@ecomovilidad.bo"
                2. password: 8-10 caracteres, solo letras y números (SIN símbolos),
                   fácil de recordar, estilo una_palabra + número.
                   Ejemplos válidos: "BusVerde84", "Ruta2025", "EcoSol42", "LunaAzul7"

                Responde ÚNICAMENTE con JSON válido (sin texto adicional, sin markdown):
                {"email":"...","password":"..."}
                """.formatted(nombre, rolLabel, tenant.getNombre(), tenant.getCodigo());
    }

    private CredencialesGeneradas generarLocal(String nombre, Tenant tenant) {
        String[] partes = nombre.strip().split("\\s+");
        String primerNombre = normalizar(partes[0]).toLowerCase();
        String apellido = partes.length > 1
                ? normalizar(partes[partes.length - 1]).toLowerCase()
                : primerNombre;
        String codigoInst = tenant.getCodigo().toLowerCase().replaceAll("[^a-z0-9]", "");

        String email = primerNombre.charAt(0) + apellido + "_" + codigoInst + "@ecomovilidad.bo";

        // Si el email ya existe, agregar número al final
        if (usuarioRepo.existsByEmailIgnoreCase(email)) {
            int n = (int) (Math.random() * 90) + 10;
            email = primerNombre.charAt(0) + apellido + n + "_" + codigoInst + "@ecomovilidad.bo";
        }

        String palabra = PALABRAS[(int) (Math.random() * PALABRAS.length)];
        int numero = (int) (Math.random() * 90) + 10;
        String password = palabra + numero;

        return new CredencialesGeneradas(email, password, false);
    }

    private static String normalizar(String texto) {
        String sin = Normalizer.normalize(texto, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        return sin.replaceAll("[^a-zA-Z0-9]", "");
    }

    // ─── DTO de resultado ────────────────────────────────────────────

    public record CredencialesGeneradas(String email, String password, boolean generadaPorIA) {}
}
