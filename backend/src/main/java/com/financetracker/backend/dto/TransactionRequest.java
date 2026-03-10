package com.financetracker.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.financetracker.backend.entity.TransactionType;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TransactionRequest(
        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
        BigDecimal amount,

        @NotNull(message = "Transaction type is required")
        TransactionType type,

        @Size(max = 500, message = "Description must be 500 characters or less")
        String description,

        @NotNull(message = "Date is required")
        LocalDate date,

        Long categoryId
) {}