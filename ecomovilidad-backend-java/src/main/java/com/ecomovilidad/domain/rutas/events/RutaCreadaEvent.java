package com.ecomovilidad.domain.rutas.events;

import com.ecomovilidad.domain.common.DomainEvent;
import java.util.UUID;

/**
 * Evento emitido cuando se crea una nueva ruta.
 */
public final class RutaCreadaEvent extends DomainEvent {

    private final UUID rutaId;
    private final String nombre;

    public RutaCreadaEvent(UUID rutaId, String nombre) {
        super();
        this.rutaId = rutaId;
        this.nombre = nombre;
    }

    public UUID getRutaId() { return rutaId; }
    public String getNombre() { return nombre; }
}
