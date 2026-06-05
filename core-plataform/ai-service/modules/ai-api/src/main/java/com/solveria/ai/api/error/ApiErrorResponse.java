package com.solveria.ai.api.error;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;
import java.util.List;

/** Standard API error payload. */
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public record ApiErrorResponse(
        String errorCode, String message, String path, Instant timestamp, List<String> details) {}
