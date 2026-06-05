package com.ecomovilidad.api;

import com.ecomovilidad.application.tenants.TenantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/Tenants")
@Tag(name = "Tenants", description = "Instituciones registradas (multi-tenancy)")
public class TenantController {

    private final TenantService tenantService;

    public TenantController(TenantService tenantService) {
        this.tenantService = tenantService;
    }

    @GetMapping
    @Operation(summary = "Lista todas las instituciones activas (público — usado en registro)")
    public ResponseEntity<List<Map<String, Object>>> listar() {
        var result = tenantService.listar().stream()
                .filter(t -> "Activo".equals(t.getEstado()))
                .map(t -> Map.<String, Object>of(
                        "id",     t.getId().toString(),
                        "nombre", t.getNombre(),
                        "codigo", t.getCodigo()
                ))
                .toList();
        return ResponseEntity.ok(result);
    }
}
