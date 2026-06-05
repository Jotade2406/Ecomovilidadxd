package com.ecomovilidad.application.rutas.mappers;

import com.ecomovilidad.application.rutas.dtos.CoordenadaDto;
import com.ecomovilidad.application.rutas.dtos.RutaResponse;
import com.ecomovilidad.domain.rutas.Ruta;

import java.util.stream.Collectors;

/**
 * Mapper estático para convertir entre entidades de dominio y DTOs.
 * Sin dependencias de librerías externas (MapStruct no necesario).
 * Equivalente a RutaMapper.cs en .NET.
 */
public final class RutaMapper {

    private RutaMapper() {} // No instanciable

    public static RutaResponse toResponse(Ruta ruta) {
        return new RutaResponse(
                ruta.getId(),
                ruta.getNombre(),
                new CoordenadaDto(ruta.getOrigen().getLatitud(), ruta.getOrigen().getLongitud()),
                new CoordenadaDto(ruta.getDestino().getLatitud(), ruta.getDestino().getLongitud()),
                ruta.getEstado(),
                ruta.getColor(),
                java.util.stream.IntStream.range(0, ruta.getPuntosIntermedios().size())
                        .mapToObj(i -> {
                            var p = ruta.getPuntosIntermedios().get(i);
                            return new CoordenadaDto(p.getLatitud(), p.getLongitud(), i);
                        })
                        .collect(Collectors.toList()),
                ruta.calcularDistanciaTotalKm(),
                ruta.getFechaCreacion(),
                ruta.getFechaUltimaActualizacion()
        );
    }
}
