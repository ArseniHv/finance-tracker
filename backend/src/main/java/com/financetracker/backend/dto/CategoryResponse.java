package com.financetracker.backend.dto;

import com.financetracker.backend.entity.Category;

public record CategoryResponse(
        Long id,
        String name,
        String color,
        String icon
) {
    public static CategoryResponse from(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getColor(),
                category.getIcon()
        );
    }
}