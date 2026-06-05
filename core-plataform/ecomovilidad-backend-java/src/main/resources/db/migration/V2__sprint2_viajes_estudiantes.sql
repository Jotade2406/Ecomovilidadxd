-- ═══════════════════════════════════════════════════════════════
-- Sprint 2: Tabla de vinculación Viaje ↔ Estudiante
-- Ejecutar en PostgreSQL: localhost:5433 / ecomovilidad
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public."ViajesEstudiantes" (
    "Id"                UUID        NOT NULL,
    "TenantId"          UUID        NOT NULL,
    "ViajeId"           UUID        NOT NULL,
    "EstudianteId"      UUID        NOT NULL,
    "Estado"            VARCHAR(20) NOT NULL DEFAULT 'ASIGNADO',
    "OrdenAsignacion"   INTEGER     NOT NULL DEFAULT 0,
    "HoraAsignacion"    TIMESTAMP   NOT NULL DEFAULT NOW(),
    "HoraDescenso"      TIMESTAMP   NULL,

    CONSTRAINT "PK_ViajesEstudiantes" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_ViajesEstudiantes_Viajes" FOREIGN KEY ("ViajeId")
        REFERENCES public."Viajes"("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_ViajesEstudiantes_Estudiantes" FOREIGN KEY ("EstudianteId")
        REFERENCES public."Estudiantes"("Id") ON DELETE CASCADE,
    CONSTRAINT "UK_viaje_estudiante" UNIQUE ("ViajeId", "EstudianteId")
);

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS "IX_ViajesEstudiantes_ViajeId"
    ON public."ViajesEstudiantes" ("ViajeId");

CREATE INDEX IF NOT EXISTS "IX_ViajesEstudiantes_TenantId"
    ON public."ViajesEstudiantes" ("TenantId");

CREATE INDEX IF NOT EXISTS "IX_ViajesEstudiantes_EstudianteId"
    ON public."ViajesEstudiantes" ("EstudianteId");
