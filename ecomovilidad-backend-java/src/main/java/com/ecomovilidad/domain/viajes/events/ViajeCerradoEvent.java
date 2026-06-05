package com.ecomovilidad.domain.viajes.events;

import com.ecomovilidad.domain.common.DomainEvent;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Evento de dominio que se dispara cuando un viaje pasa a estado Completado.
 */
public final class ViajeCerradoEvent extends DomainEvent {

    private final UUID viajeId;
    private final LocalDateTime fechaCierre;
    private final int cantidadEstudiantes;

    public ViajeCerradoEvent(UUID viajeId, LocalDateTime fechaCierre, int cantidadEstudiantes) {
        super();
        this.viajeId = viajeId;
        this.fechaCierre = fechaCierre;
        this.cantidadEstudiantes = cantidadEstudiantes;
    }

    public UUID getViajeId() { return viajeId; }
    public LocalDateTime getFechaCierre() { return fechaCierre; }
    public int getCantidadEstudiantes() { return cantidadEstudiantes; }
}
