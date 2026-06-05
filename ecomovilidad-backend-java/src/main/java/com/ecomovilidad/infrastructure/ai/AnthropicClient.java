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
 * Cliente HTTP para la API de Anthropic (Claude).
 * Si la API key no está configurada, devuelve null para que
 * el servicio use la generación local de respaldo.
 */
@Component
public class AnthropicClient {

    private static final Logger log = LoggerFactory.getLogger(AnthropicClient.class);
    private static final String API_URL = "https://api.anthropic.com/v1/messages";
    private static final String MODEL   = "claude-haiku-4-5-20251001";

    @Value("${anthropic.api-key:}")
    private String apiKey;

    private final HttpClient http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    private final ObjectMapper mapper = new ObjectMapper();

    /**
     * Envía un prompt a Claude y retorna el texto de respuesta.
     * Retorna null si la key no está configurada o si ocurre un error.
     */
    public String completar(String prompt) {
        if (apiKey == null || apiKey.isBlank()) {
            log.debug("ANTHROPIC_API_KEY no configurada — usando generación local");
            return null;
        }

        try {
            String body = mapper.writeValueAsString(new AnthropicRequest(
                    MODEL, 256,
                    new Message[]{ new Message("user", prompt) }
            ));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(API_URL))
                    .header("x-api-key", apiKey)
                    .header("anthropic-version", "2023-06-01")
                    .header("content-type", "application/json")
                    .timeout(Duration.ofSeconds(20))
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.warn("Anthropic API error {}: {}", response.statusCode(), response.body());
                return null;
            }

            JsonNode root = mapper.readTree(response.body());
            return root.path("content").get(0).path("text").asText();

        } catch (Exception e) {
            log.warn("Error llamando a Anthropic API: {}", e.getMessage());
            return null;
        }
    }

    // ─── Clases internas para serializar el request ──────────────

    record AnthropicRequest(String model, int max_tokens, Message[] messages) {}
    record Message(String role, String content) {}
}
