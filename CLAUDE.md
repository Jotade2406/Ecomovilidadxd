# EcoMovilidad — Contexto del proyecto para Claude Code

Plataforma de gestión de transporte escolar. Multi-tenant (un tenant = un colegio).

## Stack

| Capa | Tecnología | Puerto |
|------|-----------|--------|
| Frontend | Next.js 16.2.4, Tailwind CSS v4, TypeScript | 3000 |
| Backend | Spring Boot 3.3.5, Java 17, JPA/Hibernate | 5034 |
| Base de datos | PostgreSQL | 5433 |
| Mensajería real-time | MongoDB + WebSocket/STOMP | 27017 |
| Contenedores | Docker Compose | — |

## Cómo iniciar el proyecto

```powershell
# 1. Bases de datos
docker-compose start

# 2. Backend  (desde ecomovilidad-backend-java/)
.\mvnw.cmd spring-boot:run

# 3. Frontend (desde ecomovilidad-frontend/)
npm run dev
```

Credenciales superadmin: contraseña `EcoAdmin2026` en `http://localhost:3000/superadmin`

---

## Arquitectura de carpetas clave

```
Ecomovilidadxd-main/
├── ecomovilidad-frontend/          ← Next.js (App Router)
│   ├── lib/api.ts                  ← PUENTE HTTP: todas las llamadas al backend pasan aquí
│   ├── context/AuthContext.tsx     ← JWT en localStorage, login/register
│   ├── app/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── superadmin/page.tsx
│   │   └── dashboard/
│   │       ├── page.tsx            ← stats del dashboard
│   │       ├── flota/page.tsx      ← vehículos y conductores
│   │       └── usuarios/page.tsx   ← gestión de usuarios
│   ├── components/dashboard/
│   │   ├── AsignacionesTab.tsx     ← viajes + modal asignar estudiantes
│   │   ├── EnVivoTab.tsx           ← mapa en tiempo real
│   │   └── DashboardLayout.tsx
│   ├── components/
│   │   └── PanelSeguimiento.tsx    ← panel lateral viaje activo
│   └── hooks/
│       └── useViajeActual.ts       ← estado del viaje activo
│
└── ecomovilidad-backend-java/
    └── src/main/java/com/ecomovilidad/
        ├── api/                    ← Controllers HTTP (entrada)
        │   ├── AuthController.java
        │   ├── SuperAdminController.java
        │   ├── ViajesController.java
        │   ├── ComunidadController.java
        │   ├── FlotaController.java
        │   └── RutasController.java
        ├── application/            ← Servicios + DTOs
        │   ├── viajes/services/ViajeService.java
        │   └── viajes/dtos/        ← contratos de viajes
        ├── domain/                 ← Entidades de negocio
        │   ├── viajes/Viaje.java
        │   ├── viajes/EstudianteEnViaje.java
        │   └── comunidad/Estudiante.java
        └── infrastructure/
            └── persistence/repositories/  ← JPA repositories
```

---

## El puente HTTP

**`ecomovilidad-frontend/lib/api.ts` línea 24**

Todo request al backend pasa por acá. Agrega `Authorization: Bearer <token>` automáticamente.
Si el backend responde 401 y ya hay token → sesión expirada → redirige a `/login`.

---

## Endpoints y dónde están en el código

### AUTH

| Endpoint | Método | Frontend llama desde | Backend responde en |
|----------|--------|---------------------|---------------------|
| `/api/Auth/login` | POST | `context/AuthContext.tsx:104` | `AuthController.java:179` |
| `/api/Auth/register` | POST | `context/AuthContext.tsx:135` | `AuthController.java:105` |

**Contrato login:**
```json
// Envías:
{ "email": "...", "password": "..." }
// Recibes:
{ "token": "eyJ...", "role": "AdminInstitucion", "tenantId": "...", "tenantNombre": "..." }
```

**Contrato register:**
```json
// Envías:
{ "email": "...", "password": "...", "nombre": "...", "rol": "Estudiante", "tenantId": "COLE1005" }
// Recibes: igual que login (token directo)
```

Los records (contratos) están definidos en `AuthController.java` líneas 60–83.
Roles válidos: `"Estudiante"` | `"Chofer"` | `"Cliente"` | `"AdminInstitucion"`

---

### SUPERADMIN

| Endpoint | Método | Frontend llama desde | Backend responde en |
|----------|--------|---------------------|---------------------|
| `/api/SuperAdmin/login` | POST | `app/superadmin/page.tsx:344` | `SuperAdminController.java:73` |
| `/api/SuperAdmin/tenants` | GET | `app/superadmin/page.tsx:322` | `SuperAdminController.java:94` |
| `/api/SuperAdmin/tenants/{id}/asignar-admin/{userId}` | PUT | `app/superadmin/page.tsx:109` | `SuperAdminController.java:250` |

**Contrato login superadmin:**
```json
// Envías: { "password": "EcoAdmin2026" }
// Recibes: { "token": "eyJ...", "expiresAt": "..." }
```

Los records TenantInfo, AdminDisponible están en `SuperAdminController.java` líneas 50–69.

> Al asignar nuevo admin, el anterior queda automáticamente sin asignación (vuelve al tenant demo).

---

### ESTUDIANTES

| Endpoint | Método | Frontend llama desde | Backend responde en |
|----------|--------|---------------------|---------------------|
| `/api/Comunidad/estudiantes` | GET | `AsignacionesTab.tsx:185` | `ComunidadController.java:41` |
| `/api/Comunidad/estudiantes` | POST | manual vía form | `ComunidadController.java:34` |

