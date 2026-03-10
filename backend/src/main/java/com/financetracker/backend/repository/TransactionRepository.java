package com.financetracker.backend.repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.financetracker.backend.entity.Transaction;
import com.financetracker.backend.entity.TransactionType;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findAllByUserIdOrderByDateDescCreatedAtDesc(Long userId);

    Optional<Transaction> findByIdAndUserId(Long id, Long userId);

    List<Transaction> findAllByUserIdAndDateBetweenOrderByDateDesc(
            Long userId, LocalDate from, LocalDate to);

    @Query("""
        SELECT COALESCE(SUM(t.amount), 0)
        FROM Transaction t
        WHERE t.user.id = :userId
          AND t.type = :type
          AND YEAR(t.date) = :year
          AND MONTH(t.date) = :month
    """)
    BigDecimal sumByUserIdAndTypeAndYearAndMonth(
            @Param("userId") Long userId,
            @Param("type") TransactionType type,
            @Param("year") int year,
            @Param("month") int month);

    @Query("""
        SELECT COALESCE(SUM(t.amount), 0)
        FROM Transaction t
        WHERE t.user.id = :userId
          AND t.type = 'EXPENSE'
          AND t.category.id = :categoryId
          AND YEAR(t.date) = :year
          AND MONTH(t.date) = :month
    """)
    BigDecimal sumExpenseByUserIdAndCategoryAndYearAndMonth(
            @Param("userId") Long userId,
            @Param("categoryId") Long categoryId,
            @Param("year") int year,
            @Param("month") int month);
}