package com.solveria.iamservice.infrastructure.persistence.repository;

import com.solveria.iamservice.infrastructure.persistence.entity.TenantUserRoleAssignment;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TenantUserRoleAssignmentJpaRepository
        extends JpaRepository<TenantUserRoleAssignment, UUID> {

    List<TenantUserRoleAssignment> findByTenantIdAndActiveTrue(String tenantId);

    List<TenantUserRoleAssignment> findByTenantIdAndUserEmailAndActiveTrue(
            String tenantId, String userEmail);

    Optional<TenantUserRoleAssignment> findByTenantIdAndUserEmailAndRoleName(
            String tenantId, String userEmail, String roleName);
}
