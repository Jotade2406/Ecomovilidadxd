package com.solveria.core.iam.infrastructure.persistence.adapter;

import com.solveria.core.iam.application.port.PermissionRepositoryPort;
import com.solveria.core.iam.domain.model.Permission;
import com.solveria.core.iam.infrastructure.persistence.mapper.PermissionJpaMapper;
import com.solveria.core.iam.infrastructure.persistence.repository.PermissionJpaRepository;
import java.util.Collection;
import java.util.List;

public class PermissionRepositoryAdapter implements PermissionRepositoryPort {

    private final PermissionJpaRepository permissionJpaRepository;
    private final PermissionJpaMapper permissionJpaMapper;

    public PermissionRepositoryAdapter(
            PermissionJpaRepository permissionJpaRepository,
            PermissionJpaMapper permissionJpaMapper) {
        this.permissionJpaRepository = permissionJpaRepository;
        this.permissionJpaMapper = permissionJpaMapper;
    }

    @Override
    public List<Permission> findAllById(Collection<Long> ids) {
        return permissionJpaRepository.findAllById(ids).stream()
                .map(permissionJpaMapper::toDomain)
                .toList();
    }

    @Override
    public boolean existsById(Long id) {
        return permissionJpaRepository.existsById(id);
    }
}
