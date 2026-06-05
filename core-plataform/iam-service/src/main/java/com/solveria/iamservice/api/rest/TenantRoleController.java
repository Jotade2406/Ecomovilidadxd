package com.solveria.iamservice.api.rest;

import com.solveria.iamservice.application.dto.AssignRoleToUserRequest;
import com.solveria.iamservice.application.dto.TenantRoleResponse;
import com.solveria.iamservice.application.orchestration.ManageTenantRolesOrchestrator;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/iam/tenants/{tenantId}/roles")
@Validated
@Tag(name = "Tenant Roles", description = "Tenant-scoped user role assignment management")
public class TenantRoleController {

    private static final Logger log = LoggerFactory.getLogger(TenantRoleController.class);

    private final ManageTenantRolesOrchestrator orchestrator;

    public TenantRoleController(ManageTenantRolesOrchestrator orchestrator) {
        this.orchestrator = orchestrator;
    }

    @GetMapping
    @Operation(summary = "List all active role assignments for a tenant")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Assignments retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<List<TenantRoleResponse>> listAssignments(@PathVariable String tenantId) {
        log.debug("event=IAM_LIST_TENANT_ROLES_HTTP tenantId={}", tenantId);
        return ResponseEntity.ok(orchestrator.listAssignmentsForTenant(tenantId));
    }

    @GetMapping("/users")
    @Operation(summary = "List active role assignments for a specific user in a tenant")
    public ResponseEntity<List<TenantRoleResponse>> listAssignmentsForUser(
            @PathVariable String tenantId, @RequestParam String userEmail) {
        log.debug("event=IAM_LIST_USER_ROLES_HTTP tenantId={} userEmail={}", tenantId, userEmail);
        return ResponseEntity.ok(orchestrator.listAssignmentsForUser(tenantId, userEmail));
    }

    @PostMapping("/{roleName}/users")
    @Operation(summary = "Assign a role to a user within a tenant")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Role assigned successfully"),
        @ApiResponse(responseCode = "400", description = "Validation error"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<TenantRoleResponse> assignRole(
            @PathVariable String tenantId,
            @PathVariable String roleName,
            @RequestBody @Valid AssignRoleToUserRequest request) {
        String assignedBy = getCurrentUsername();
        log.debug(
                "event=IAM_ASSIGN_ROLE_HTTP tenantId={} roleName={} userEmail={}",
                tenantId,
                roleName,
                request.userEmail());
        return ResponseEntity.ok(orchestrator.assignRole(tenantId, roleName, request, assignedBy));
    }

    @DeleteMapping("/{roleName}/users/{userEmail}")
    @Operation(summary = "Revoke a role from a user within a tenant")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Role revoked successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Void> revokeRole(
            @PathVariable String tenantId,
            @PathVariable String roleName,
            @PathVariable String userEmail) {
        log.debug(
                "event=IAM_REVOKE_ROLE_HTTP tenantId={} roleName={} userEmail={}",
                tenantId,
                roleName,
                userEmail);
        orchestrator.revokeRole(tenantId, roleName, userEmail);
        return ResponseEntity.noContent().build();
    }

    private String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null ? auth.getName() : "system";
    }
}
