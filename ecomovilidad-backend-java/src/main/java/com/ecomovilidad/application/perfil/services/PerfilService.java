package com.ecomovilidad.application.perfil.services;

import com.ecomovilidad.application.perfil.dtos.ActualizarPerfilRequest;
import com.ecomovilidad.application.perfil.dtos.PerfilResponse;
import com.ecomovilidad.domain.perfil.PerfilUsuario;
import com.ecomovilidad.infrastructure.persistence.repositories.PerfilUsuarioJpaRepository;
import com.ecomovilidad.infrastructure.security.JwtUserDetails;
import com.ecomovilidad.infrastructure.security.TenantProvider;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
public class PerfilService {

    private final PerfilUsuarioJpaRepository perfilRepository;
    private final TenantProvider tenantProvider;

    public PerfilService(PerfilUsuarioJpaRepository perfilRepository,
                         TenantProvider tenantProvider) {
        this.perfilRepository = perfilRepository;
        this.tenantProvider = tenantProvider;
    }

    @Transactional(readOnly = true)
    public PerfilResponse obtenerMiPerfil() {
        UUID tenantId = tenantProvider.getTenantId();
        String email = getCurrentEmail();
        var perfil = perfilRepository.findByEmailAndTenantId(email, tenantId)
                .orElseGet(() -> crearPerfilInicial(email, tenantId));
        return toResponse(perfil);
    }

    public PerfilResponse actualizarMiPerfil(ActualizarPerfilRequest request) {
        UUID tenantId = tenantProvider.getTenantId();
        String email = getCurrentEmail();

        var perfil = perfilRepository.findByEmailAndTenantId(email, tenantId)
                .orElseGet(() -> crearPerfilInicial(email, tenantId));

        perfil.actualizar(request.nombre(), request.telefono(), request.avatarUrl(),
                request.preferenciaNotificaciones(), request.tema());
        perfilRepository.save(perfil);
        return toResponse(perfil);
    }

    // ─── Helpers ────────────────────────────────────────────────────────

    private PerfilUsuario crearPerfilInicial(String email, UUID tenantId) {
        var perfil = PerfilUsuario.crear(email, email.split("@")[0], tenantId);
        return perfilRepository.save(perfil);
    }

    private String getCurrentEmail() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof JwtUserDetails userDetails) {
            return userDetails.getUsername();
        }
        throw new IllegalStateException("Usuario no autenticado.");
    }

    private PerfilResponse toResponse(PerfilUsuario p) {
        return new PerfilResponse(
                p.getId(), p.getTenantId(), p.getEmail(), p.getNombre(),
                p.getTelefono(), p.getAvatarUrl(), p.isPreferenciaNotificaciones(),
                p.getTema(), p.getFechaCreacion(), p.getFechaActualizacion());
    }
}
