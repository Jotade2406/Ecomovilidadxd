package com.solveria.core.iam.infrastructure.persistence.adapter;

import com.solveria.core.iam.application.port.RoleRepositoryPort;
import com.solveria.core.iam.domain.model.Role;
import com.solveria.core.iam.infrastructure.persistence.mapper.RoleJpaMapper;
import com.solveria.core.iam.infrastructure.persistence.repository.RoleJpaRepository;
import java.util.Optional;

public class RoleRepositoryAdapter implements RoleRepositoryPort {

    private final RoleJpaRepository roleJpaRepository;
    private final RoleJpaMapper roleJpaMapper;

    public RoleRepositoryAdapter(RoleJpaRepository roleJpaRepository, RoleJpaMapper roleJpaMapper) {
        this.roleJpaRepository = roleJpaRepository;
        this.roleJpaMapper = roleJpaMapper;
    }

    @Override
    public Optional<Role> findById(Long id) {
        return roleJpaRepository.findById(id).map(roleJpaMapper::toDomain);
    }

    @Override
    public Role save(Role role) {
        return roleJpaRepository.save(roleJpaMapper.toEntity(role));
    }

    @Override
    public boolean existsByName(String name) {
        return roleJpaRepository.existsByName(name);
    }
}
