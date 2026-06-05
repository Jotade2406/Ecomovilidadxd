package com.ecomovilidad.application.tenants;

import com.ecomovilidad.domain.tenants.Tenant;
import com.ecomovilidad.infrastructure.persistence.repositories.TenantJpaRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class TenantService {

    private final TenantJpaRepository repo;

    @PersistenceContext
    private EntityManager em;

    public TenantService(TenantJpaRepository repo) {
        this.repo = repo;
    }

    public Tenant crear(String nombre) {
        return repo.save(Tenant.crear(nombre));
    }

    public List<Tenant> listar() {
        return repo.findAll();
    }

    public Optional<Tenant> findById(UUID id) {
        return repo.findById(id);
    }

    public boolean existsByNombre(String nombre) {
        return repo.findByNombreIgnoreCase(nombre.trim()).isPresent();
    }

    @Transactional
    public void eliminar(UUID id) {
        em.createNativeQuery("DELETE FROM public.tenants WHERE id = :id")
                .setParameter("id", id)
                .executeUpdate();
    }
}
