package com.cardnect.service.impl;

import com.cardnect.model.dto.response.AuthResponse;
import com.cardnect.model.dto.response.UserMeResponse;
import com.cardnect.model.entity.User;
import com.cardnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final OtpService otpService;
    private final ResendEmailService resendEmailService;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final UserService userService;

    @Transactional
    public void sendOtp(String email) {
        String normalized = normalizeEmail(email);
        String otp = otpService.generateAndStoreOtp(normalized);
        resendEmailService.sendOtpEmail(normalized, otp);
        log.info("OTP generated for {}", normalized);
    }

    @Transactional
    public AuthResponse verifyOtp(String email, String otpCode) {
        String normalized = normalizeEmail(email);
        otpService.validateOtp(normalized, otpCode);

        User user = userRepository.findByEmail(normalized)
                .orElseGet(() -> userRepository.save(
                        User.builder()
                                .email(normalized)
                                .emailVerified(true)
                                .verifiedUser(true)
                                .build()
                ));

        user.setEmailVerified(true);
        user = userRepository.save(user);

        String token = jwtService.generateToken(user.getId(), user.getEmail());

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

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }
}

