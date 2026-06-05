-- ═══════════════════════════════════════════════════════════════
-- V7: Módulo de Pagos (planes mensuales y anuales)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public."Pagos" (
    id                UUID           NOT NULL,
    tenant_id         UUID           NOT NULL,
    estudiante_id     UUID           NOT NULL,
    tipo_plan         VARCHAR(20)    NOT NULL,
    estado            VARCHAR(20)    NOT NULL DEFAULT 'PENDIENTE',
    monto             DECIMAL(10, 2) NOT NULL,
    fecha_vencimiento DATE           NOT NULL,
    fecha_pago        TIMESTAMP      NULL,
    referencia_pago   VARCHAR(100)   NULL,
    fecha_creacion    TIMESTAMP      NOT NULL DEFAULT NOW(),

    CONSTRAINT "PK_Pagos" PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS "IX_Pagos_TenantId"
    ON public."Pagos" (tenant_id);

CREATE INDEX IF NOT EXISTS "IX_Pagos_EstudianteId"
    ON public."Pagos" (estudiante_id);

CREATE INDEX IF NOT EXISTS "IX_Pagos_Estado"
    ON public."Pagos" (estado);
