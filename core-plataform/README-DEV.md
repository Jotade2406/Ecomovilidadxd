# Developer Guide - Multi-Repo Workspace

This workspace contains 3 repositories for the Solveria platform:

## 📦 Repositories

### 1. `core-plataform/` (Core Platform Library)
- **Purpose:** Shared enterprise library with IAM, audit, observability, multi-tenancy
- **Tech:** Spring Boot 3.4.0, Java 21, Postgres/MongoDB/Redis support
- **Output:** JAR library consumed by microservices

### 2. `iam-service/` (Identity & Access Management Service)
- **Purpose:** Authentication, authorization, user/role management microservice
- **Tech:** Spring Boot 3.4.0, Java 21, Postgres, JWT, Pact contract testing
- **Port:** 8080 (default)
- **Depends on:** `core-platform`

### 3. `ai-service/` (AI Service)
- **Purpose:** LLM completions, RAG, vector search microservice
- **Tech:** Spring Boot 3.4.0, Java 21, Spring AI, OpenAI, PgVector, MongoDB Atlas
- **Port:** 8091 (default)
- **Architecture:** Clean Architecture (domain/application/infrastructure/api/bootstrap)

---

## 🚀 Quick Start

### Prerequisites
- Java 21 (required by maven-enforcer-plugin)
- Maven 3.9+ (or use included `mvnw`/`mvnw.cmd`)
- Docker Desktop (for Postgres/MongoDB/Redis)
- PowerShell (Windows)

### Build Everything
```powershell
# Build all repos in correct order (core → iam → ai)
.\scripts\build-all.ps1

# Build without tests (faster)
.\scripts\build-all.ps1 -SkipTests
```

### Run Tests
```powershell
# Run all tests across all repos
.\scripts\test-all.ps1
```

### Install Core Platform Only
```powershell
# Install core-platform to local Maven repo (needed before building services)
.\scripts\install-core.ps1
```

---

## 🏗️ Build Order (IMPORTANT)

**Services depend on `core-platform`, so build order matters:**

1. **core-platform** → `mvn install` (publishes to local Maven repo)
2. **iam-service** → `mvn verify` (resolves core-platform from local repo)
3. **ai-service** → `mvn verify` (resolves core-platform from local repo)

**❌ DON'T:**
```powershell
cd iam-service && mvnw verify  # FAILS if core-platform not installed
```

**✅ DO:**
```powershell
.\scripts\build-all.ps1  # Handles dependencies automatically
```

---

## 📋 Per-Repository Setup

### Core Platform
```powershell
cd core-plataform
.\mvnw clean install -DskipTests   # Install to local Maven
.\mvnw test                        # Run tests (includes ArchUnit)
```

### IAM Service
```powershell
cd iam-service
.\mvnw clean verify                # Build + tests
.\mvnw spring-boot:run             # Run locally (port 8080)

# Contract tests with Pact
.\mvnw test -Ppact
```

**Swagger UI:** http://localhost:8080/swagger-ui.html

### AI Service
```powershell
cd ai-service

# Start Postgres (Docker)
.\scripts\dev-up.ps1

# Build
.\mvnw.cmd clean verify

# Run with dev profile (uses stubs, no OpenAI key needed)
.\scripts\dev-run.ps1

# Stop Postgres
.\scripts\dev-down.ps1
```

**Swagger UI:** http://localhost:8091/swagger-ui.html

---

## 🧪 Testing Strategy

### Unit Tests
```powershell
mvnw test
```

### Integration Tests
```powershell
mvnw verify  # Runs unit + integration (if maven-failsafe-plugin configured)
```

### Architecture Tests (ArchUnit)
- **core-platform:** `CoreArchitectureTest.java` (domain/application/infrastructure boundaries)
- **Status:** ⚠️ JPA in domain documented as technical debt (ADR-001)

### Contract Tests (Pact)
- **iam-service:** Provider-side Pact verification
```powershell
cd iam-service
mvnw test -Ppact
```

---

## 🔧 Configuration

### Environment Variables
Each service uses `.env` files (gitignored):

