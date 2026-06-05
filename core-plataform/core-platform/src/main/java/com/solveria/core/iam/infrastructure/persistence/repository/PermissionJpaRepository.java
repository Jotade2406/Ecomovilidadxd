package com.solveria.core.iam.infrastructure.persistence.repository;

import com.solveria.core.iam.domain.model.Permission;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PermissionJpaRepository extends JpaRepository<Permission, Long> {}
