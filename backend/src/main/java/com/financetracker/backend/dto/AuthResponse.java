package com.financetracker.backend.dto;

public record AuthResponse(
        String token,
        String email,
        String fullName
) {}