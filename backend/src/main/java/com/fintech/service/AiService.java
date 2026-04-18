package com.fintech.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fintech.model.Transaction;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.Map;

@Service
public class AiService {

    private static final Logger log = LoggerFactory.getLogger(AiService.class);

    private final RestClient groqRestClient;
    private final ObjectMapper objectMapper;

    @Value("${groq.api.model}")
    private String model;

    @Value("${groq.api.key}")
    private String apiKey;

    public AiService(@Qualifier("groqRestClient") RestClient groqRestClient,
                     ObjectMapper objectMapper) {
        this.groqRestClient = groqRestClient;
        this.objectMapper = objectMapper;
    }

    /**
     * Categorizes a transaction using Groq AI.
     * Returns a category string like FOOD, TRANSPORT, SHOPPING, etc.
     */
    public Transaction.Category categorizeTransaction(String merchant, String description, BigDecimal amount) {
        if (isMockMode()) {
            return mockCategory(merchant);
        }
        try {
            String prompt = String.format(
                "Categorize this bank transaction into exactly ONE of these categories: " +
                "FOOD, TRANSPORT, SHOPPING, UTILITIES, ENTERTAINMENT, HEALTH, SALARY, INVESTMENT, OTHER.\n" +
                "Merchant: %s\nDescription: %s\nAmount: ₹%s\n" +
                "Respond with ONLY the category name, nothing else.",
                merchant, description, amount
            );

            String response = callGroq(prompt);
            String category = response.trim().toUpperCase().replaceAll("[^A-Z_]", "");

            return switch (category) {
                case "FOOD" -> Transaction.Category.FOOD;
                case "TRANSPORT" -> Transaction.Category.TRANSPORT;
                case "SHOPPING" -> Transaction.Category.SHOPPING;
                case "UTILITIES" -> Transaction.Category.UTILITIES;
                case "ENTERTAINMENT" -> Transaction.Category.ENTERTAINMENT;
                case "HEALTH" -> Transaction.Category.HEALTH;
                case "SALARY" -> Transaction.Category.SALARY;
                case "INVESTMENT" -> Transaction.Category.INVESTMENT;
                default -> Transaction.Category.OTHER;
            };
        } catch (Exception e) {
            log.error("AI categorization failed: {}", e.getMessage());
            return mockCategory(merchant);
        }
    }

    /**
     * Detects if a transaction is anomalous.
     * Returns AnomalyResult with isAnomalous, reason, and severity.
     */
    public AnomalyResult detectAnomaly(String merchant, BigDecimal amount, String userSpendingPattern) {
        if (isMockMode()) {
            return mockAnomaly(amount);
        }
        try {
            String prompt = String.format(
                "You are a fraud detection AI for a bank. Analyze this transaction:\n" +
                "Merchant: %s\nAmount: ₹%s\nUser's typical spending pattern: %s\n\n" +
                "Respond in this exact JSON format only:\n" +
                "{\"isAnomalous\": true/false, \"reason\": \"brief reason\", \"severity\": \"LOW/MEDIUM/HIGH\"}\n" +
                "Consider it anomalous if amount is unusually high, merchant is suspicious, or pattern is abnormal.",
                merchant, amount, userSpendingPattern
            );

            String response = callGroq(prompt);
            JsonNode json = objectMapper.readTree(extractJson(response));

            boolean isAnomalous = json.path("isAnomalous").asBoolean(false);
            String reason = json.path("reason").asText("No anomaly detected");
            String severityStr = json.path("severity").asText("LOW");
            Transaction.AnomalySeverity severity = Transaction.AnomalySeverity.valueOf(severityStr);

            return new AnomalyResult(isAnomalous, reason, severity);
        } catch (Exception e) {
            log.error("AI anomaly detection failed: {}", e.getMessage());
            return mockAnomaly(amount);
        }
    }

    /**
     * Generates monthly financial insights paragraph for a user.
     */
    public String generateMonthlyInsights(String month, BigDecimal totalIncome,
                                           BigDecimal totalSpend, BigDecimal savings,
                                           Map<String, BigDecimal> categoryBreakdown, int anomalyCount) {
        if (isMockMode()) {
            return generateMockInsights(month, totalIncome, totalSpend, savings, anomalyCount);
        }
        try {
            String prompt = String.format(
                "You are a personal financial advisor AI. Generate a professional, encouraging 3-paragraph " +
                "financial health report for %s:\n\n" +
                "Income: ₹%s | Expenses: ₹%s | Savings: ₹%s | Anomalies: %d\n" +
                "Category breakdown: %s\n\n" +
                "Make it conversational, include specific tips to improve savings, " +
                "and warn about the anomalies if any. Keep it under 300 words.",
                month, totalIncome, totalSpend, savings, anomalyCount, categoryBreakdown.toString()
            );

            return callGroq(prompt);
        } catch (Exception e) {
            log.error("AI insights generation failed: {}", e.getMessage());
            return generateMockInsights(month, totalIncome, totalSpend, savings, anomalyCount);
        }
    }

