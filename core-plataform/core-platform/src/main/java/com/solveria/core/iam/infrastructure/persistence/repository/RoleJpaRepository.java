package com.solveria.core.iam.infrastructure.persistence.repository;

import com.solveria.core.iam.domain.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleJpaRepository extends JpaRepository<Role, Long> {

    boolean existsByName(String name);
}
