package com.financetracker.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.financetracker.backend.dto.BudgetRequest;
import com.financetracker.backend.dto.BudgetResponse;
import com.financetracker.backend.service.BudgetService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping
    public ResponseEntity<List<BudgetResponse>> getBudgets(
            @RequestParam Integer month,
            @RequestParam Integer year) {
        return ResponseEntity.ok(budgetService.getBudgets(month, year));
    }

    @PostMapping
    public ResponseEntity<BudgetResponse> create(@Valid @RequestBody BudgetRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(budgetService.createBudget(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BudgetResponse> update(@PathVariable Long id,
                                                   @Valid @RequestBody BudgetRequest request) {
        return ResponseEntity.ok(budgetService.updateBudget(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        budgetService.deleteBudget(id);
        return ResponseEntity.noContent().build();
    }
}