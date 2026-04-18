package com.fintech.scheduler;

import com.fintech.service.ReportService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;

@Component
public class ReportScheduler {

    private static final Logger log = LoggerFactory.getLogger(ReportScheduler.class);
    private static final DateTimeFormatter MONTH_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM");

    @Autowired
    private ReportService reportService;

    /**
     * Runs at 1:00 AM on the 1st of every month.
     * Generates financial health reports for all users for the previous month.
     */
    @Scheduled(cron = "0 0 1 1 * ?")
    public void generateMonthlyReports() {
        String previousMonth = YearMonth.now().minusMonths(1).format(MONTH_FORMATTER);
        log.info("🕐 Scheduled task: Generating monthly reports for {}", previousMonth);
        try {
            reportService.generateAllUserReportsForMonth(previousMonth);
            log.info("✅ Monthly reports generation completed for {}", previousMonth);
        } catch (Exception e) {
            log.error("❌ Monthly report generation failed: {}", e.getMessage(), e);
        }
    }
}
