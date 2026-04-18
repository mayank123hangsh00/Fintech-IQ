package com.fintech.controller;

import com.fintech.model.MonthlyReport;
import com.fintech.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/monthly")
    public ResponseEntity<MonthlyReport> getMonthlyReport(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) String month) {
        if (month == null || month.isBlank()) {
            month = LocalDate.now().minusMonths(1).format(DateTimeFormatter.ofPattern("yyyy-MM"));
        }
        return ResponseEntity.ok(reportService.getOrGenerateReport(userDetails.getUsername(), month));
    }

    @GetMapping
    public ResponseEntity<List<MonthlyReport>> getAllReports(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(reportService.getUserReports(userDetails.getUsername()));
    }

    @PostMapping("/generate")
    public ResponseEntity<MonthlyReport> generateReport(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam String month) {
        return ResponseEntity.ok(reportService.getOrGenerateReport(userDetails.getUsername(), month));
    }
}
