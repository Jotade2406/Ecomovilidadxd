# EcoMovilidad AI

Sistema de gestión de movilidad escolar con seguimiento en tiempo real.

## Requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y corriendo

**Eso es todo.** No necesitas Java, Node, ni PostgreSQL instalados.

## Correr el proyecto

```bash
git clone <url-del-repo>
cd ProyectoAI
docker compose up --build
```

La primera vez tarda ~5 minutos mientras construye las imágenes. Las siguientes veces es mucho más rápido.

## URLs

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5034 |
| Swagger UI | http://localhost:5034/swagger-ui.html |

## Detener

```bash
docker compose down
```

Para borrar también los datos de la base de datos:

```bash
docker compose down -v
```

## Desarrollo local (sin Docker)

Si quieres correr los servicios individualmente necesitas:

- Java 17 + Maven
- Node.js 20+
- PostgreSQL en `localhost:5433` (user: `root`, pass: `123456`, db: `ecomovilidad`)
- MongoDB en `localhost:27017`

Luego:

```bash
# Backend
cd ecomovilidad-backend-java
./mvnw spring-boot:run

# Frontend (otra terminal)
cd ecomovilidad-frontend
npm install
npm run dev
```
