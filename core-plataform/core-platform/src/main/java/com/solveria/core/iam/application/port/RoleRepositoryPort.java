package com.solveria.core.iam.application.port;

import com.solveria.core.iam.domain.model.Role;
import java.util.Optional;

public interface RoleRepositoryPort {

    Optional<Role> findById(Long id);

    Role save(Role role);

    boolean existsByName(String name);
}
