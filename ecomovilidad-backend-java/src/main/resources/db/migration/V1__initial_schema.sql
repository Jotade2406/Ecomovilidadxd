-- ═══════════════════════════════════════════════════════════════
-- V1: Esquema inicial — Rutas, Flota, Comunidad, Viajes, Auditoría
-- Columnas en PascalCase (se renombran a snake_case en V5).
-- ═══════════════════════════════════════════════════════════════

-- ─── Schema rutas ──────────────────────────────────────────────

CREATE SCHEMA IF NOT EXISTS rutas;

-- ─── rutas.rutas ───────────────────────────────────────────────
-- Columnas "Id","TenantId","Nombre","FechaCreacion","FechaUltimaActualizacion"
-- son renombradas por V5. El resto ya tiene nombre snake_case.

CREATE TABLE IF NOT EXISTS rutas.rutas (
    "Id"                        UUID             NOT NULL,
    "TenantId"                  UUID             NOT NULL,
    "Nombre"                    VARCHAR(200)     NOT NULL,
    origen_latitud              DOUBLE PRECISION NOT NULL,
    origen_longitud             DOUBLE PRECISION NOT NULL,
    destino_latitud             DOUBLE PRECISION NOT NULL,
    destino_longitud            DOUBLE PRECISION NOT NULL,
    estado                      VARCHAR(20)      NOT NULL DEFAULT 'Borrador',
    color                       VARCHAR(9)       NOT NULL DEFAULT '#3b82f6',
    "FechaCreacion"             TIMESTAMP        NOT NULL,
    "FechaUltimaActualizacion"  TIMESTAMP        NULL,

    CONSTRAINT "PK_Rutas" PRIMARY KEY ("Id")
);

CREATE INDEX IF NOT EXISTS "IX_Rutas_TenantId" ON rutas.rutas ("TenantId");
CREATE INDEX IF NOT EXISTS "IX_Rutas_Estado"   ON rutas.rutas (estado);

-- ─── rutas.ruta_puntos_intermedios ─────────────────────────────
-- Columna "RutaId" es renombrada por V5 a ruta_id.

