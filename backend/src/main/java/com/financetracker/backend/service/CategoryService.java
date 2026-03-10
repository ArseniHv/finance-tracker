package com.financetracker.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.financetracker.backend.dto.CategoryRequest;
import com.financetracker.backend.dto.CategoryResponse;
import com.financetracker.backend.entity.Category;
import com.financetracker.backend.entity.User;
import com.financetracker.backend.exception.DuplicateResourceException;
import com.financetracker.backend.exception.ResourceNotFoundException;
import com.financetracker.backend.repository.CategoryRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final AuthenticatedUserService authenticatedUserService;

    public List<CategoryResponse> getAllCategories() {
        User user = authenticatedUserService.getCurrentUser();
        return categoryRepository.findAllByUserIdOrderByNameAsc(user.getId())
                .stream()
                .map(CategoryResponse::from)
                .toList();
    }

    public CategoryResponse createCategory(CategoryRequest request) {
        User user = authenticatedUserService.getCurrentUser();

        if (categoryRepository.existsByNameAndUserId(request.name(), user.getId())) {
            throw new DuplicateResourceException("Category already exists: " + request.name());
        }

        Category category = Category.builder()
                .name(request.name())
                .color(request.color() != null ? request.color() : "#6366f1")
                .icon(request.icon())
                .user(user)
                .build();

        return CategoryResponse.from(categoryRepository.save(category));
    }

    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        User user = authenticatedUserService.getCurrentUser();

        Category category = categoryRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + id));

        category.setName(request.name());
        if (request.color() != null) category.setColor(request.color());
        if (request.icon() != null) category.setIcon(request.icon());

        return CategoryResponse.from(categoryRepository.save(category));
    }

    public void deleteCategory(Long id) {
        User user = authenticatedUserService.getCurrentUser();
        Category category = categoryRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + id));
        categoryRepository.delete(category);
    }
}