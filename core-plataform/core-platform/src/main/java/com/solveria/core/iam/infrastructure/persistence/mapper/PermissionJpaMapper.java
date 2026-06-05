package com.solveria.core.iam.infrastructure.persistence.mapper;

import com.solveria.core.iam.domain.model.Permission;
import org.springframework.stereotype.Component;

@Component
public class PermissionJpaMapper {

    public Permission toDomain(Permission entity) {
        return entity;
    }

    public Permission toEntity(Permission domain) {
        return domain;
    }
}
