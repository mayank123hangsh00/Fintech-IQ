package com.fintech.controller;

import com.fintech.dto.TransactionDtos;
import com.fintech.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @PostMapping
    public ResponseEntity<TransactionDtos.TransactionResponse> addTransaction(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody TransactionDtos.CreateTransactionRequest request) {
        return ResponseEntity.ok(transactionService.addTransaction(userDetails.getUsername(), request));
    }

    @GetMapping
    public ResponseEntity<Page<TransactionDtos.TransactionResponse>> getTransactions(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String type) {
        return ResponseEntity.ok(transactionService.getTransactions(
                userDetails.getUsername(), page, size, category, type));
    }

    @GetMapping("/summary")
    public ResponseEntity<TransactionDtos.TransactionSummary> getSummary(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(transactionService.getSummary(userDetails.getUsername()));
    }

    @GetMapping("/anomalies")
    public ResponseEntity<List<TransactionDtos.TransactionResponse>> getAnomalies(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(transactionService.getAnomalies(userDetails.getUsername()));
    }
}