**Contrato GET (lo que devuelve):**
```json
[{ "id": "...", "nombre": "...", "codigoQR": "...", "tutorId": "...", "paradaAsignada": "..." }]
```

Contratos en:
- `application/comunidad/dtos/EstudianteDto.java` (respuesta)
- `application/comunidad/dtos/CrearEstudianteCommand.java` (request crear)

> Al registrar un usuario con rol `Estudiante` vía `/api/Auth/register`, se crea automáticamente su ficha en la tabla Estudiantes. Ver `AuthController.java:166`.

---

### VIAJES

| Endpoint | Método | Frontend llama desde | Backend responde en |
|----------|--------|---------------------|---------------------|
| `/api/Viajes` | GET | `AsignacionesTab.tsx:63` | `ViajesController.java:54` |
| `/api/Viajes/iniciar` | POST | `AsignacionesTab.tsx:84` | `ViajesController.java:44` |
| `/api/Viajes/{id}/completar` | PATCH | `AsignacionesTab.tsx:97` | `ViajesController.java:71` |
| `/api/Viajes/{id}/cancelar` | PATCH | `AsignacionesTab.tsx:106` | `ViajesController.java:81` |

**Contrato iniciar viaje:**
```json
// Envías:
{ "rutaId": "uuid", "vehiculoId": "uuid", "conductorId": "uuid" }
// Recibes:
{
  "id": "...", "estado": "EnCurso",
  "nombreRuta": "Ruta Norte", "placaVehiculo": "ABC-123", "nombreConductor": "Carlos M.",
  "fechaInicio": "2026-06-05T15:30:00", "fechaFin": null
}
```

Estados posibles: `"Programado"` | `"EnCurso"` | `"Completado"` | `"Cancelado"`

Contratos en `application/viajes/dtos/IniciarViajeRequest.java` y `ViajeResponse.java`.
Lógica de negocio en `application/viajes/services/ViajeService.java:58`.

---

### ASIGNAR ESTUDIANTES A UN VIAJE

| Endpoint | Método | Frontend llama desde | Backend responde en |
|----------|--------|---------------------|---------------------|
| `/api/Viajes/{id}/asignar-estudiantes` | POST | `AsignacionesTab.tsx:201` | `ViajesController.java:95` |
| `/api/Viajes/{id}/estudiantes` | GET | `PanelSeguimiento.tsx:66` | `ViajesController.java:113` |

**Contrato asignar:**
```json
// Envías:
{ "estudianteIds": ["uuid1", "uuid2"] }

// Recibes:
{
  "viajeId": "...",
  "cantidadAsignados": 2,
  "estudiantes": [{
    "id": "...", "nombreEstudiante": "Mateo Alba",
    "estado": "ASIGNADO", "horaAsignacion": "...", "horaDescenso": null
  }]
}
```

Estados de estudiante: `"ASIGNADO"` | `"EN_TRANSPORTE"` | `"DESCENDIDO"` | `"AUSENTE"`

Contratos en:
- `application/viajes/dtos/AsignarEstudiantesRequest.java`
- `application/viajes/dtos/AsignarEstudiantesResponse.java`
- `application/viajes/dtos/EstudianteEnViajeResponse.java`

Lógica en `ViajeService.java:131`.

---

### VISTA EN VIVO

| Archivo | Qué hace |
|---------|---------|
| `components/dashboard/EnVivoTab.tsx` | Vista principal con mapa Leaflet |
| `components/PanelSeguimiento.tsx:51` | Carga viajes activos |
| `components/PanelSeguimiento.tsx:66` | Carga estudiantes del viaje activo |
| `hooks/useViajeActual.ts` | Hook que mantiene el viaje activo actualizado |

---

## Las 3 capas del contrato

```
HTTP CONTRACT  →  application/viajes/dtos/*.java     (lo que entra/sale por la API)
      ↓ el backend convierte
ENTIDAD JAVA   →  domain/viajes/Viaje.java            (objeto interno de negocio)
      ↓ JPA/Hibernate guarda
BASE DE DATOS  →  resources/db/migration/V1__initial_schema.sql
```

### Tablas clave en la base de datos

```
resources/db/migration/
  V1__initial_schema.sql              → Viajes, Estudiantes, Vehiculos, Conductores, Rutas
  V2__sprint2_viajes_estudiantes.sql  → tabla ViajesEstudiantes (relación viaje-estudiante)
  V5__fix_viajes_columns.sql          → renombra columnas PascalCase → snake_case
```

---

## Bugs corregidos en esta sesión

| Bug | Archivo corregido | Línea |
|-----|------------------|-------|
| 500 al asignar estudiante (orphanRemoval conflict) | `ViajeService.java` | 162 — se eliminó `viaje.agregarEstudiante(ev)` |
| Login recargaba página sin mostrar error | `lib/api.ts` | 47–54 — 401 sin token no redirige |
| SuperAdmin muestra dos admins como "actual" | `SuperAdminController.java` | 266 — desasigna admin anterior |
| Turbopack crashes (pantalla parpadeante) | `package.json` | script `dev` usa `--webpack` |
| Estudiante no aparecía al registrarse | `AuthController.java` | 166 — auto-crea entidad Estudiante |

---

## Notas importantes

- El `tenantId` viaja en el JWT — el backend filtra automáticamente por colegio en cada request.
- No existe `mvnw.cmd` en `core-plataform/` — usar el de `ecomovilidad-backend-java/`.
- El warning `iam-service no disponible` al arrancar es normal e inofensivo.
- 62 errores de ESLint no afectan el funcionamiento — TypeScript compila sin errores.
- Dev script usa `--webpack` porque Turbopack causaba crashes en Next.js 16.2.4.