**ai-service/.env:**
```bash
AI_PG_HOST_PORT=5434
OPENAI_API_KEY=sk-...  # Only needed for production profile
```

**iam-service:** Uses `application-dev.yml` defaults (no .env needed for dev)

### Profiles
- **dev** (default): Local development, stubs enabled, JWT disabled
- **test**: Integration testing, in-memory H2/embedded Mongo
- **prod**: Production settings, JWT required, real APIs

---

## 📐 Architecture Standards

### Clean Architecture (ai-service)
```
domain/       → Pure business logic (NO framework deps)
application/  → Use cases, ports (NO framework deps)
infrastructure/ → Adapters (Spring, JPA, MongoDB, Redis, OpenAI)
api/          → REST controllers, DTOs, OpenAPI
bootstrap/    → Spring Boot main, configuration, wiring
```

### Hexagonal Ports & Adapters
- **Port (interface):** `LlmPort`, `VectorStorePort` (in application layer)
- **Adapter (impl):** `SpringAiLlmAdapter`, `PgVectorAdapter` (in infrastructure)

### Known Technical Debt
- **ADR-001:** JPA annotations present in `core-platform` domain layer
  - See: `core-plataform/adr/ADR-001-jpa-in-domain-technical-debt.md`
  - Remediation planned for next sprint

---

## 🛠️ Common Tasks

### Update Core Platform
```powershell
cd core-plataform
# Make changes...
.\mvnw clean install -DskipTests

# Now rebuild services to pick up changes
cd ..\iam-service && .\mvnw clean verify
cd ..\ai-service && .\mvnw.cmd clean verify
```

### Run Services Together
```powershell
# Terminal 1: IAM Service
cd iam-service && .\mvnw spring-boot:run

# Terminal 2: AI Service (after starting Postgres)
cd ai-service && .\scripts\dev-up.ps1 && .\scripts\dev-run.ps1
```

### Check for Outdated Dependencies
```powershell
cd core-plataform && .\mvnw versions:display-dependency-updates
cd iam-service && .\mvnw versions:display-dependency-updates
cd ai-service && .\mvnw.cmd versions:display-dependency-updates
```

---

## 📚 Documentation

- **IAM Service:** `iam-service/docs/README.md` (prompts, runbooks, ADRs)
- **AI Service:** `ai-service/README-DEV.md` (development guide)
- **Core Platform:** `core-plataform/adr/` (Architecture Decision Records)

---

## 🐛 Troubleshooting

### "Could not find artifact com.solveria:core-platform:jar"
→ Run `.\scripts\install-core.ps1` first

### "CannotGetJdbcConnectionException" (ai-service)
→ Start Postgres: `cd ai-service && .\scripts\dev-up.ps1`

### "Unsupported class file major version 65"
→ Ensure Java 21 is active: `java -version`

### Maven wrapper not found
→ Ensure you're using `mvnw` (Linux/Mac) or `mvnw.cmd` (Windows)

---

## ✅ Definition of Ready (Before Starting New Vertical)

- [ ] All 3 repos build successfully: `.\scripts\build-all.ps1`
- [ ] All tests pass: `.\scripts\test-all.ps1`
- [ ] ArchUnit tests validate architecture boundaries
- [ ] Services run locally and respond to health checks
- [ ] Docker Compose works for local dev dependencies
- [ ] `.env.example` files present with all required vars
- [ ] Swagger UI accessible for both services
- [ ] No hardcoded secrets in code (use `${ENV_VAR}`)

---

## 🤝 Contributing

1. Read conventions: `iam-service/docs/prompts/000-conventions.md`
2. Check runbooks: `iam-service/docs/runbooks/MASTER-RUNBOOK.md`
3. Follow branch strategy: `feature/<ticket>-<description>`
4. Run `.\scripts\test-all.ps1` before pushing
5. Document architectural decisions in ADRs

---

## 📞 Need Help?

- Check service-specific READMEs
- Review ADRs for past decisions
- See `iam-service/docs/runbooks/` for operational guides
