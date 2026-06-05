-- ═══════════════════════════════════════════════════════════════
-- V9: Tabla de instituciones (multi-tenancy real)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.tenants (
    id         UUID         NOT NULL,
    nombre     VARCHAR(200) NOT NULL,
    codigo     VARCHAR(20)  NOT NULL,
    estado     VARCHAR(20)  NOT NULL DEFAULT 'Activo',
    creado_en  TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT "PK_tenants" PRIMARY KEY (id),
    CONSTRAINT "UK_tenants_codigo" UNIQUE (codigo)
);

CREATE INDEX IF NOT EXISTS "IX_tenants_codigo" ON public.tenants (codigo);

-- Tenant demo para los datos ya existentes en el sistema
INSERT INTO public.tenants (id, nombre, codigo, estado)
VALUES ('00000000-0000-0000-0000-000000000001', 'Institución Demo', 'DEMO01', 'Activo')
ON CONFLICT (id) DO NOTHING;
