# ═══════════════════════════════════════════════════════════════
# EcoMovilidad AI — Backend Java Spring Boot
# Contexto de build: raíz del repositorio
# ═══════════════════════════════════════════════════════════════

FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /build

# 1) Instalar ecomovilidad-core desde el JAR pre-compilado
COPY libs/ecomovilidad-core-1.0.0.jar ./ecomovilidad-core-1.0.0.jar
RUN mvn install:install-file \
      -Dfile=./ecomovilidad-core-1.0.0.jar \
      -DgroupId=com.ecomovilidad \
      -DartifactId=ecomovilidad-core \
      -Dversion=1.0.0 \
      -Dpackaging=jar \
      -B

# 2) Descargar dependencias del backend (aprovecha caché si pom no cambió)
COPY ecomovilidad-backend-java/pom.xml ./backend/pom.xml
RUN mvn -f ./backend/pom.xml dependency:go-offline -B

# 3) Compilar el backend
COPY ecomovilidad-backend-java/src ./backend/src
RUN mvn -f ./backend/pom.xml clean package -DskipTests -B

# ── Runtime ────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /build/backend/target/*.jar app.jar

EXPOSE 5034
ENTRYPOINT ["java", "-jar", "app.jar"]
