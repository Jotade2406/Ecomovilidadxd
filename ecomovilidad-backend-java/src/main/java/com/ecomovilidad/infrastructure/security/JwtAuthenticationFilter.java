package com.ecomovilidad.infrastructure.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

/**
 * Filtro que intercepta el header Authorization, valida el JWT
 * y establece el SecurityContext con JwtUserDetails.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            if (jwtTokenProvider.isTokenValid(token)) {
                Claims claims = jwtTokenProvider.validateAndGetClaims(token);

                String email = claims.get("email", String.class);
                String role = claims.get("role", String.class);
                String tenantIdStr = claims.get("tenant_id", String.class);
                UUID tenantId = UUID.fromString(tenantIdStr);

                // Crear autoridades con prefijo ROLE_ para Spring Security
                var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role));

                var userDetails = new JwtUserDetails(email, tenantId, authorities);
                var authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, null, authorities);

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        filterChain.doFilter(request, response);
    }
}
