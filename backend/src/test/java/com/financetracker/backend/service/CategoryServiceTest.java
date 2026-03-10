package com.financetracker.backend.service;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.financetracker.backend.dto.CategoryRequest;
import com.financetracker.backend.dto.CategoryResponse;
import com.financetracker.backend.entity.Category;
import com.financetracker.backend.entity.User;
import com.financetracker.backend.exception.DuplicateResourceException;
import com.financetracker.backend.repository.CategoryRepository;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock private CategoryRepository categoryRepository;
    @Mock private AuthenticatedUserService authenticatedUserService;

    @InjectMocks private CategoryService categoryService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder().id(1L).email("test@example.com").fullName("Test User").build();
    }

    @Test
    void getAllCategories_returnsUserCategories() {
        Category category = Category.builder().id(1L).name("Food").color("#ff0000").user(testUser).build();
        when(authenticatedUserService.getCurrentUser()).thenReturn(testUser);
        when(categoryRepository.findAllByUserIdOrderByNameAsc(1L)).thenReturn(List.of(category));

        List<CategoryResponse> result = categoryService.getAllCategories();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).name()).isEqualTo("Food");
    }

    @Test
    void createCategory_success() {
        CategoryRequest request = new CategoryRequest("Food", "#ff0000", "🍔");
        Category saved = Category.builder().id(1L).name("Food").color("#ff0000").icon("🍔").user(testUser).build();

        when(authenticatedUserService.getCurrentUser()).thenReturn(testUser);
        when(categoryRepository.existsByNameAndUserId("Food", 1L)).thenReturn(false);
        when(categoryRepository.save(any())).thenReturn(saved);

        CategoryResponse result = categoryService.createCategory(request);

        assertThat(result.name()).isEqualTo("Food");
        assertThat(result.color()).isEqualTo("#ff0000");
    }

    @Test
    void createCategory_throwsOnDuplicate() {
        CategoryRequest request = new CategoryRequest("Food", "#ff0000", null);
        when(authenticatedUserService.getCurrentUser()).thenReturn(testUser);
        when(categoryRepository.existsByNameAndUserId("Food", 1L)).thenReturn(true);

        assertThatThrownBy(() -> categoryService.createCategory(request))
                .isInstanceOf(DuplicateResourceException.class);
    }

    @Test
    void deleteCategory_throwsWhenNotFound() {
        when(authenticatedUserService.getCurrentUser()).thenReturn(testUser);
        when(categoryRepository.findByIdAndUserId(99L, 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> categoryService.deleteCategory(99L))
                .isInstanceOf(com.financetracker.backend.exception.ResourceNotFoundException.class);
    }
}