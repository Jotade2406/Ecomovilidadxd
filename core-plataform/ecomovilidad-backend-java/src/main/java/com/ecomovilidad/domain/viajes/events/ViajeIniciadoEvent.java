package com.ecomovilidad.domain.viajes.events;

import com.ecomovilidad.domain.common.DomainEvent;
import java.util.UUID;

/**
 * Evento de dominio que se dispara cuando un viaje pasa a estado EnCurso.
 */
public final class ViajeIniciadoEvent extends DomainEvent {

    private final UUID viajeId;
    private final UUID rutaId;
    private final UUID conductorId;
    private final UUID vehiculoId;

    public ViajeIniciadoEvent(UUID viajeId, UUID rutaId, UUID conductorId, UUID vehiculoId) {
        super();
        this.viajeId = viajeId;
        this.rutaId = rutaId;
        this.conductorId = conductorId;
        this.vehiculoId = vehiculoId;
    }

    public UUID getViajeId() { return viajeId; }
    public UUID getRutaId() { return rutaId; }
    public UUID getConductorId() { return conductorId; }
    public UUID getVehiculoId() { return vehiculoId; }
}
