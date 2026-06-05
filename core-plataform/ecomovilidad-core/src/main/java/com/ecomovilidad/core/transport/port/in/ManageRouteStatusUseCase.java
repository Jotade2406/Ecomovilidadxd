package com.ecomovilidad.core.transport.port.in;

import com.ecomovilidad.core.shared.domain.TenantId;
import com.ecomovilidad.core.transport.domain.model.Route;
import com.ecomovilidad.core.transport.domain.vo.RouteId;

public interface ManageRouteStatusUseCase {

    record ActivateCommand(RouteId routeId, TenantId tenantId) {}
    record SuspendCommand(RouteId routeId, TenantId tenantId) {}
    record FinalizeCommand(RouteId routeId, TenantId tenantId) {}

    Route activate(ActivateCommand command);
    Route suspend(SuspendCommand command);
    Route finalize_(FinalizeCommand command);
}
