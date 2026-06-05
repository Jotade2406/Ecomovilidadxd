package com.ecomovilidad.infrastructure.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Proveedor de TenantId basado en el JWT del SecurityContext.
 * Equivalente a TenantProvider.cs en .NET.
 *
 * ✅ FIX: Durante startup/seeding no hay SecurityContext.
 * Retornamos UUID vacío en lugar de explotar.
 */
@Component
public class TenantProvider {

    private static final UUID EMPTY_UUID = new UUID(0, 0);

    public UUID getTenantId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return EMPTY_UUID;
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof JwtUserDetails userDetails) {
            return userDetails.getTenantId();
        }

        return EMPTY_UUID;
    }
}
