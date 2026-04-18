package com.fintech.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;

@Entity
@Table(name = "monthly_reports", indexes = {
    @Index(name = "idx_report_user_month", columnList = "user_id, report_month", unique = true)
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonthlyReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "report_month", nullable = false)
    private String reportMonth; // Format: "2026-03"

    @Column(name = "total_income", precision = 12, scale = 2)
    private BigDecimal totalIncome;

    @Column(name = "total_spend", precision = 12, scale = 2)
    private BigDecimal totalSpend;

    @Column(name = "net_savings", precision = 12, scale = 2)
    private BigDecimal netSavings;

    @Column(name = "total_transactions")
    private Integer totalTransactions;

    @Column(name = "anomaly_count")
    private Integer anomalyCount;

    @Column(name = "category_breakdown", columnDefinition = "TEXT")
    private String categoryBreakdown; // JSON string

    @Column(name = "ai_insights", columnDefinition = "TEXT")
    private String aiInsights; // AI-generated paragraph

    @Column(name = "generated_at")
    private LocalDateTime generatedAt;

    @PrePersist
    protected void onCreate() {
        generatedAt = LocalDateTime.now();
    }
}
