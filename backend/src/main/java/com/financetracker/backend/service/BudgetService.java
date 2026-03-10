package com.financetracker.backend.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;

import com.financetracker.backend.dto.BudgetRequest;
import com.financetracker.backend.dto.BudgetResponse;
import com.financetracker.backend.entity.Budget;
import com.financetracker.backend.entity.Category;
import com.financetracker.backend.entity.User;
import com.financetracker.backend.exception.DuplicateResourceException;
import com.financetracker.backend.exception.ResourceNotFoundException;
import com.financetracker.backend.repository.BudgetRepository;
import com.financetracker.backend.repository.CategoryRepository;
import com.financetracker.backend.repository.TransactionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    private final AuthenticatedUserService authenticatedUserService;

    public List<BudgetResponse> getBudgets(Integer month, Integer year) {
        User user = authenticatedUserService.getCurrentUser();
        return budgetRepository.findAllByUserIdAndMonthAndYear(user.getId(), month, year)
                .stream()
                .map(budget -> {
                    BigDecimal spent = transactionRepository
                            .sumExpenseByUserIdAndCategoryAndYearAndMonth(
                                    user.getId(), budget.getCategory().getId(), year, month);
                    return BudgetResponse.from(budget, spent);
                })
                .toList();
    }

    public BudgetResponse createBudget(BudgetRequest request) {
        User user = authenticatedUserService.getCurrentUser();

        Category category = categoryRepository.findByIdAndUserId(request.categoryId(), user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + request.categoryId()));

        if (budgetRepository.findByUserIdAndCategoryIdAndMonthAndYear(
                user.getId(), request.categoryId(), request.month(), request.year()).isPresent()) {
            throw new DuplicateResourceException("Budget already exists for this category and month");
        }

        Budget budget = Budget.builder()
                .amount(request.amount())
                .month(request.month())
                .year(request.year())
                .category(category)
                .user(user)
                .build();

        BigDecimal spent = transactionRepository.sumExpenseByUserIdAndCategoryAndYearAndMonth(
                user.getId(), category.getId(), request.year(), request.month());

        return BudgetResponse.from(budgetRepository.save(budget), spent);
    }

    public BudgetResponse updateBudget(Long id, BudgetRequest request) {
        User user = authenticatedUserService.getCurrentUser();

        Budget budget = budgetRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found: " + id));

        budget.setAmount(request.amount());

        BigDecimal spent = transactionRepository.sumExpenseByUserIdAndCategoryAndYearAndMonth(
                user.getId(), budget.getCategory().getId(), budget.getYear(), budget.getMonth());

        return BudgetResponse.from(budgetRepository.save(budget), spent);
    }

    public void deleteBudget(Long id) {
        User user = authenticatedUserService.getCurrentUser();
        Budget budget = budgetRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found: " + id));
        budgetRepository.delete(budget);
    }
}