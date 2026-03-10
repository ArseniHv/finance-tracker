package com.financetracker.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.financetracker.backend.entity.Transaction;
import com.financetracker.backend.entity.TransactionType;

public record TransactionResponse(
        Long id,
        BigDecimal amount,
        TransactionType type,
        String description,
        LocalDate date,
        CategoryResponse category
) {
    public static TransactionResponse from(Transaction transaction) {
        return new TransactionResponse(
                transaction.getId(),
                transaction.getAmount(),
                transaction.getType(),
                transaction.getDescription(),
                transaction.getDate(),
                transaction.getCategory() != null
                        ? CategoryResponse.from(transaction.getCategory())
                        : null
        );
    }
}