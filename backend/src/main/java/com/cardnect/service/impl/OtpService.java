package com.cardnect.service.impl;

import com.cardnect.model.entity.OtpCode;
import com.cardnect.repository.OtpCodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class OtpService {

    private final OtpCodeRepository otpCodeRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${auth.otp.bypass:false}")
    private boolean otpBypass;

    @Transactional
    public String generateAndStoreOtp(String email) {
        if (otpBypass) {
            otpCodeRepository.deleteByEmail(email);
            return "000000";
        }

        String otp = String.format("%06d", secureRandom.nextInt(1_000_000));
        LocalDateTime now = LocalDateTime.now();

        otpCodeRepository.deleteByEmail(email);
        OtpCode row = OtpCode.builder()
                .email(email)
                .otpCode(otp)
                .createdAt(now)
                .expiresAt(now.plusMinutes(5))
                .build();
        otpCodeRepository.save(row);

        return otp;
    }

    @Transactional
    public void validateOtp(String email, String code) {
        if (otpBypass) {
            otpCodeRepository.deleteByEmail(email);
            return;
        }

        OtpCode latest = otpCodeRepository.findTopByEmailOrderByCreatedAtDesc(email)
                .orElseThrow(() -> new IllegalArgumentException("OTP not found. Please request a new code."));

        if (latest.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("OTP expired. Please request a new code.");
        }

        if (!latest.getOtpCode().equals(code)) {
            throw new IllegalArgumentException("Invalid OTP code.");
        }

        otpCodeRepository.deleteByEmail(email);
    }

    public boolean isOtpBypassEnabled() {
        return otpBypass;
    }
}
