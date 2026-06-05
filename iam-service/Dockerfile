# ═══════════════════════════════════════════════════════════════
# EcoMovilidad — iam-service
# Contexto de build: raíz del repositorio
# Necesita core-platform instalado antes de compilar iam-service
# ═══════════════════════════════════════════════════════════════

FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /build

# 1) Instalar core-platform en el repo local Maven
COPY core-plataform/core-platform/ /core-platform/
RUN mvn -f /core-platform/pom.xml clean install -DskipTests -B

# 2) Descargar dependencias de iam-service
COPY iam-service/pom.xml ./pom.xml
RUN mvn -f ./pom.xml dependency:go-offline -B --fail-never

# 3) Compilar iam-service
COPY iam-service/src/ ./src/
RUN mvn -f ./pom.xml clean package -DskipTests -B

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

COPY --from=builder /build/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
