-- ═══════════════════════════════════════════════════════════════
-- V5: Fix columnas PascalCase → snake_case en TODAS las tablas
--     que aún usan PascalCase (misma estrategia que V4).
-- PostgreSQL trata identificadores sin comillas como lowercase.
-- ═══════════════════════════════════════════════════════════════

-- ─── Tabla: public."Viajes" ────────────────────────────────────
ALTER TABLE public."Viajes" RENAME COLUMN "Id"           TO id;
ALTER TABLE public."Viajes" RENAME COLUMN "TenantId"     TO tenant_id;
ALTER TABLE public."Viajes" RENAME COLUMN "RutaId"       TO ruta_id;
ALTER TABLE public."Viajes" RENAME COLUMN "VehiculoId"   TO vehiculo_id;
ALTER TABLE public."Viajes" RENAME COLUMN "ConductorId"  TO conductor_id;
ALTER TABLE public."Viajes" RENAME COLUMN "Estado"       TO estado;
ALTER TABLE public."Viajes" RENAME COLUMN "FechaInicio"  TO fecha_inicio;
ALTER TABLE public."Viajes" RENAME COLUMN "FechaFin"     TO fecha_fin;
ALTER TABLE public."Viajes" RENAME COLUMN "CreadoEn"     TO creado_en;

-- ─── Tabla: public."ViajesEstudiantes" ─────────────────────────
ALTER TABLE public."ViajesEstudiantes" RENAME COLUMN "Id"              TO id;
ALTER TABLE public."ViajesEstudiantes" RENAME COLUMN "TenantId"        TO tenant_id;
ALTER TABLE public."ViajesEstudiantes" RENAME COLUMN "ViajeId"         TO viaje_id;
ALTER TABLE public."ViajesEstudiantes" RENAME COLUMN "EstudianteId"    TO estudiante_id;
ALTER TABLE public."ViajesEstudiantes" RENAME COLUMN "Estado"          TO estado;
ALTER TABLE public."ViajesEstudiantes" RENAME COLUMN "OrdenAsignacion" TO orden_asignacion;
ALTER TABLE public."ViajesEstudiantes" RENAME COLUMN "HoraAsignacion"  TO hora_asignacion;
ALTER TABLE public."ViajesEstudiantes" RENAME COLUMN "HoraDescenso"    TO hora_descenso;

-- ─── Tabla: public."Vehiculos" ─────────────────────────────────
ALTER TABLE public."Vehiculos" RENAME COLUMN "Id"         TO id;
ALTER TABLE public."Vehiculos" RENAME COLUMN "TenantId"   TO tenant_id;
ALTER TABLE public."Vehiculos" RENAME COLUMN "Placa"      TO placa;
ALTER TABLE public."Vehiculos" RENAME COLUMN "Capacidad"  TO capacidad;
ALTER TABLE public."Vehiculos" RENAME COLUMN "Estado"     TO estado;
ALTER TABLE public."Vehiculos" RENAME COLUMN "FuelRate"   TO fuel_rate;

-- ─── Tabla: public."Conductores" ───────────────────────────────
ALTER TABLE public."Conductores" RENAME COLUMN "Id"       TO id;
ALTER TABLE public."Conductores" RENAME COLUMN "TenantId" TO tenant_id;
ALTER TABLE public."Conductores" RENAME COLUMN "Nombre"   TO nombre;
ALTER TABLE public."Conductores" RENAME COLUMN "Licencia" TO licencia;
ALTER TABLE public."Conductores" RENAME COLUMN "Turnos"   TO turnos;

-- ─── Tabla: public."Estudiantes" ───────────────────────────────
ALTER TABLE public."Estudiantes" RENAME COLUMN "Id"              TO id;
ALTER TABLE public."Estudiantes" RENAME COLUMN "TenantId"        TO tenant_id;
ALTER TABLE public."Estudiantes" RENAME COLUMN "Nombre"          TO nombre;
ALTER TABLE public."Estudiantes" RENAME COLUMN "CodigoQR"        TO codigo_qr;
ALTER TABLE public."Estudiantes" RENAME COLUMN "QRCodeTTL"       TO qr_code_ttl;
ALTER TABLE public."Estudiantes" RENAME COLUMN "TutorId"         TO tutor_id;
ALTER TABLE public."Estudiantes" RENAME COLUMN "ParadaAsignada"  TO parada_asignada;

-- ─── Tabla: rutas.rutas ────────────────────────────────────────
-- Nota: "Id" y "TenantId" vienen del superclass Entity
ALTER TABLE rutas.rutas RENAME COLUMN "Id"                       TO id;
ALTER TABLE rutas.rutas RENAME COLUMN "TenantId"                 TO tenant_id;
ALTER TABLE rutas.rutas RENAME COLUMN "Nombre"                   TO nombre;
ALTER TABLE rutas.rutas RENAME COLUMN "FechaCreacion"            TO fecha_creacion;
ALTER TABLE rutas.rutas RENAME COLUMN "FechaUltimaActualizacion" TO fecha_ultima_actualizacion;

-- ─── Tabla: rutas.ruta_puntos_intermedios ──────────────────────
ALTER TABLE rutas.ruta_puntos_intermedios RENAME COLUMN "RutaId" TO ruta_id;

-- ─── Tabla: rutas.ruta_versiones ───────────────────────────────
ALTER TABLE rutas.ruta_versiones RENAME COLUMN "Id"                  TO id;
ALTER TABLE rutas.ruta_versiones RENAME COLUMN "TenantId"            TO tenant_id;
ALTER TABLE rutas.ruta_versiones RENAME COLUMN "RutaId"              TO ruta_id;
ALTER TABLE rutas.ruta_versiones RENAME COLUMN "Version"             TO version;
ALTER TABLE rutas.ruta_versiones RENAME COLUMN "Snapshot"            TO snapshot;
ALTER TABLE rutas.ruta_versiones RENAME COLUMN "CambioDescripcion"   TO cambio_descripcion;
ALTER TABLE rutas.ruta_versiones RENAME COLUMN "CreadoPor"           TO creado_por;
ALTER TABLE rutas.ruta_versiones RENAME COLUMN "CreadoEn"            TO creado_en;

-- ─── Tabla: public."AuditLogs" ─────────────────────────────────
ALTER TABLE public."AuditLogs" RENAME COLUMN "Id"            TO id;
ALTER TABLE public."AuditLogs" RENAME COLUMN "TenantId"      TO tenant_id;
ALTER TABLE public."AuditLogs" RENAME COLUMN "UserId"        TO user_id;
ALTER TABLE public."AuditLogs" RENAME COLUMN "TableName"     TO table_name;
ALTER TABLE public."AuditLogs" RENAME COLUMN "Action"        TO action;
ALTER TABLE public."AuditLogs" RENAME COLUMN "KeyValues"     TO key_values;
ALTER TABLE public."AuditLogs" RENAME COLUMN "OldValues"     TO old_values;
ALTER TABLE public."AuditLogs" RENAME COLUMN "NewValues"     TO new_values;
ALTER TABLE public."AuditLogs" RENAME COLUMN "Timestamp"     TO "timestamp";
