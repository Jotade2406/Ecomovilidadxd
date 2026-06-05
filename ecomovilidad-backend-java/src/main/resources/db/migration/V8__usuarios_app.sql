-- ═══════════════════════════════════════════════════════════════
-- V8: Tabla de autenticación usuarios_app
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.usuarios_app (
    id             UUID         NOT NULL,
    email          VARCHAR(255) NOT NULL,
    password_hash  VARCHAR(255) NOT NULL,
    nombre         VARCHAR(200) NOT NULL,
    role           VARCHAR(50)  NOT NULL,
    tenant_id      UUID         NOT NULL,
    creado_en      TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT "PK_usuarios_app" PRIMARY KEY (id),
    CONSTRAINT "UK_usuarios_app_email" UNIQUE (email)
);

CREATE INDEX IF NOT EXISTS "IX_usuarios_app_tenant_id"
    ON public.usuarios_app (tenant_id);

CREATE INDEX IF NOT EXISTS "IX_usuarios_app_email"
    ON public.usuarios_app (email);
