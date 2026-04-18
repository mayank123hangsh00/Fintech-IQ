package com.fintech.repository;

import com.fintech.model.MonthlyReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MonthlyReportRepository extends JpaRepository<MonthlyReport, Long> {
    Optional<MonthlyReport> findByUserIdAndReportMonth(Long userId, String reportMonth);
    List<MonthlyReport> findByUserIdOrderByReportMonthDesc(Long userId);
    List<MonthlyReport> findAllByOrderByReportMonthDesc();
}
