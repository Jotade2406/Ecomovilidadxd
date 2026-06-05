package com.ecomovilidad.infrastructure.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.UUID;

/**
 * UserDetails personalizado que lleva el tenantId extraído del JWT.
 */
public class JwtUserDetails implements UserDetails {

    private final String email;
    private final UUID tenantId;
    private final Collection<? extends GrantedAuthority> authorities;

    public JwtUserDetails(String email, UUID tenantId, Collection<? extends GrantedAuthority> authorities) {
        this.email = email;
        this.tenantId = tenantId;
        this.authorities = authorities;
    }

    public UUID getTenantId() {
        return tenantId;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return null; // JWT-based, no password
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
}