CREATE TABLE IF NOT EXISTS rutas.ruta_puntos_intermedios (
    "RutaId"  UUID             NOT NULL,
    orden     INTEGER          NOT NULL,
    latitud   DOUBLE PRECISION NOT NULL,
    longitud  DOUBLE PRECISION NOT NULL,

    CONSTRAINT "FK_RutaPuntosIntermedios_Rutas" FOREIGN KEY ("RutaId")
        REFERENCES rutas.rutas ("Id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "IX_RutaPuntosIntermedios_RutaId"
    ON rutas.ruta_puntos_intermedios ("RutaId");

-- ─── rutas.ruta_versiones ──────────────────────────────────────
-- Todas las columnas en PascalCase son renombradas por V5.

CREATE TABLE IF NOT EXISTS rutas.ruta_versiones (
    "Id"                UUID         NOT NULL,
    "TenantId"          UUID         NOT NULL,
    "RutaId"            UUID         NOT NULL,
    "Version"           INTEGER      NOT NULL,
    "Snapshot"          JSONB        NOT NULL,
    "CambioDescripcion" VARCHAR(500) NOT NULL,
    "CreadoPor"         VARCHAR(200) NOT NULL,
    "CreadoEn"          TIMESTAMP    NOT NULL,

    CONSTRAINT "PK_RutaVersiones" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_RutaVersiones_Rutas" FOREIGN KEY ("RutaId")
        REFERENCES rutas.rutas ("Id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "IX_RutaVersiones_RutaId" ON rutas.ruta_versiones ("RutaId");

-- ─── public."Vehiculos" ────────────────────────────────────────
-- Todas las columnas en PascalCase son renombradas por V5.

CREATE TABLE IF NOT EXISTS public."Vehiculos" (
    "Id"        UUID           NOT NULL,
    "TenantId"  UUID           NOT NULL,
    "Placa"     VARCHAR(50)    NOT NULL,
    "Capacidad" INTEGER        NOT NULL,
    "Estado"    VARCHAR(20)    NOT NULL DEFAULT 'Activo',
    "FuelRate"  DECIMAL(10, 4) NOT NULL,

    CONSTRAINT "PK_Vehiculos" PRIMARY KEY ("Id")
);

CREATE INDEX IF NOT EXISTS "IX_Vehiculos_TenantId" ON public."Vehiculos" ("TenantId");

-- ─── public."Conductores" ──────────────────────────────────────
-- Todas las columnas en PascalCase son renombradas por V5.

CREATE TABLE IF NOT EXISTS public."Conductores" (
    "Id"       UUID         NOT NULL,
    "TenantId" UUID         NOT NULL,
    "Nombre"   VARCHAR(200) NOT NULL,
    "Licencia" VARCHAR(50)  NOT NULL,
    "Turnos"   VARCHAR(50)  NOT NULL,

    CONSTRAINT "PK_Conductores" PRIMARY KEY ("Id")
);

CREATE INDEX IF NOT EXISTS "IX_Conductores_TenantId" ON public."Conductores" ("TenantId");

-- ─── public."Estudiantes" ──────────────────────────────────────
-- Todas las columnas en PascalCase son renombradas por V5.

CREATE TABLE IF NOT EXISTS public."Estudiantes" (
    "Id"             UUID         NOT NULL,
    "TenantId"       UUID         NOT NULL,
    "Nombre"         VARCHAR(200) NOT NULL,
    "CodigoQR"       VARCHAR(200) NOT NULL,
    "QRCodeTTL"      TIMESTAMP    NOT NULL,
    "TutorId"        UUID         NOT NULL,
    "ParadaAsignada" VARCHAR(100) NOT NULL,

    CONSTRAINT "PK_Estudiantes" PRIMARY KEY ("Id")
);

CREATE INDEX IF NOT EXISTS "IX_Estudiantes_TenantId" ON public."Estudiantes" ("TenantId");

-- ─── public."Viajes" ───────────────────────────────────────────
-- Todas las columnas en PascalCase son renombradas por V5.

CREATE TABLE IF NOT EXISTS public."Viajes" (
    "Id"          UUID        NOT NULL,
    "TenantId"    UUID        NOT NULL,
    "RutaId"      UUID        NOT NULL,
    "VehiculoId"  UUID        NOT NULL,
    "ConductorId" UUID        NOT NULL,
    "Estado"      VARCHAR(20) NOT NULL DEFAULT 'Programado',
    "FechaInicio" TIMESTAMP   NULL,
    "FechaFin"    TIMESTAMP   NULL,
    "CreadoEn"    TIMESTAMP   NOT NULL,

    CONSTRAINT "PK_Viajes"              PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Viajes_Vehiculos"    FOREIGN KEY ("VehiculoId")
        REFERENCES public."Vehiculos"   ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_Viajes_Conductores"  FOREIGN KEY ("ConductorId")
        REFERENCES public."Conductores" ("Id") ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS "IX_Viajes_TenantId" ON public."Viajes" ("TenantId");
CREATE INDEX IF NOT EXISTS "IX_Viajes_Estado"   ON public."Viajes" ("Estado");
CREATE INDEX IF NOT EXISTS "IX_Viajes_CreadoEn" ON public."Viajes" ("CreadoEn" DESC);

-- ─── public."AuditLogs" ────────────────────────────────────────
-- Todas las columnas en PascalCase son renombradas por V5.

CREATE TABLE IF NOT EXISTS public."AuditLogs" (
    "Id"        UUID         NOT NULL,
    "TenantId"  UUID         NOT NULL,
    "UserId"    VARCHAR(200) NULL,
    "TableName" VARCHAR(100) NOT NULL,
    "Action"    VARCHAR(20)  NOT NULL,
    "KeyValues" TEXT         NULL,
    "OldValues" TEXT         NULL,
    "NewValues" TEXT         NULL,
    "Timestamp" TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT "PK_AuditLogs" PRIMARY KEY ("Id")
);

CREATE INDEX IF NOT EXISTS "IX_AuditLogs_TenantId"  ON public."AuditLogs" ("TenantId");
CREATE INDEX IF NOT EXISTS "IX_AuditLogs_Timestamp" ON public."AuditLogs" ("Timestamp" DESC);
