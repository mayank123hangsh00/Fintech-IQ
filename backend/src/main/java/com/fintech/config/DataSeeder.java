package com.fintech.config;

import com.fintech.model.Transaction;
import com.fintech.model.User;
import com.fintech.repository.TransactionRepository;
import com.fintech.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Configuration
public class DataSeeder {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner seedData() {
        return args -> {
            if (userRepository.count() > 0) {
                log.info("Database already seeded, skipping...");
                return;
            }

            log.info("🌱 Seeding initial data...");

            // Create Admin
            User admin = User.builder()
                    .fullName("Admin User")
                    .email("admin@fintech.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(User.Role.ROLE_ADMIN)
                    .build();
            admin = userRepository.save(admin);

            // Create Regular User
            User user = User.builder()
                    .fullName("Priya Sharma")
                    .email("user@fintech.com")
                    .password(passwordEncoder.encode("user1234"))
                    .role(User.Role.ROLE_USER)
                    .build();
            user = userRepository.save(user);

            // Seed 60 transactions over 6 months
            seedTransactions(user);

            log.info("✅ Data seeding complete!");
            log.info("👤 Admin: admin@fintech.com / admin123");
            log.info("👤 User:  user@fintech.com / user1234");
        };
    }

    private void seedTransactions(User user) {
        Random rnd = new Random(42);

        String[][] merchantData = {
            // {merchant, type, category, minAmt, maxAmt}
            {"Swiggy", "DEBIT", "FOOD", "200", "800"},
            {"Zomato", "DEBIT", "FOOD", "150", "600"},
            {"Café Coffee Day", "DEBIT", "FOOD", "100", "400"},
            {"Uber", "DEBIT", "TRANSPORT", "80", "500"},
            {"Ola", "DEBIT", "TRANSPORT", "60", "400"},
            {"BMTC Metro", "DEBIT", "TRANSPORT", "20", "100"},
            {"Amazon.in", "DEBIT", "SHOPPING", "500", "5000"},
            {"Flipkart", "DEBIT", "SHOPPING", "300", "4000"},
            {"Myntra", "DEBIT", "SHOPPING", "400", "3000"},
            {"Netflix", "DEBIT", "ENTERTAINMENT", "199", "649"},
            {"Spotify Premium", "DEBIT", "ENTERTAINMENT", "119", "119"},
            {"PVR Cinemas", "DEBIT", "ENTERTAINMENT", "300", "800"},
            {"Apollo Pharmacy", "DEBIT", "HEALTH", "100", "2000"},
            {"Practo Consult", "DEBIT", "HEALTH", "299", "799"},
            {"BESCOM Electricity", "DEBIT", "UTILITIES", "800", "3000"},
            {"Airtel Broadband", "DEBIT", "UTILITIES", "999", "1499"},
            {"Zerodha SIP", "DEBIT", "INVESTMENT", "1000", "5000"},
            {"Groww MF", "DEBIT", "INVESTMENT", "500", "3000"},
            {"TechCorp Pvt Ltd", "CREDIT", "SALARY", "75000", "75000"},
            {"Freelance Payment", "CREDIT", "SALARY", "5000", "25000"},
        };

        LocalDateTime now = LocalDateTime.now();

        for (int monthOffset = 5; monthOffset >= 0; monthOffset--) {
            // Add 8-12 transactions per month
            int txCount = 8 + rnd.nextInt(5);
            for (int i = 0; i < txCount; i++) {
                String[] data = merchantData[rnd.nextInt(merchantData.length)];
                String merchant = data[0];
                Transaction.TransactionType type = Transaction.TransactionType.valueOf(data[1]);
                Transaction.Category category = Transaction.Category.valueOf(data[2]);
                BigDecimal minAmt = new BigDecimal(data[3]);
                BigDecimal maxAmt = new BigDecimal(data[4]);

                double range = maxAmt.subtract(minAmt).doubleValue();
                BigDecimal amount = minAmt.add(BigDecimal.valueOf(rnd.nextDouble() * range))
                        .setScale(2, java.math.RoundingMode.HALF_UP);

                // Day of month (1-28)
                int day = 1 + rnd.nextInt(27);
                LocalDateTime timestamp = now.minusMonths(monthOffset)
                        .withDayOfMonth(day)
                        .withHour(rnd.nextInt(23))
                        .withMinute(rnd.nextInt(59));

                // Mark some as anomalous (high-value debits)
                boolean isAnomalous = type == Transaction.TransactionType.DEBIT
                        && amount.compareTo(new BigDecimal("10000")) > 0;

                Transaction transaction = Transaction.builder()
                        .user(user)
                        .amount(amount)
                        .merchant(merchant)
                        .description(merchant + " payment")
                        .category(category)
                        .type(type)
                        .timestamp(timestamp)
                        .anomalous(isAnomalous)
                        .anomalyReason(isAnomalous ? "Amount exceeds typical spending threshold" : null)
                        .anomalySeverity(isAnomalous ? Transaction.AnomalySeverity.MEDIUM : null)
                        .build();

                transactionRepository.save(transaction);
            }
        }

        log.info("✅ Seeded transactions for user: {}", user.getEmail());
    }
}
