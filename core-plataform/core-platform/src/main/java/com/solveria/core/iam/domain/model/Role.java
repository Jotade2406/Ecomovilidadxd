package com.solveria.core.iam.domain.model;

import jakarta.persistence.*;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "iam_role", uniqueConstraints = @UniqueConstraint(columnNames = {"name", "tenant_id"}))
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(name = "tenant_id", length = 100)
    private String tenantId;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "iam_role_permissions", joinColumns = @JoinColumn(name = "role_id"))
    @Column(name = "permission_id")
    private Set<Long> permissionIds = new HashSet<>();

    protected Role() {}

    private Role(String name, String description) {
        this.name = name;
        this.description = description;
    }

    public static Role create(String name, String description) {
        return new Role(name, description);
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public String getTenantId() { return tenantId; }

    public Collection<Long> getPermissionIds() {
        return Collections.unmodifiableSet(permissionIds);
    }

    public void setPermissionIds(Collection<Long> ids) {
        this.permissionIds = ids != null ? new HashSet<>(ids) : new HashSet<>();
    }

    public void setTenantId(String tenantId) { this.tenantId = tenantId; }
    public void setName(String name) { this.name = name; }
    public void setDescription(String description) { this.description = description; }
}
