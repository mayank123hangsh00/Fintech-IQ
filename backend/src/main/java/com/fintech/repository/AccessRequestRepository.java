package com.fintech.repository;

import com.fintech.model.AccessRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AccessRequestRepository extends JpaRepository<AccessRequest, Long> {
    boolean existsByEmail(String email);
    Optional<AccessRequest> findByEmail(String email);
}
