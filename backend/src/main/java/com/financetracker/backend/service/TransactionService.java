package com.financetracker.backend.service;

import java.io.PrintWriter;
import java.util.List;

import org.springframework.stereotype.Service;

import com.financetracker.backend.dto.TransactionRequest;
import com.financetracker.backend.dto.TransactionResponse;
import com.financetracker.backend.entity.Category;
import com.financetracker.backend.entity.Transaction;
import com.financetracker.backend.entity.User;
import com.financetracker.backend.exception.ResourceNotFoundException;
import com.financetracker.backend.repository.CategoryRepository;
import com.financetracker.backend.repository.TransactionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final AuthenticatedUserService authenticatedUserService;

    public List<TransactionResponse> getAllTransactions() {
        User user = authenticatedUserService.getCurrentUser();
        return transactionRepository.findAllByUserIdOrderByDateDescCreatedAtDesc(user.getId())
                .stream()
                .map(TransactionResponse::from)
                .toList();
    }

    public TransactionResponse createTransaction(TransactionRequest request) {
        User user = authenticatedUserService.getCurrentUser();

        Category category = null;
        if (request.categoryId() != null) {
            category = categoryRepository.findByIdAndUserId(request.categoryId(), user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + request.categoryId()));
        }

        Transaction transaction = Transaction.builder()
                .amount(request.amount())
                .type(request.type())
                .description(request.description())
                .date(request.date())
                .category(category)
                .user(user)
                .build();

        return TransactionResponse.from(transactionRepository.save(transaction));
    }

    public TransactionResponse updateTransaction(Long id, TransactionRequest request) {
        User user = authenticatedUserService.getCurrentUser();

        Transaction transaction = transactionRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found: " + id));

        Category category = null;
        if (request.categoryId() != null) {
            category = categoryRepository.findByIdAndUserId(request.categoryId(), user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + request.categoryId()));
        }

        transaction.setAmount(request.amount());
        transaction.setType(request.type());
        transaction.setDescription(request.description());
        transaction.setDate(request.date());
        transaction.setCategory(category);

        return TransactionResponse.from(transactionRepository.save(transaction));
    }

    public void deleteTransaction(Long id) {
        User user = authenticatedUserService.getCurrentUser();
        Transaction transaction = transactionRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found: " + id));
        transactionRepository.delete(transaction);
    }

    public void exportToCsv(PrintWriter writer) {
        User user = authenticatedUserService.getCurrentUser();
        List<Transaction> transactions =
                transactionRepository.findAllByUserIdOrderByDateDescCreatedAtDesc(user.getId());

        writer.println("id,date,type,amount,category,description");
        for (Transaction t : transactions) {
            writer.printf("%d,%s,%s,%s,%s,%s%n",
                    t.getId(),
                    t.getDate(),
                    t.getType(),
                    t.getAmount(),
                    t.getCategory() != null ? t.getCategory().getName() : "",
                    t.getDescription() != null ? t.getDescription().replace(",", ";") : ""
            );
        }
    }
}