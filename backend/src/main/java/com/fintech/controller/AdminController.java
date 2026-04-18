package com.fintech.controller;

import com.fintech.model.MonthlyReport;
import com.fintech.model.User;
import com.fintech.repository.MonthlyReportRepository;
import com.fintech.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MonthlyReportRepository reportRepository;

    @Autowired
    private com.fintech.repository.AccessRequestRepository accessRequestRepository;

    @Autowired
    private com.fintech.service.AuthService authService;

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/reports")
    public ResponseEntity<List<MonthlyReport>> getAllReports() {
        return ResponseEntity.ok(reportRepository.findAllByOrderByReportMonthDesc());
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getSystemStats() {
        long userCount = userRepository.count();
        long reportCount = reportRepository.count();
        return ResponseEntity.ok(java.util.Map.of(
            "totalUsers", userCount,
            "totalReports", reportCount
        ));
    }

    @GetMapping("/access-requests")
    public ResponseEntity<?> getAccessRequests() {
        return ResponseEntity.ok(accessRequestRepository.findAll());
    }

    @PostMapping("/access-requests/{id}/approve")
    public ResponseEntity<?> approveAccessRequest(@PathVariable Long id) {
        String tempPassword = authService.approveAccessRequest(id);
        return ResponseEntity.ok(java.util.Map.of("message", "User approved.", "tempPassword", tempPassword));
    }

    @PostMapping("/access-requests/{id}/reject")
    public ResponseEntity<?> rejectAccessRequest(@PathVariable Long id) {
        authService.rejectAccessRequest(id);
        return ResponseEntity.ok(java.util.Map.of("message", "Request rejected."));
    }
}
