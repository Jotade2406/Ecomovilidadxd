package com.ecomovilidad.api;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Controlador WebSocket STOMP para ubicación en tiempo real de buses.
 * El frontend envía la ubicación del bus y todos los suscriptores la reciben.
 */
@Controller
public class WebSocketUbicacionController {

    /**
     * Payload que el frontend envía con la ubicación del bus.
     */
    public record UbicacionPayload(
            UUID viajeId,
            double lat,
            double lon,
            LocalDateTime timestamp
    ) {}

    /**
     * Recibe ubicación del bus y la rebroadcastea a todos los suscriptores del viaje.
     * Frontend envía a: /app/ubicacion/{viajeId}
     * Suscriptores reciben en: /topic/ubicacion/{viajeId}
     */
    @MessageMapping("/ubicacion/{viajeId}")
    @SendTo("/topic/ubicacion/{viajeId}")
    public UbicacionPayload recibirUbicacion(
            @DestinationVariable UUID viajeId,
            UbicacionPayload payload) {
        // Re-emitir con timestamp del servidor si no viene
        return new UbicacionPayload(
                viajeId,
                payload.lat(),
                payload.lon(),
                payload.timestamp() != null ? payload.timestamp() : LocalDateTime.now()
        );
    }
}
