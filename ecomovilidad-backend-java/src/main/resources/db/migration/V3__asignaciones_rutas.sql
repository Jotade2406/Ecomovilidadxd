-- ═══════════════════════════════════════════════════════════════
-- Sprint 2 TIER 2: Tabla AsignacionesRutas (Ruta-Vehículo-Conductor)
-- Ejecutar en PostgreSQL: localhost:5433 / ecomovilidad
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public."AsignacionesRutas" (
    "Id"              UUID        NOT NULL,
    "TenantId"        UUID        NOT NULL,
    "RutaId"          UUID        NOT NULL,
    "VehiculoId"      UUID        NOT NULL,
    "ConductorId"     UUID        NOT NULL,
    "Estado"          VARCHAR(20) NOT NULL DEFAULT 'ACTIVA',
    "FechaCreacion"   TIMESTAMP   NOT NULL DEFAULT NOW(),

    CONSTRAINT "PK_AsignacionesRutas" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_AsignacionesRutas_Vehiculos" FOREIGN KEY ("VehiculoId")
        REFERENCES public."Vehiculos"("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_AsignacionesRutas_Conductores" FOREIGN KEY ("ConductorId")
        REFERENCES public."Conductores"("Id") ON DELETE CASCADE
);

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS "IX_AsignacionesRutas_TenantId"
    ON public."AsignacionesRutas" ("TenantId");

CREATE INDEX IF NOT EXISTS "IX_AsignacionesRutas_VehiculoEstado"
    ON public."AsignacionesRutas" ("VehiculoId", "Estado");
