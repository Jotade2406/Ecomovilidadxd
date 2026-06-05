package com.ecomovilidad.infrastructure.ai;

import com.fasterxml.jackson.databind.JsonNode;
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

/**
 * Cliente HTTP para el microservicio ai-service.
 * Llama a POST /api/v1/ai/complete y retorna el contenido generado.
 * Retorna null si el servicio no está disponible — el servicio principal
 * usa el fallback local en ese caso.
 */
@Component
public class AiServiceClient {

    private static final Logger log = LoggerFactory.getLogger(AiServiceClient.class);

    @Value("${services.ai-service.url:http://localhost:8091}")
    private String aiServiceUrl;

    private final HttpClient http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    private final ObjectMapper mapper = new ObjectMapper();

    /**
     * Envía un prompt al ai-service y retorna el texto de respuesta.
     * Retorna null si el servicio no está disponible o si hay un error.
     */
    public String completar(String prompt) {
        try {
            String body = mapper.writeValueAsString(new CompletionRequest(prompt));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(aiServiceUrl + "/api/v1/ai/complete"))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(15))
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.warn("ai-service respondió con status {}", response.statusCode());
                return null;
            }

            JsonNode root = mapper.readTree(response.body());
            String content = root.path("content").asText();

            if (content.isBlank() || content.startsWith("[DEV-STUB]")) {
                return null;
            }

            log.debug("ai-service respondió correctamente");
            return content;

        } catch (Exception e) {
            log.warn("ai-service no disponible: {}", e.getMessage());
            return null;
        }
    }

    record CompletionRequest(String prompt) {}
}