    private String callGroq(String userMessage) {
        Map<String, Object> body = Map.of(
            "model", model,
            "messages", new Object[]{
                Map.of("role", "user", "content", userMessage)
            },
            "max_tokens", 500,
            "temperature", 0.3
        );

        String response = groqRestClient.post()
                .uri("/chat/completions")
                .body(body)
                .retrieve()
                .body(String.class);

        JsonNode root = null;
        try {
            root = objectMapper.readTree(response);
            return root.path("choices").get(0).path("message").path("content").asText();
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Groq response: " + e.getMessage());
        }
    }

    private String extractJson(String text) {
        int start = text.indexOf('{');
        int end = text.lastIndexOf('}');
        if (start >= 0 && end >= 0) return text.substring(start, end + 1);
        return "{}";
    }

    private boolean isMockMode() {
        return apiKey == null || apiKey.equals("mock-key") || apiKey.isBlank();
    }

    private Transaction.Category mockCategory(String merchant) {
        String m = merchant.toLowerCase();
        if (m.contains("swiggy") || m.contains("zomato") || m.contains("food") || m.contains("restaurant"))
            return Transaction.Category.FOOD;
        if (m.contains("uber") || m.contains("ola") || m.contains("metro") || m.contains("fuel"))
            return Transaction.Category.TRANSPORT;
        if (m.contains("amazon") || m.contains("flipkart") || m.contains("myntra") || m.contains("mall"))
            return Transaction.Category.SHOPPING;
        if (m.contains("netflix") || m.contains("spotify") || m.contains("movie") || m.contains("pvr"))
            return Transaction.Category.ENTERTAINMENT;
        if (m.contains("hospital") || m.contains("pharmacy") || m.contains("clinic") || m.contains("med"))
            return Transaction.Category.HEALTH;
        if (m.contains("electricity") || m.contains("broadband") || m.contains("gas") || m.contains("water"))
            return Transaction.Category.UTILITIES;
        if (m.contains("salary") || m.contains("payroll") || m.contains("income"))
            return Transaction.Category.SALARY;
        if (m.contains("mutual fund") || m.contains("zerodha") || m.contains("groww") || m.contains("sip"))
            return Transaction.Category.INVESTMENT;
        return Transaction.Category.OTHER;
    }

    private AnomalyResult mockAnomaly(BigDecimal amount) {
        if (amount.compareTo(new BigDecimal("50000")) > 0) {
            return new AnomalyResult(true, "Unusually large transaction amount detected", Transaction.AnomalySeverity.HIGH);
        } else if (amount.compareTo(new BigDecimal("20000")) > 0) {
            return new AnomalyResult(true, "Transaction amount exceeds typical spending threshold", Transaction.AnomalySeverity.MEDIUM);
        }
        return new AnomalyResult(false, null, null);
    }

    private String generateMockInsights(String month, BigDecimal income, BigDecimal spend, BigDecimal savings, int anomalies) {
        return String.format(
            "📊 Financial Health Report — %s\n\n" +
            "Your income this month was ₹%s and your total spending was ₹%s, " +
            "resulting in net savings of ₹%s. " +
            "%s\n\n" +
            "💡 Key Recommendation: Focus on reducing discretionary spending categories. " +
            "Consider setting up automatic transfers to a savings account at the start of each month " +
            "to ensure you hit your savings goals before spending begins.\n\n" +
            "🎯 Savings Rate: %.1f%% — %s",
            month, income, spend, savings,
            anomalies > 0 ? "⚠️ We detected " + anomalies + " suspicious transaction(s) this month. Please review them immediately." : "✅ No suspicious transactions detected this month.",
            income.compareTo(BigDecimal.ZERO) > 0 ? savings.multiply(new BigDecimal("100")).divide(income, 1, java.math.RoundingMode.HALF_UP).doubleValue() : 0.0,
            savings.compareTo(BigDecimal.ZERO) > 0 ? "Great work! You're saving positively." : "You're spending more than you earn. Time to budget!"
        );
    }

    public record AnomalyResult(boolean anomalous, String reason, Transaction.AnomalySeverity severity) {}
}
