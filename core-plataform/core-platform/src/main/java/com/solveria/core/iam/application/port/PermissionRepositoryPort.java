package com.solveria.core.iam.application.port;

import com.solveria.core.iam.domain.model.Permission;
import java.util.Collection;
import java.util.List;

public interface PermissionRepositoryPort {

    List<Permission> findAllById(Collection<Long> ids);

    boolean existsById(Long id);
}
