package com.ecomovilidad.core.servicerequests.domain.vo;

import java.util.Objects;
import java.util.UUID;

public record RequestId(UUID value) {

    public RequestId {
        Objects.requireNonNull(value, "RequestId no puede ser nulo");
    }

    public static RequestId newId() { return new RequestId(UUID.randomUUID()); }
    public static RequestId of(UUID uuid) { return new RequestId(uuid); }
    public static RequestId of(String uuid) { return new RequestId(UUID.fromString(uuid)); }

    @Override
    public String toString() { return value.toString(); }
}
