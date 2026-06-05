-- Flyway Migration V3: Tenant-scoped User-Role Assignments
-- Tracks explicit assignment metadata (who assigned, when, notes)
-- The existing iam_user_roles covers the JPA bi-directional link;
-- this table carries the audit trail for tenant admin operations.

CREATE TABLE IF NOT EXISTS iam_tenant_user_role_assignment (
    id            UUID         PRIMARY KEY,
    tenant_id     VARCHAR(100) NOT NULL,
    user_email    VARCHAR(255) NOT NULL,
    role_name     VARCHAR(100) NOT NULL,
    assigned_by   VARCHAR(255),
    assigned_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revoked_at    TIMESTAMP,
    notes         VARCHAR(500),
    active        BOOLEAN      NOT NULL DEFAULT TRUE,
    UNIQUE (tenant_id, user_email, role_name)
);

CREATE INDEX idx_iam_tenant_role_assignment_tenant  ON iam_tenant_user_role_assignment(tenant_id);
CREATE INDEX idx_iam_tenant_role_assignment_email   ON iam_tenant_user_role_assignment(user_email);
CREATE INDEX idx_iam_tenant_role_assignment_active  ON iam_tenant_user_role_assignment(tenant_id, active);
