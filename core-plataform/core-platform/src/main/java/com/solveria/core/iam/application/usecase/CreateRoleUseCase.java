package com.solveria.core.iam.application.usecase;

import com.solveria.core.iam.application.port.RoleRepositoryPort;
import com.solveria.core.iam.domain.model.Role;
import com.solveria.core.shared.exceptions.BusinessRuleViolationException;

public class CreateRoleUseCase {

    private final RoleRepositoryPort roleRepositoryPort;

    public CreateRoleUseCase(RoleRepositoryPort roleRepositoryPort) {
        this.roleRepositoryPort = roleRepositoryPort;
    }

    public Role execute(String name, String description) {
        if (roleRepositoryPort.existsByName(name)) {
            throw new BusinessRuleViolationException(
                    "ROLE_ALREADY_EXISTS", "Role already exists with name: " + name);
        }
        Role role = Role.create(name, description);
        return roleRepositoryPort.save(role);
    }
}
