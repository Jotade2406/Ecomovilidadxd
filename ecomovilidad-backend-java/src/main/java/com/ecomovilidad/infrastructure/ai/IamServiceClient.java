package com.ecomovilidad.infrastructure.ai;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Collections;
import java.util.List;

/**
 * Cliente HTTP para el microservicio iam-service.
 * Permite registrar roles y consultarlos desde el backend principal.
 */
@Component
public class IamServiceClient {

    private static final Logger log = LoggerFactory.getLogger(IamServiceClient.class);

    @Value("${services.iam-service.url:http://localhost:8080}")
    private String iamServiceUrl;

    private final HttpClient http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    private final ObjectMapper mapper = new ObjectMapper();

    public record RoleInfo(Long id, String name, String description, String tenantId, int permissionCount) {}
    private record CreateRoleBody(String name, String description) {}

    // ─── Listar roles ─────────────────────────────────────────────────

    public List<RoleInfo> listarRoles() {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(iamServiceUrl + "/api/v1/roles"))
                    .header("Accept", "application/json")
                    .timeout(Duration.ofSeconds(8))
                    .GET()
                    .build();

            HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                return mapper.readValue(response.body(), new TypeReference<List<RoleInfo>>() {});
            }
            log.warn("iam-service GET /roles status {}", response.statusCode());
        } catch (Exception e) {
            log.warn("iam-service no disponible para listar roles: {}", e.getMessage());
        }
        return Collections.emptyList();
    }

    // ─── Registrar un rol (idempotente) ───────────────────────────────

    public boolean registrarRol(String nombre, String descripcion) {
        try {
            String body = mapper.writeValueAsString(new CreateRoleBody(nombre, descripcion));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(iamServiceUrl + "/api/v1/roles"))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(8))
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());
            boolean ok = response.statusCode() == 200 || response.statusCode() == 201;

            if (ok) log.info("Rol '{}' registrado en iam-service", nombre);
            else log.warn("iam-service POST /roles status {} para '{}'", response.statusCode(), nombre);

            return ok;
        } catch (Exception e) {
            log.warn("iam-service no disponible para registrar rol '{}': {}", nombre, e.getMessage());
            return false;
        }
    }

    // ─── Verificar si el servicio está activo ─────────────────────────

    public boolean estaActivo() {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(iamServiceUrl + "/actuator/health"))
                    .timeout(Duration.ofSeconds(4))
                    .GET()
                    .build();
            HttpResponse<String> r = http.send(request, HttpResponse.BodyHandlers.ofString());
            return r.statusCode() == 200;
        } catch (Exception e) {
            return false;
        }
    }
}
