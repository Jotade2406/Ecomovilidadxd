package com.solveria.core.iam.infrastructure.persistence.mapper;

import com.solveria.core.iam.domain.model.Role;
import org.springframework.stereotype.Component;

@Component
public class RoleJpaMapper {

    public Role toDomain(Role entity) {
        return entity;
    }

    public Role toEntity(Role domain) {
        return domain;
    }
}
