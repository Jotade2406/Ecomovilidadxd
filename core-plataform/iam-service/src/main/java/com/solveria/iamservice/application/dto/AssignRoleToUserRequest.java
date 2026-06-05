package com.solveria.iamservice.application.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record AssignRoleToUserRequest(
        @NotBlank(message = "{validation.user.email.required}")
                @Email(message = "{validation.user.email.invalid}")
                String userEmail,
        String notes) {}
