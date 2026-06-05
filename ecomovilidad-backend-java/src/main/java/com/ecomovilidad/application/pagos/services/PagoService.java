package com.ecomovilidad.application.pagos.services;

import com.ecomovilidad.application.pagos.dtos.CrearPagoRequest;
import com.ecomovilidad.application.pagos.dtos.PagoResponse;
import com.ecomovilidad.application.pagos.dtos.RegistrarPagoRequest;
import com.ecomovilidad.domain.pagos.EstadoPago;
import com.ecomovilidad.domain.pagos.Pago;
import com.ecomovilidad.infrastructure.persistence.repositories.EstudianteJpaRepository;
import com.ecomovilidad.infrastructure.persistence.repositories.PagoJpaRepository;
import com.ecomovilidad.infrastructure.security.TenantProvider;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class PagoService {

    private final PagoJpaRepository pagoRepository;
    private final EstudianteJpaRepository estudianteRepository;
    private final TenantProvider tenantProvider;

    public PagoService(PagoJpaRepository pagoRepository,
                       EstudianteJpaRepository estudianteRepository,
                       TenantProvider tenantProvider) {
        this.pagoRepository = pagoRepository;
        this.estudianteRepository = estudianteRepository;
        this.tenantProvider = tenantProvider;
    }

    public PagoResponse crear(CrearPagoRequest request) {
        UUID tenantId = tenantProvider.getTenantId();

        var estudiante = estudianteRepository.findByIdAndTenantId(request.estudianteId(), tenantId)
                .orElseThrow(() -> new EntityNotFoundException("Estudiante '" + request.estudianteId() + "' no existe."));

        var pago = Pago.crear(request.estudianteId(), request.tipoPlan(),
                request.monto(), request.fechaVencimiento());
        pago.setTenantId(tenantId);
        pagoRepository.save(pago);

        return toResponse(pago, estudiante.getNombre());
    }

    @Transactional(readOnly = true)
    public List<PagoResponse> obtenerTodos() {
        UUID tenantId = tenantProvider.getTenantId();
        return pagoRepository.findByTenantIdOrderByFechaCreacionDesc(tenantId)
                .stream().map(p -> enrichResponse(p, tenantId)).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PagoResponse> obtenerPorEstudiante(UUID estudianteId) {
        UUID tenantId = tenantProvider.getTenantId();
        var estudiante = estudianteRepository.findByIdAndTenantId(estudianteId, tenantId)
                .orElseThrow(() -> new EntityNotFoundException("Estudiante '" + estudianteId + "' no existe."));
        return pagoRepository.findByEstudianteIdAndTenantIdOrderByFechaCreacionDesc(estudianteId, tenantId)
                .stream().map(p -> toResponse(p, estudiante.getNombre())).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PagoResponse> obtenerPendientes() {
        UUID tenantId = tenantProvider.getTenantId();
        return pagoRepository.findByEstadoAndTenantId(EstadoPago.PENDIENTE, tenantId)
                .stream().map(p -> enrichResponse(p, tenantId)).collect(Collectors.toList());
    }

    public PagoResponse confirmarPago(UUID pagoId, RegistrarPagoRequest request) {
        UUID tenantId = tenantProvider.getTenantId();
        var pago = findOrThrow(pagoId, tenantId);
        pago.registrarPago(request.referenciaPago());
        pagoRepository.save(pago);
        return enrichResponse(pago, tenantId);
    }

    public PagoResponse marcarVencido(UUID pagoId) {
        UUID tenantId = tenantProvider.getTenantId();
        var pago = findOrThrow(pagoId, tenantId);
        pago.marcarVencido();
        pagoRepository.save(pago);
        return enrichResponse(pago, tenantId);
    }

    // ─── Helpers ────────────────────────────────────────────────────────

    private Pago findOrThrow(UUID id, UUID tenantId) {
        return pagoRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new EntityNotFoundException("Pago '" + id + "' no existe."));
    }

    private PagoResponse enrichResponse(Pago p, UUID tenantId) {
        String nombre = estudianteRepository.findByIdAndTenantId(p.getEstudianteId(), tenantId)
                .map(e -> e.getNombre()).orElse("Desconocido");
        return toResponse(p, nombre);
    }

    private PagoResponse toResponse(Pago p, String nombreEstudiante) {
        return new PagoResponse(
                p.getId(), p.getEstudianteId(), nombreEstudiante,
                p.getTipoPlan(), p.getEstado(), p.getMonto(),
                p.getFechaVencimiento(), p.getFechaPago(),
                p.getReferenciaPago(), p.getFechaCreacion());
    }
}
