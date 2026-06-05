package com.ecomovilidad.api;

import com.ecomovilidad.application.pagos.dtos.CrearPagoRequest;
import com.ecomovilidad.application.pagos.dtos.PagoResponse;
import com.ecomovilidad.application.pagos.dtos.RegistrarPagoRequest;
import com.ecomovilidad.application.pagos.services.PagoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/Pagos")
@Tag(name = "Pagos", description = "Gestión de pagos de planes mensuales y anuales")
@SecurityRequirement(name = "Bearer")
@ApiResponse(responseCode = "401", description = "No autorizado (Token faltante o inválido)")
public class PagosController {

    private final PagoService pagoService;

    public PagosController(PagoService pagoService) {
        this.pagoService = pagoService;
    }

    @PostMapping
    @Operation(summary = "Crea un nuevo pago pendiente para un estudiante")
    @ApiResponse(responseCode = "201", description = "Pago creado correctamente")
    public ResponseEntity<PagoResponse> crear(@RequestBody CrearPagoRequest request) {
        var response = pagoService.crear(request);
        return ResponseEntity.created(URI.create("/api/Pagos/" + response.id())).body(response);
    }

    @GetMapping
    @Operation(summary = "Lista todos los pagos del tenant")
    public ResponseEntity<List<PagoResponse>> obtenerTodos() {
        return ResponseEntity.ok(pagoService.obtenerTodos());
    }

    @GetMapping("/pendientes")
    @Operation(summary = "Lista solo los pagos pendientes del tenant")
    public ResponseEntity<List<PagoResponse>> obtenerPendientes() {
        return ResponseEntity.ok(pagoService.obtenerPendientes());
    }

    @GetMapping("/estudiante/{estudianteId}")
    @Operation(summary = "Lista el historial de pagos de un estudiante")
    public ResponseEntity<List<PagoResponse>> obtenerPorEstudiante(@PathVariable UUID estudianteId) {
        return ResponseEntity.ok(pagoService.obtenerPorEstudiante(estudianteId));
    }

    @PatchMapping("/{id}/confirmar")
    @Operation(summary = "Confirma el pago de un recibo pendiente")
    public ResponseEntity<PagoResponse> confirmar(@PathVariable UUID id,
                                                   @RequestBody RegistrarPagoRequest request) {
        return ResponseEntity.ok(pagoService.confirmarPago(id, request));
    }

    @PatchMapping("/{id}/vencer")
    @Operation(summary = "Marca un pago pendiente como vencido")
    public ResponseEntity<PagoResponse> marcarVencido(@PathVariable UUID id) {
        return ResponseEntity.ok(pagoService.marcarVencido(id));
    }
}
