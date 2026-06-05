package com.ecomovilidad.infrastructure.persistence.repositories;

import com.ecomovilidad.domain.auditing.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface AuditLogJpaRepository extends JpaRepository<AuditLog, UUID> {
}
