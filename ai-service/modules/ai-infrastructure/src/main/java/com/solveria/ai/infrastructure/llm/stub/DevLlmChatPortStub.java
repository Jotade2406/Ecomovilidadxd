package com.solveria.ai.infrastructure.llm.stub;

import com.solveria.ai.application.dto.ChatResultDto;
import com.solveria.ai.application.port.out.LlmChatPort;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.text.Normalizer;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Stub dev/test de LlmChatPort.
 * En modo desarrollo detecta prompts de generación de credenciales
 * y produce respuestas JSON válidas sin necesidad de un LLM externo.
 */
@Component
@Primary
@Profile({"dev", "test"})
public class DevLlmChatPortStub implements LlmChatPort {

    private static final Logger log = LoggerFactory.getLogger(DevLlmChatPortStub.class);

    private static final String[] PALABRAS = {
        "Ruta", "Bus", "Verde", "Eco", "Viaje", "Sol", "Luna",
        "Rio", "Cielo", "Flor", "Viento", "Puma", "Condor", "Mar"
    };

    public DevLlmChatPortStub() {
        log.info("DevLlmChatPortStub iniciado — generación local de credenciales activa");
    }

    @Override
    public ChatResultDto chat(String prompt) {
        log.debug("DevLlmChatPortStub.chat() llamado");

        if (esPromptDeCredenciales(prompt)) {
            return generarCredenciales(prompt);
        }

        return new ChatResultDto("[DEV-STUB] LLM no configurado.", 0, 0);
    }

    // ─── Detección ───────────────────────────────────────────────────

    private boolean esPromptDeCredenciales(String prompt) {
        return prompt != null
                && prompt.contains("Genera credenciales")
                && prompt.contains("email")
                && prompt.contains("password");
    }

    // ─── Generación ──────────────────────────────────────────────────

    private ChatResultDto generarCredenciales(String prompt) {
        String nombre = extraer(prompt, "Nombre completo:\\s*(.+)");
        String codigo = extraer(prompt, "código:\\s*([A-Z0-9]+)");

        if (nombre == null) nombre = "Usuario";
        if (codigo == null) codigo = "ECO";

        String email  = construirEmail(nombre, codigo);
        String pass   = construirPassword();

        String json = String.format("{\"email\":\"%s\",\"password\":\"%s\"}", email, pass);
        log.info("Credenciales generadas por stub para '{}': {}", nombre, email);
        return new ChatResultDto(json, 12, 20);
    }

    private String construirEmail(String nombre, String codigo) {
        String[] partes = nombre.trim().split("\\s+");
        String primerNombre = normalizar(partes[0]);
        String apellido     = partes.length > 1 ? normalizar(partes[partes.length - 1]) : primerNombre;
        String inst         = codigo.toLowerCase().replaceAll("[^a-z0-9]", "");

        char inicial = primerNombre.isEmpty() ? 'u' : primerNombre.charAt(0);
        return inicial + apellido + "_" + inst + "@ecomovilidad.bo";
    }

    private String construirPassword() {
        String palabra = PALABRAS[(int) (Math.random() * PALABRAS.length)];
        int numero     = (int) (Math.random() * 90) + 10;
        return palabra + numero;
    }

    // ─── Utilidades ──────────────────────────────────────────────────

    private String extraer(String texto, String regex) {
        Matcher m = Pattern.compile(regex, Pattern.MULTILINE).matcher(texto);
        return m.find() ? m.group(1).trim() : null;
    }

    private static String normalizar(String s) {
        return Normalizer.normalize(s, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
                .replaceAll("[^a-zA-Z0-9]", "")
                .toLowerCase();
    }
}
