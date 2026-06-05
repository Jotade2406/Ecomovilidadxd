package com.solveria.iamservice.application.orchestration;

import com.solveria.iamservice.application.dto.AssignRoleToUserRequest;
import com.solveria.iamservice.application.dto.TenantRoleResponse;
import com.solveria.iamservice.infrastructure.persistence.entity.TenantUserRoleAssignment;
import com.solveria.iamservice.infrastructure.persistence.repository.TenantUserRoleAssignmentJpaRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ManageTenantRolesOrchestrator {

    private static final Logger log = LoggerFactory.getLogger(ManageTenantRolesOrchestrator.class);

    private final TenantUserRoleAssignmentJpaRepository assignmentRepository;

    public ManageTenantRolesOrchestrator(
            TenantUserRoleAssignmentJpaRepository assignmentRepository) {
        this.assignmentRepository = assignmentRepository;
    }

    @Transactional(readOnly = true)
    public List<TenantRoleResponse> listAssignmentsForTenant(String tenantId) {
        log.info("event=IAM_LIST_TENANT_ROLES tenantId={}", tenantId);
        return assignmentRepository.findByTenantIdAndActiveTrue(tenantId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TenantRoleResponse> listAssignmentsForUser(String tenantId, String userEmail) {
        log.info("event=IAM_LIST_USER_ROLES tenantId={} userEmail={}", tenantId, userEmail);
        return assignmentRepository
                .findByTenantIdAndUserEmailAndActiveTrue(tenantId, userEmail)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public TenantRoleResponse assignRole(
            String tenantId, String roleName, AssignRoleToUserRequest request, String assignedBy) {
        log.info(
                "event=IAM_ASSIGN_ROLE tenantId={} roleName={} userEmail={}",
                tenantId,
                roleName,
                request.userEmail());

        var existing =
                assignmentRepository.findByTenantIdAndUserEmailAndRoleName(
                        tenantId, request.userEmail(), roleName);

        if (existing.isPresent() && existing.get().isActive()) {
            return toResponse(existing.get());
        }

        var assignment =
                TenantUserRoleAssignment.crear(
                        tenantId, request.userEmail(), roleName, assignedBy, request.notes());
        assignmentRepository.save(assignment);

        log.info("event=IAM_ASSIGN_ROLE_SUCCESS assignmentId={}", assignment.getId());
        return toResponse(assignment);
    }

    public void revokeRole(String tenantId, String roleName, String userEmail) {
        log.info(
                "event=IAM_REVOKE_ROLE tenantId={} roleName={} userEmail={}",
                tenantId,
                roleName,
                userEmail);

        assignmentRepository
                .findByTenantIdAndUserEmailAndRoleName(tenantId, userEmail, roleName)
                .ifPresent(
                        a -> {
                            a.revocar();
                            assignmentRepository.save(a);
                            log.info("event=IAM_REVOKE_ROLE_SUCCESS assignmentId={}", a.getId());
                        });
    }

    private TenantRoleResponse toResponse(TenantUserRoleAssignment a) {
        return new TenantRoleResponse(
                a.getId(),
                a.getTenantId(),
                a.getUserEmail(),
                a.getRoleName(),
                a.getAssignedBy(),
                a.getAssignedAt(),
                a.getRevokedAt(),
                a.getNotes(),
                a.isActive());
    }
}
