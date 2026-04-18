package com.fintech.dto;

import com.fintech.model.Transaction;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

public class TransactionDtos {

    @Data
    public static class CreateTransactionRequest {
        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
        private BigDecimal amount;

        @NotBlank(message = "Merchant name is required")
        private String merchant;

        private String description;

        @NotNull(message = "Transaction type is required")
        private Transaction.TransactionType type;

        private LocalDateTime timestamp;
    }

    @Data
    @lombok.AllArgsConstructor
    @lombok.NoArgsConstructor
    @lombok.Builder
    public static class TransactionResponse {
        private Long id;
        private BigDecimal amount;
        private String merchant;
        private String description;
        private Transaction.Category category;
        private Transaction.TransactionType type;
        private LocalDateTime timestamp;
        private boolean anomalous;
        private String anomalyReason;
        private Transaction.AnomalySeverity anomalySeverity;
    }

    @Data
    @lombok.AllArgsConstructor
    @lombok.NoArgsConstructor
    public static class TransactionSummary {
        private BigDecimal totalIncome;
        private BigDecimal totalExpenses;
        private BigDecimal netBalance;
        private int totalTransactions;
        private int anomalyCount;
        private Map<String, BigDecimal> categoryBreakdown;
    }
}
