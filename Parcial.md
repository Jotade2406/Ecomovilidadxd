# EcoMovilidad — Guía de estudio para el parcial

---

## ¿Cómo habla el frontend con el backend?

Todo pasa por un solo archivo puente. El frontend nunca llama al backend directo.

**El puente:** `ecomovilidad-frontend/lib/api.ts` línea 24

```
Frontend → api.ts (agrega el token JWT) → Backend puerto 5034 → Base de datos
```

- Cada llamada agrega automáticamente `Authorization: Bearer <token>` en el header
- Si el backend responde 401 y ya hay token guardado → redirige al login solo

---

## ¿Por qué algunos endpoints no tienen body?

Porque el backend ya sabe lo que necesita **sin que se lo mandes**.

El token JWT contiene el `tenantId` del colegio. Si solo necesita saber de quién sos, no hace falta mandar nada más.

| Sin body | Con body |
|---------|---------|
| "Dame los estudiantes de mi colegio" — el token ya dice cuál es tu colegio | "Asignar estos estudiantes" — el backend necesita saber cuáles |
| "Dame los viajes activos" — idem | "Iniciar viaje con esta ruta y este bus" — hay que especificarlo |

---

## Los 8 endpoints — dónde están en el código

> Archivos backend: abrir desde `ecomovilidad-backend-java/` (raíz del proyecto, NO el de dentro de `core-plataform/`)
> Usar `Ctrl+P` en VS Code y escribir el nombre del archivo para ir directo.

| # | Qué hace | Tipo | URL | Frontend | Backend |
|---|---------|------|-----|----------|---------|
| 1 | Login | POST | `/api/Auth/login` | AuthContext.tsx **línea 104** | AuthController.java **línea 179** |
| 2 | Registro | POST | `/api/Auth/register` | AuthContext.tsx **línea 135** | AuthController.java **línea 105** |
| 3 | SuperAdmin login | POST | `/api/SuperAdmin/login` | superadmin/page.tsx **línea 344** | SuperAdminController.java **línea 73** |
| 4 | Ver instituciones | GET | `/api/SuperAdmin/tenants` | superadmin/page.tsx **línea 322** | SuperAdminController.java **línea 94** |
| 5 | Lista estudiantes | GET | `/api/Comunidad/estudiantes` | AsignacionesTab.tsx **línea 185** | ComunidadController.java **línea 41** |
| 6 | Lista viajes | GET | `/api/Viajes` | AsignacionesTab.tsx **línea 63** | ViajesController.java **línea 54** |
| 7 | Asignar estudiantes | POST | `/api/Viajes/{id}/asignar-estudiantes` | AsignacionesTab.tsx **línea 201** | ViajesController.java **línea 95** |
| 8 | Estudiantes en viaje | GET | `/api/Viajes/{id}/estudiantes` | PanelSeguimiento.tsx **línea 66** | ViajesController.java **línea 113** |

---

## Contratos — qué entra y qué sale

Un contrato es el acuerdo entre frontend y backend sobre qué datos viajan. El backend los define como `record` de Java. Si el frontend manda un campo de más o de menos, el backend lo rechaza.

```
Frontend arma el JSON → viaja por HTTP → Backend lo recibe como record Java
      { "email": "...", "password": "..." }
                 ↕ tiene que coincidir exactamente
      record LoginRequest(String email, String password)
```

| # | Endpoint | Request (qué envías) | Response (qué recibes) |
|---|---------|---------------------|----------------------|
| 1 | Login | AuthController.java **línea 60** | AuthController.java **línea 79** |
| 2 | Registro | AuthController.java **línea 67** | AuthController.java **línea 79** |
| 3 | SuperAdmin login | SuperAdminController.java **línea 48** | inline `{ token, expiresAt }` |
| 4 | Ver instituciones | sin body | SuperAdminController.java **línea 50** |
| 5 | Lista estudiantes | sin body | `application/comunidad/dtos/EstudianteDto.java` |
| 6 | Lista viajes | sin body | `application/viajes/dtos/ViajeResponse.java` |
| 7 | Asignar estudiantes | `application/viajes/dtos/AsignarEstudiantesRequest.java` | `application/viajes/dtos/AsignarEstudiantesResponse.java` |
| 8 | Estudiantes en viaje | sin body | `application/viajes/dtos/EstudianteEnViajeResponse.java` |

