package com.fintech.repository;

import com.fintech.model.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Page<Transaction> findByUserIdOrderByTimestampDesc(Long userId, Pageable pageable);

    List<Transaction> findByUserIdAndTimestampBetween(Long userId, LocalDateTime start, LocalDateTime end);

    List<Transaction> findByUserIdAndAnomalousTrue(Long userId);

    List<Transaction> findAllByAnomalousTrue();

    @Query("SELECT t.category, SUM(t.amount) FROM Transaction t WHERE t.user.id = :userId AND t.type = 'DEBIT' AND t.timestamp BETWEEN :start AND :end GROUP BY t.category")
    List<Object[]> getCategoryBreakdown(@Param("userId") Long userId,
                                        @Param("start") LocalDateTime start,
                                        @Param("end") LocalDateTime end);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user.id = :userId AND t.type = :type AND t.timestamp BETWEEN :start AND :end")
    BigDecimal sumAmountByUserIdAndTypeAndTimestampBetween(@Param("userId") Long userId,
                                                            @Param("type") Transaction.TransactionType type,
                                                            @Param("start") LocalDateTime start,
                                                            @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.user.id = :userId AND t.timestamp BETWEEN :start AND :end")
    Long countByUserIdAndTimestampBetween(@Param("userId") Long userId,
                                          @Param("start") LocalDateTime start,
                                          @Param("end") LocalDateTime end);

    Page<Transaction> findByUserIdAndCategoryOrderByTimestampDesc(Long userId, Transaction.Category category, Pageable pageable);

    Page<Transaction> findByUserIdAndTypeOrderByTimestampDesc(Long userId, Transaction.TransactionType type, Pageable pageable);
}
