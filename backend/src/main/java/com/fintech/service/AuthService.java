package com.fintech.service;

import com.fintech.dto.AuthDtos;
import com.fintech.model.User;
import com.fintech.repository.UserRepository;
import com.fintech.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.fintech.repository.AccessRequestRepository accessRequestRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    public AuthDtos.AuthResponse register(AuthDtos.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use: " + request.getEmail());
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.ROLE_USER)
                .build();

        userRepository.save(user);

        String token = jwtUtil.generateTokenFromEmail(user.getEmail());
        return new AuthDtos.AuthResponse(token, user.getId(), user.getEmail(),
                user.getFullName(), user.getRole().name());
    }

    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        String token = jwtUtil.generateToken(authentication);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return new AuthDtos.AuthResponse(token, user.getId(), user.getEmail(),
                user.getFullName(), user.getRole().name());
    }

    public void submitAccessRequest(AuthDtos.RequestAccessDto request) {
        if (accessRequestRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Access request already submitted for this email.");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered. You can directly log in.");
        }
        com.fintech.model.AccessRequest accessRequest = new com.fintech.model.AccessRequest();
        accessRequest.setFullName(request.getFullName());
        accessRequest.setEmail(request.getEmail());
        accessRequest.setDepartment(request.getDepartment());
        accessRequest.setReason(request.getReason());
        accessRequestRepository.save(accessRequest);
    }

    @org.springframework.transaction.annotation.Transactional
    public String approveAccessRequest(Long requestId) {
        com.fintech.model.AccessRequest request = accessRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (request.getStatus() != com.fintech.model.AccessRequest.RequestStatus.PENDING) {
            throw new RuntimeException("Request already processed.");
        }

        request.setStatus(com.fintech.model.AccessRequest.RequestStatus.INVITED);
        request.setReviewedAt(java.time.LocalDateTime.now());
        accessRequestRepository.save(request);

        String tempPassword = java.util.UUID.randomUUID().toString().substring(0, 8) + "X@";

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(tempPassword))
                .role(User.Role.ROLE_USER)
                .build();
        userRepository.save(user);

        return tempPassword;
    }

    @org.springframework.transaction.annotation.Transactional
    public void rejectAccessRequest(Long requestId) {
        com.fintech.model.AccessRequest request = accessRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        request.setStatus(com.fintech.model.AccessRequest.RequestStatus.REJECTED);
        request.setReviewedAt(java.time.LocalDateTime.now());
        accessRequestRepository.save(request);
    }
}
