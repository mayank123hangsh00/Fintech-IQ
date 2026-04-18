package com.fintech.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fintech.model.MonthlyReport;
import com.fintech.model.Transaction;
import com.fintech.model.User;
import com.fintech.repository.MonthlyReportRepository;
import com.fintech.repository.TransactionRepository;
import com.fintech.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ReportService {

    private static final Logger log = LoggerFactory.getLogger(ReportService.class);
    private static final DateTimeFormatter MONTH_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM");

    @Autowired
    private MonthlyReportRepository reportRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AiService aiService;

    @Autowired
    private SseService sseService;

    @Autowired
    private ObjectMapper objectMapper;

    public MonthlyReport getOrGenerateReport(String userEmail, String month) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<MonthlyReport> existing = reportRepository.findByUserIdAndReportMonth(user.getId(), month);
        if (existing.isPresent()) {
            return existing.get();
        }

        return generateReport(user, month);
    }

    public List<MonthlyReport> getUserReports(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return reportRepository.findByUserIdOrderByReportMonthDesc(user.getId());
    }

    @Transactional
    public MonthlyReport generateReport(User user, String month) {
        YearMonth yearMonth = YearMonth.parse(month);
        LocalDateTime start = yearMonth.atDay(1).atStartOfDay();
        LocalDateTime end = yearMonth.atEndOfMonth().atTime(23, 59, 59);

        List<Transaction> transactions = transactionRepository
                .findByUserIdAndTimestampBetween(user.getId(), start, end);

        BigDecimal income = transactions.stream()
                .filter(t -> t.getType() == Transaction.TransactionType.CREDIT)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal spend = transactions.stream()
                .filter(t -> t.getType() == Transaction.TransactionType.DEBIT)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal savings = income.subtract(spend);
        int anomalyCount = (int) transactions.stream().filter(Transaction::isAnomalous).count();

        // Category breakdown for debits
        Map<String, BigDecimal> categoryBreakdown = new HashMap<>();
        transactions.stream()
                .filter(t -> t.getType() == Transaction.TransactionType.DEBIT)
                .forEach(t -> categoryBreakdown.merge(
                        t.getCategory().name(), t.getAmount(), BigDecimal::add));

        // Generate AI insights
        String aiInsights = aiService.generateMonthlyInsights(
                month, income, spend, savings, categoryBreakdown, anomalyCount);

        // Serialize category breakdown to JSON
        String categoryJson;
        try {
            categoryJson = objectMapper.writeValueAsString(categoryBreakdown);
        } catch (JsonProcessingException e) {
            categoryJson = "{}";
        }

        MonthlyReport report = MonthlyReport.builder()
                .user(user)
                .reportMonth(month)
                .totalIncome(income)
                .totalSpend(spend)
                .netSavings(savings)
                .totalTransactions(transactions.size())
                .anomalyCount(anomalyCount)
                .categoryBreakdown(categoryJson)
                .aiInsights(aiInsights)
                .build();

        report = reportRepository.save(report);

        // Push SSE notification
        sseService.pushNotification(user.getEmail(), Map.of(
            "type", "REPORT_READY",
            "message", "📊 Your " + month + " financial report is ready!",
            "reportId", report.getId().toString()
        ));

        log.info("Generated report for user {} for month {}", user.getEmail(), month);
        return report;
    }

    @Transactional
    public void generateAllUserReportsForMonth(String month) {
        List<User> users = userRepository.findAll();
        log.info("Generating monthly reports for {} users for month {}", users.size(), month);
        for (User user : users) {
            try {
                Optional<MonthlyReport> existing = reportRepository
                        .findByUserIdAndReportMonth(user.getId(), month);
                if (existing.isEmpty()) {
                    generateReport(user, month);
                }
            } catch (Exception e) {
                log.error("Failed to generate report for user {}: {}", user.getEmail(), e.getMessage());
            }
        }
    }
}