---

## Contratos completos (qué JSON viaja)

### Login
```json
// Envías:
{ "email": "admin@gmail.com", "password": "123" }

// Recibes:
{ "token": "eyJ...", "role": "AdminInstitucion", "tenantId": "...", "tenantNombre": "Colegio San Juan" }
```

### Registro
```json
// Envías:
{ "email": "...", "password": "...", "nombre": "Juan", "rol": "Estudiante", "tenantId": "COLE1005" }
// Roles válidos: "Estudiante" | "Chofer" | "Cliente" | "AdminInstitucion"

// Recibes: igual que login (token directo)
```

### SuperAdmin login
```json
// Envías:
{ "password": "EcoAdmin2026" }

// Recibes:
{ "token": "eyJ...", "expiresAt": "2026-06-06T..." }
```

### Ver instituciones
```json
// Recibes:
[{ "id": "...", "nombre": "Colegio San Juan", "codigo": "COLE1005", "estado": "Activo", "totalUsuarios": 4 }]
```

### Lista estudiantes
```json
// Recibes:
[{ "id": "...", "nombre": "Mateo Alba", "codigoQR": "...", "paradaAsignada": "Parada Norte" }]
```

### Iniciar viaje
```json
// Envías:
{ "rutaId": "uuid", "vehiculoId": "uuid", "conductorId": "uuid" }

// Recibes:
{ "id": "...", "estado": "EnCurso", "nombreRuta": "Ruta Norte", "placaVehiculo": "ABC-123", "nombreConductor": "Carlos M." }
// Estados posibles: "Programado" | "EnCurso" | "Completado" | "Cancelado"
```

### Asignar estudiantes al viaje
```json
// Envías:
{ "estudianteIds": ["uuid1", "uuid2"] }

// Recibes:
{
  "viajeId": "...",
  "cantidadAsignados": 2,
  "estudiantes": [{
    "nombreEstudiante": "Mateo Alba",
    "paradaAsignada": "Parada Norte",
    "estado": "ASIGNADO",
    "horaAsignacion": "2026-06-06T10:00:00"
  }]
}
// Estados de estudiante: "ASIGNADO" | "EN_TRANSPORTE" | "DESCENDIDO" | "AUSENTE"
```

---

## Las 3 capas del contrato

```
1. HTTP CONTRACT  →  application/.../dtos/*.java     (lo que entra y sale por la API)
         ↓ el backend convierte
2. ENTIDAD JAVA   →  domain/viajes/Viaje.java         (objeto interno de negocio)
         ↓ JPA/Hibernate guarda
3. BASE DE DATOS  →  resources/db/migration/V1__initial_schema.sql
```

### Tablas clave en la base de datos
```
resources/db/migration/
  V1__initial_schema.sql             → Viajes, Estudiantes, Vehiculos, Conductores, Rutas
  V2__sprint2_viajes_estudiantes.sql → tabla ViajesEstudiantes
  V5__fix_viajes_columns.sql         → renombra columnas PascalCase → snake_case
```

---

## Flujo completo — asignar estudiantes a un viaje

```
AsignacionesTab.tsx:201            (usuario hace clic en "Asignar")
  → api.ts:24                      (agrega token JWT)
    → ViajesController.java:95     (recibe el request)
      → ViajeService.java:131      (lógica: valida, crea registro)
        → tabla ViajesEstudiantes  (guarda en PostgreSQL)
          → AsignarEstudiantesResponse.java  (arma la respuesta)
            → AsignacionesTab.tsx  (actualiza la UI)
```

---

## Cómo iniciar el proyecto

```powershell
# 1. Bases de datos
docker-compose start

# 2. Backend (desde ecomovilidad-backend-java/)
.\mvnw.cmd spring-boot:run

# 3. Frontend (desde ecomovilidad-frontend/)
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5034
- SuperAdmin: http://localhost:3000/superadmin — contraseña: `EcoAdmin2026`
