package com.solveria.iamservice.api.rest;

import com.solveria.core.iam.domain.model.Role;
import com.solveria.core.iam.infrastructure.persistence.repository.RoleJpaRepository;
import com.solveria.iamservice.application.dto.CreateRoleRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/roles")
@Tag(name = "Roles", description = "Gestión de roles del sistema")
public class RoleController {

    private final RoleJpaRepository roleRepo;

    public RoleController(RoleJpaRepository roleRepo) {
        this.roleRepo = roleRepo;
    }

    record RoleResponse(Long id, String name, String description, String tenantId, int permissionCount) {}

    // ─── GET /api/v1/roles ── lista todos los roles ──────────────────

    @GetMapping
    @Operation(summary = "Lista todos los roles registrados")
    public ResponseEntity<List<RoleResponse>> listar() {
        var roles = roleRepo.findAll().stream()
                .map(r -> new RoleResponse(
                        r.getId(),
                        r.getName(),
                        r.getDescription(),
                        r.getTenantId(),
                        r.getPermissionIds() != null ? r.getPermissionIds().size() : 0
                ))
                .toList();
        return ResponseEntity.ok(roles);
    }

    // ─── POST /api/v1/roles ── crea un rol (idempotente por nombre) ──

    @PostMapping
    @Operation(summary = "Crea un rol nuevo (si ya existe devuelve el existente)")
    public ResponseEntity<RoleResponse> createRole(@Valid @RequestBody CreateRoleRequest request) {
        var existente = roleRepo.findAll().stream()
                .filter(r -> r.getName().equalsIgnoreCase(request.name()))
                .findFirst();

        if (existente.isPresent()) {
            var r = existente.get();
            return ResponseEntity.ok(new RoleResponse(
                    r.getId(), r.getName(), r.getDescription(), r.getTenantId(),
                    r.getPermissionIds() != null ? r.getPermissionIds().size() : 0));
        }

        var role = Role.create(request.name(), request.description());
        var saved = roleRepo.save(role);
        return ResponseEntity.status(HttpStatus.CREATED).body(new RoleResponse(
                saved.getId(), saved.getName(), saved.getDescription(), saved.getTenantId(), 0));
    }
}
