package com.ecomovilidad.domain.rutas.events;

import com.ecomovilidad.domain.common.DomainEvent;
import java.util.UUID;

/**
 * Evento emitido cuando una ruta cambia de estado.
 */
public final class RutaEstadoCambiadoEvent extends DomainEvent {

    private final UUID rutaId;
    private final String estadoAnterior;
    private final String estadoNuevo;

    public RutaEstadoCambiadoEvent(UUID rutaId, String estadoAnterior, String estadoNuevo) {
        super();
        this.rutaId = rutaId;
        this.estadoAnterior = estadoAnterior;
        this.estadoNuevo = estadoNuevo;
    }

    public UUID getRutaId() { return rutaId; }
    public String getEstadoAnterior() { return estadoAnterior; }
    public String getEstadoNuevo() { return estadoNuevo; }
}
