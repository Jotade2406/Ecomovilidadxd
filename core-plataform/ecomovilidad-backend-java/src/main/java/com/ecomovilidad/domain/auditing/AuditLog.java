package com.ecomovilidad.domain.auditing;

import com.ecomovilidad.domain.common.ITenantEntity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entidad para registro de auditoría.
 * Equivalente a AuditLog.cs en .NET.
 */
@jakarta.persistence.Entity
@Table(name = "\"AuditLogs\"", schema = "public")
public class AuditLog implements ITenantEntity {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id = UUID.randomUUID();

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "user_id")
    private String userId;

    @Column(name = "table_name", nullable = false)
    private String tableName;

    @Column(name = "action", nullable = false)
    private String action;

    @Column(name = "key_values")
    private String keyValues;

    @Column(name = "old_values")
    private String oldValues;

    @Column(name = "new_values")
    private String newValues;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

    public AuditLog() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    @Override
    public UUID getTenantId() { return tenantId; }
    @Override
    public void setTenantId(UUID tenantId) { this.tenantId = tenantId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getTableName() { return tableName; }
    public void setTableName(String tableName) { this.tableName = tableName; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getKeyValues() { return keyValues; }
    public void setKeyValues(String keyValues) { this.keyValues = keyValues; }

    public String getOldValues() { return oldValues; }
    public void setOldValues(String oldValues) { this.oldValues = oldValues; }

    public String getNewValues() { return newValues; }
    public void setNewValues(String newValues) { this.newValues = newValues; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
