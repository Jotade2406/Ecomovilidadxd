# ═══════════════════════════════════════════════════════════════
# EcoMovilidad — ai-service (Spring AI, perfil dev)
# Contexto de build: raíz del repositorio
# ═══════════════════════════════════════════════════════════════

FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /build

COPY ai-service/pom.xml ./pom.xml
COPY ai-service/modules/ ./modules/

RUN mvn -f pom.xml dependency:go-offline -B --fail-never
RUN mvn -f pom.xml clean package -DskipTests -B

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

COPY --from=builder /build/modules/ai-bootstrap/target/*.jar app.jar

EXPOSE 8091
ENTRYPOINT ["java", "-jar", "-Dspring.profiles.active=dev", "app.jar"]
