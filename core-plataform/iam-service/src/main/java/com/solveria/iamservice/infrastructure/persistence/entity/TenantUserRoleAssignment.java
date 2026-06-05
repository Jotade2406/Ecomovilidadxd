package com.solveria.iamservice.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "iam_tenant_user_role_assignment")
public class TenantUserRoleAssignment {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id = UUID.randomUUID();

    @Column(name = "tenant_id", nullable = false, length = 100)
    private String tenantId;

    @Column(name = "user_email", nullable = false, length = 255)
    private String userEmail;

    @Column(name = "role_name", nullable = false, length = 100)
    private String roleName;

    @Column(name = "assigned_by", length = 255)
    private String assignedBy;

    @Column(name = "assigned_at", nullable = false)
    private LocalDateTime assignedAt = LocalDateTime.now();

    @Column(name = "revoked_at")
    private LocalDateTime revokedAt;

    @Column(name = "notes", length = 500)
    private String notes;

    @Column(name = "active", nullable = false)
    private boolean active = true;

    public TenantUserRoleAssignment() {}

    public static TenantUserRoleAssignment crear(
            String tenantId, String userEmail, String roleName, String assignedBy, String notes) {
        TenantUserRoleAssignment a = new TenantUserRoleAssignment();
        a.tenantId = tenantId;
        a.userEmail = userEmail;
        a.roleName = roleName;
        a.assignedBy = assignedBy;
        a.notes = notes;
        return a;
    }

    public void revocar() {
        this.active = false;
        this.revokedAt = LocalDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public String getTenantId() {
        return tenantId;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public String getRoleName() {
        return roleName;
    }

    public String getAssignedBy() {
        return assignedBy;
    }

    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }

    public LocalDateTime getRevokedAt() {
        return revokedAt;
    }

    public String getNotes() {
        return notes;
    }

    public boolean isActive() {
        return active;
    }
}
