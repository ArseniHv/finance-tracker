package com.financetracker.backend.dto;

import java.math.BigDecimal;

import com.financetracker.backend.entity.Budget;

public record BudgetResponse(
        Long id,
        BigDecimal amount,
        BigDecimal spent,
        Integer month,
        Integer year,
        CategoryResponse category
) {
    public static BudgetResponse from(Budget budget, BigDecimal spent) {
        return new BudgetResponse(
                budget.getId(),
                budget.getAmount(),
                spent,
                budget.getMonth(),
                budget.getYear(),
                CategoryResponse.from(budget.getCategory())
        );
    }
}