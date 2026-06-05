package com.solveria.iamservice.application.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record TenantRoleResponse(
        UUID id,
        String tenantId,
        String userEmail,
        String roleName,
        String assignedBy,
        LocalDateTime assignedAt,
        LocalDateTime revokedAt,
        String notes,
        boolean active) {}
