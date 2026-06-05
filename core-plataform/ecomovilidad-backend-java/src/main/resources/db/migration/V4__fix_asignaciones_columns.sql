-- ═══════════════════════════════════════════════════════════════
-- V4: Fix columnas PascalCase → lowercase en AsignacionesRutas
-- PostgreSQL trata identificadores sin comillas como lowercase.
-- Renombrar para consistencia con Hibernate.
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public."AsignacionesRutas" RENAME COLUMN "Id"            TO id;
ALTER TABLE public."AsignacionesRutas" RENAME COLUMN "TenantId"      TO tenant_id;
ALTER TABLE public."AsignacionesRutas" RENAME COLUMN "RutaId"        TO ruta_id;
ALTER TABLE public."AsignacionesRutas" RENAME COLUMN "VehiculoId"    TO vehiculo_id;
ALTER TABLE public."AsignacionesRutas" RENAME COLUMN "ConductorId"   TO conductor_id;
ALTER TABLE public."AsignacionesRutas" RENAME COLUMN "Estado"        TO estado;
ALTER TABLE public."AsignacionesRutas" RENAME COLUMN "FechaCreacion" TO fecha_creacion;
