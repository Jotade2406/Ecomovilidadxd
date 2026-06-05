package com.solveria.core.iam.application.command;

import java.util.Collection;

public class AssignPermissionsToRoleCommand {

    private final Long roleId;
    private final Collection<Long> permissionIds;

    public AssignPermissionsToRoleCommand(Long roleId, Collection<Long> permissionIds) {
        this.roleId = roleId;
        this.permissionIds = permissionIds;
    }

    public Long getRoleId() { return roleId; }
    public Collection<Long> getPermissionIds() { return permissionIds; }
}
