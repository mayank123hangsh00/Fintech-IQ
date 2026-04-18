package com.fintech.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions", indexes = {
    @Index(name = "idx_transaction_user_id", columnList = "user_id"),
    @Index(name = "idx_transaction_timestamp", columnList = "timestamp")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private String merchant;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Category category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "is_anomalous")
    @Builder.Default
    private boolean anomalous = false;

    @Column(name = "anomaly_reason")
    private String anomalyReason;

    @Enumerated(EnumType.STRING)
    @Column(name = "anomaly_severity")
    private AnomalySeverity anomalySeverity;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (timestamp == null) timestamp = LocalDateTime.now();
    }

    public enum Category {
        FOOD, TRANSPORT, SHOPPING, UTILITIES, ENTERTAINMENT, HEALTH, SALARY, INVESTMENT, OTHER
    }

    public enum TransactionType {
        CREDIT, DEBIT
    }

    public enum AnomalySeverity {
        LOW, MEDIUM, HIGH
    }
}
