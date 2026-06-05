package com.ecomovilidad.application.flota.services;

import com.ecomovilidad.application.flota.dtos.ConductorResponse;
import com.ecomovilidad.application.flota.dtos.CrearVehiculoCommand;
import com.ecomovilidad.application.flota.dtos.VehiculoDto;
import com.ecomovilidad.domain.flota.Conductor;
import com.ecomovilidad.domain.flota.Vehiculo;
import com.ecomovilidad.infrastructure.persistence.repositories.ConductorJpaRepository;
import com.ecomovilidad.infrastructure.persistence.repositories.VehiculoJpaRepository;
import com.ecomovilidad.infrastructure.security.TenantProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Casos de uso de gestión de flota.
 * Equivale a GestionFlotaUseCases.cs en .NET.
 */
@Service
@Transactional
public class FlotaService {

    private final VehiculoJpaRepository vehiculoRepository;
    private final ConductorJpaRepository conductorRepository;
    private final TenantProvider tenantProvider;

    public FlotaService(VehiculoJpaRepository vehiculoRepository,
                        ConductorJpaRepository conductorRepository,
                        TenantProvider tenantProvider) {
        this.vehiculoRepository = vehiculoRepository;
        this.conductorRepository = conductorRepository;
        this.tenantProvider = tenantProvider;
    }

    /** Registra un nuevo vehículo en la flota del tenant actual. */
    public VehiculoDto crearVehiculo(CrearVehiculoCommand command) {
        var vehiculo = Vehiculo.crear(command.placa(), command.capacidad(), command.fuelRate());
        vehiculo.setTenantId(tenantProvider.getTenantId());
        vehiculoRepository.save(vehiculo);
        return mapToDto(vehiculo);
    }

    /** Obtiene todos los vehículos del tenant actual. */
    @Transactional(readOnly = true)
    public List<VehiculoDto> obtenerVehiculos() {
        UUID tenantId = tenantProvider.getTenantId();
        return vehiculoRepository.findByTenantId(tenantId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /** Obtiene todos los conductores del tenant actual. */
    @Transactional(readOnly = true)
    public List<ConductorResponse> listarConductores() {
        UUID tenantId = tenantProvider.getTenantId();
        return conductorRepository.findByTenantId(tenantId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private VehiculoDto mapToDto(Vehiculo v) {
        return new VehiculoDto(v.getId(), v.getPlaca(), v.getCapacidad(), v.getEstado(), v.getFuelRate());
    }

    private ConductorResponse mapToDto(Conductor c) {
        return new ConductorResponse(c.getId(), c.getNombre(), c.getLicencia(), c.getTurnos());
    }
}

