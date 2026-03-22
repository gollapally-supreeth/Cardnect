package com.cardnect.service.impl;

import com.cardnect.model.dto.request.LoginRequest;
import com.cardnect.model.dto.request.RegisterRequest;
import com.cardnect.model.dto.request.VerifyOtpRequest;
import com.cardnect.model.dto.response.AuthResponse;
import com.cardnect.model.dto.response.UserMeResponse;
import com.cardnect.model.entity.User;
import com.cardnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final OtpService otpService;
    private final ResendEmailService resendEmailService;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    /* ── OTP send ─────────────────────────────────────────────── */
    @Transactional
    public void sendOtp(String email) {
        String normalized = normalizeEmail(email);
        String otp = otpService.generateAndStoreOtp(normalized);
        resendEmailService.sendOtpEmail(normalized, otp);
        log.info("OTP generated for {}", normalized);
    }

    /* ── OTP verify (existing flow — sign-in with OTP) ─────────── */
    @Transactional
    public AuthResponse verifyOtp(VerifyOtpRequest request) {
        String normalized = normalizeEmail(request.getEmail());
        String otpCode = request.getOtpCode() == null ? "" : request.getOtpCode().trim();
        otpService.validateOtp(normalized, otpCode);

        User user = userRepository.findByEmail(normalized)
                .orElseGet(() -> userRepository.save(
                        User.builder()
                                .email(normalized)
                                .name(request.getName() != null ? request.getName().trim() : "")
                                .phone(request.getPhone() != null ? request.getPhone().trim() : "")
                                .emailVerified(true)
                                .verifiedUser(true)
                                .build()
                ));

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName().trim());
        }
        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            user.setPhone(request.getPhone().trim());
        }
        user.setEmailVerified(true);
        user = userRepository.save(user);

        String token = jwtService.generateToken(user.getId(), user.getEmail());
        return buildAuthResponse(token, user);
    }

    /* ── Register (after email OTP verified) ────────────────────── */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalized = normalizeEmail(request.getEmail());

        // Validate the email OTP first
        String otpCode = request.getOtpCode() == null ? "" : request.getOtpCode().trim();
        otpService.validateOtp(normalized, otpCode);

        // If the user already exists update their info; otherwise create new
        User user = userRepository.findByEmail(normalized).orElse(null);
        if (user == null) {
            user = User.builder()
                    .email(normalized)
                    .name(request.getName().trim())
                    .phone(request.getPhone().trim())
                    .passwordHash(passwordEncoder.encode(request.getPassword()))
                    .emailVerified(true)
                    .verifiedUser(true)
                    .build();
        } else {
            user.setName(request.getName().trim());
            user.setPhone(request.getPhone().trim());
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            user.setEmailVerified(true);
        }
        user = userRepository.save(user);
        log.info("User registered: {}", normalized);

        String token = jwtService.generateToken(user.getId(), user.getEmail());
        return buildAuthResponse(token, user);
    }

    /* ── Password login ─────────────────────────────────────────── */
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String normalized = normalizeEmail(request.getEmail());

        User user = userRepository.findByEmail(normalized)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if (user.getPasswordHash() == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        String token = jwtService.generateToken(user.getId(), user.getEmail());
        return buildAuthResponse(token, user);
    }

    /* ── Me ──────────────────────────────────────────────────────── */
    public UserMeResponse me() {
        User user = userService.getCurrentUser();
        return UserMeResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .phone(user.getPhone())
                .emailVerified(user.isEmailVerified())
                .phoneVerified(user.isPhoneVerified())
                .verifiedUser(user.isVerifiedUser())
                .createdAt(user.getCreatedAt())
                .build();
    }

    /* ── Helpers ─────────────────────────────────────────────────── */
    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }

    private AuthResponse buildAuthResponse(String token, User user) {
        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .phone(user.getPhone())
                .emailVerified(user.isEmailVerified())
                .phoneVerified(user.isPhoneVerified())
                .verifiedUser(user.isVerifiedUser())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
