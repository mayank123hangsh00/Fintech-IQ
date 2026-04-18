package com.fintech.service;

import com.fintech.dto.TransactionDtos;
import com.fintech.model.Transaction;
import com.fintech.model.User;
import com.fintech.repository.TransactionRepository;
import com.fintech.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AiService aiService;

    @Autowired
    private SseService sseService;

    @Transactional
    public TransactionDtos.TransactionResponse addTransaction(String userEmail,
                                                              TransactionDtos.CreateTransactionRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 1. AI: Categorize the transaction
        Transaction.Category category = aiService.categorizeTransaction(
                request.getMerchant(), request.getDescription(), request.getAmount()
        );

        // 2. AI: Detect anomaly (only for DEBIT transactions)
        AiService.AnomalyResult anomaly = new AiService.AnomalyResult(false, null, null);
        if (request.getType() == Transaction.TransactionType.DEBIT) {
            anomaly = aiService.detectAnomaly(request.getMerchant(), request.getAmount(),
                    "typical Indian household spending pattern");
        }

        // 3. Save transaction
        Transaction transaction = Transaction.builder()
                .user(user)
                .amount(request.getAmount())
                .merchant(request.getMerchant())
                .description(request.getDescription())
                .category(category)
                .type(request.getType())
                .timestamp(request.getTimestamp() != null ? request.getTimestamp() : LocalDateTime.now())
                .anomalous(anomaly.anomalous())
                .anomalyReason(anomaly.reason())
                .anomalySeverity(anomaly.severity())
                .build();

        transaction = transactionRepository.save(transaction);

        // 4. Push SSE notification if anomalous
        if (anomaly.anomalous()) {
            sseService.pushNotification(userEmail, Map.of(
                "type", "ANOMALY_ALERT",
                "message", "⚠️ Suspicious transaction detected at " + request.getMerchant(),
                "severity", anomaly.severity().name(),
                "amount", request.getAmount().toString(),
                "transactionId", transaction.getId().toString()
            ));
        }

        return toResponse(transaction);
    }

    public Page<TransactionDtos.TransactionResponse> getTransactions(String userEmail,
                                                                      int page, int size,
                                                                      String category, String type) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Pageable pageable = PageRequest.of(page, size);
        Page<Transaction> transactions;

        if (category != null && !category.isBlank()) {
            transactions = transactionRepository.findByUserIdAndCategoryOrderByTimestampDesc(
                    user.getId(), Transaction.Category.valueOf(category.toUpperCase()), pageable);
        } else if (type != null && !type.isBlank()) {
            transactions = transactionRepository.findByUserIdAndTypeOrderByTimestampDesc(
                    user.getId(), Transaction.TransactionType.valueOf(type.toUpperCase()), pageable);
        } else {
            transactions = transactionRepository.findByUserIdOrderByTimestampDesc(user.getId(), pageable);
        }

        return transactions.map(this::toResponse);
    }

    public List<TransactionDtos.TransactionResponse> getAnomalies(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return transactionRepository.findByUserIdAndAnomalousTrue(user.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public TransactionDtos.TransactionSummary getSummary(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime now = LocalDateTime.now();

        BigDecimal income = transactionRepository.sumAmountByUserIdAndTypeAndTimestampBetween(
                user.getId(), Transaction.TransactionType.CREDIT, startOfMonth, now);
        BigDecimal expenses = transactionRepository.sumAmountByUserIdAndTypeAndTimestampBetween(
                user.getId(), Transaction.TransactionType.DEBIT, startOfMonth, now);

        income = income != null ? income : BigDecimal.ZERO;
        expenses = expenses != null ? expenses : BigDecimal.ZERO;

        List<Object[]> categoryRaw = transactionRepository.getCategoryBreakdown(
                user.getId(), startOfMonth, now);

        Map<String, BigDecimal> categoryBreakdown = new HashMap<>();
        for (Object[] row : categoryRaw) {
            categoryBreakdown.put(row[0].toString(), (BigDecimal) row[1]);
        }

        long count = transactionRepository.countByUserIdAndTimestampBetween(user.getId(), startOfMonth, now);
        int anomalyCount = transactionRepository.findByUserIdAndAnomalousTrue(user.getId()).size();

        TransactionDtos.TransactionSummary summary = new TransactionDtos.TransactionSummary();
        summary.setTotalIncome(income);
        summary.setTotalExpenses(expenses);
        summary.setNetBalance(income.subtract(expenses));
        summary.setTotalTransactions((int) count);
        summary.setAnomalyCount(anomalyCount);
        summary.setCategoryBreakdown(categoryBreakdown);
        return summary;
    }

    private TransactionDtos.TransactionResponse toResponse(Transaction t) {
        return TransactionDtos.TransactionResponse.builder()
                .id(t.getId())
                .amount(t.getAmount())
                .merchant(t.getMerchant())
                .description(t.getDescription())
                .category(t.getCategory())
                .type(t.getType())
                .timestamp(t.getTimestamp())
                .anomalous(t.isAnomalous())
                .anomalyReason(t.getAnomalyReason())
                .anomalySeverity(t.getAnomalySeverity())
                .build();
    }
}
