package com.ecomovilidad.infrastructure.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

/**
 * Genera y valida tokens JWT.
 * Equivalente a la lógica JWT en AuthController.cs de .NET.
 */
@Component
public class JwtTokenProvider {

    private final SecretKey key;
    private final String issuer;
    private final String audience;
    private final long expirationHours;

    public JwtTokenProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.issuer}") String issuer,
            @Value("${jwt.audience}") String audience,
            @Value("${jwt.expiration-hours}") long expirationHours) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.issuer = issuer;
        this.audience = audience;
        this.expirationHours = expirationHours;
    }

    /**
     * Genera un JWT con los claims estándar + tenant_id y role.
     */
    public String generateToken(String email, String role, UUID tenantId) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationHours * 3600 * 1000);

        return Jwts.builder()
                .subject(UUID.randomUUID().toString())
                .claim("email", email)
                .claim("jti", UUID.randomUUID().toString())
                .claim("role", role)
                .claim("tenant_id", tenantId.toString())
                .issuer(issuer)
                .audience().add(audience).and()
                .issuedAt(now)
                .expiration(expiry)
                .signWith(key)
                .compact();
    }

    /**
     * Valida un token JWT y retorna los claims.
     */
    public Claims validateAndGetClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .requireIssuer(issuer)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Extrae la fecha de expiración del token.
     */
    public Date getExpiration(String token) {
        return validateAndGetClaims(token).getExpiration();
    }

    /**
     * Verifica si el token es válido (firma + expiración).
     */
    public boolean isTokenValid(String token) {
        try {
            validateAndGetClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
