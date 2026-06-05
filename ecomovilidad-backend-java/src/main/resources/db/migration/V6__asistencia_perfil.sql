-- ═══════════════════════════════════════════════════════════════
-- V6: Módulos Asistencia QR y Perfil de Usuario
-- Snake_case desde el inicio (aprendido de V4/V5).
-- ═══════════════════════════════════════════════════════════════

-- ─── RegistrosAsistencia ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public."RegistrosAsistencia" (
    id                   UUID         NOT NULL,
    tenant_id            UUID         NOT NULL,
    estudiante_id        UUID         NOT NULL,
    viaje_id             UUID         NOT NULL,
    conductor_id         UUID         NOT NULL,
    tipo                 VARCHAR(10)  NOT NULL,
    hora_registro        TIMESTAMP    NOT NULL DEFAULT NOW(),
    codigo_qr_escaneado  VARCHAR(100) NULL,

    CONSTRAINT "PK_RegistrosAsistencia" PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS "IX_RegistrosAsistencia_TenantId"
    ON public."RegistrosAsistencia" (tenant_id);

CREATE INDEX IF NOT EXISTS "IX_RegistrosAsistencia_ViajeId"
    ON public."RegistrosAsistencia" (viaje_id);

CREATE INDEX IF NOT EXISTS "IX_RegistrosAsistencia_EstudianteId"
    ON public."RegistrosAsistencia" (estudiante_id);

-- ─── PerfilesUsuario ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public."PerfilesUsuario" (
    id                          UUID         NOT NULL,
    tenant_id                   UUID         NOT NULL,
    email                       VARCHAR(100) NOT NULL,
    nombre                      VARCHAR(100) NOT NULL,
    telefono                    VARCHAR(20)  NULL,
    avatar_url                  VARCHAR(255) NULL,
    preferencia_notificaciones  BOOLEAN      NOT NULL DEFAULT TRUE,
    tema                        VARCHAR(20)  NOT NULL DEFAULT 'dark',
    fecha_creacion              TIMESTAMP    NOT NULL DEFAULT NOW(),
    fecha_actualizacion         TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT "PK_PerfilesUsuario" PRIMARY KEY (id),
    CONSTRAINT "UK_PerfilesUsuario_Email" UNIQUE (email, tenant_id)
);

CREATE INDEX IF NOT EXISTS "IX_PerfilesUsuario_TenantId"
    ON public."PerfilesUsuario" (tenant_id);
