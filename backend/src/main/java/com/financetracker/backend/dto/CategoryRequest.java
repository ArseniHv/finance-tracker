package com.financetracker.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CategoryRequest(
        @NotBlank(message = "Category name is required")
        @Size(max = 100, message = "Name must be 100 characters or less")
        String name,

        @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Color must be a valid hex code e.g. #6366f1")
        String color,

        String icon
) {}