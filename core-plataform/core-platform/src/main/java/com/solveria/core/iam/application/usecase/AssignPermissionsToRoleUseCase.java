package com.solveria.core.iam.application.usecase;

import com.solveria.core.iam.application.command.AssignPermissionsToRoleCommand;
import com.solveria.core.iam.application.port.PermissionRepositoryPort;
import com.solveria.core.iam.application.port.RoleRepositoryPort;
import com.solveria.core.iam.domain.model.Permission;
import com.solveria.core.iam.domain.model.Role;
import com.solveria.core.shared.exceptions.EntityNotFoundException;
import java.util.List;

public class AssignPermissionsToRoleUseCase {

    private final RoleRepositoryPort roleRepositoryPort;
    private final PermissionRepositoryPort permissionRepositoryPort;

    public AssignPermissionsToRoleUseCase(
            RoleRepositoryPort roleRepositoryPort,
            PermissionRepositoryPort permissionRepositoryPort) {
        this.roleRepositoryPort = roleRepositoryPort;
        this.permissionRepositoryPort = permissionRepositoryPort;
    }

    public Role execute(AssignPermissionsToRoleCommand command) {
        Role role =
                roleRepositoryPort
                        .findById(command.getRoleId())
                        .orElseThrow(
                                () ->
                                        new EntityNotFoundException(
                                                "ROLE_NOT_FOUND",
                                                "Role not found with id: " + command.getRoleId()));

        List<Permission> permissions =
                permissionRepositoryPort.findAllById(command.getPermissionIds());

        if (permissions.size() != command.getPermissionIds().size()) {
            throw new EntityNotFoundException(
                    "PERMISSION_NOT_FOUND", "One or more permissions not found");
        }

        role.setPermissionIds(command.getPermissionIds());
        return roleRepositoryPort.save(role);
    }
}
