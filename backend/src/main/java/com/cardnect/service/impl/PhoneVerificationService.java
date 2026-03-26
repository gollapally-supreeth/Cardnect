package com.cardnect.service.impl;

import com.cardnect.model.entity.PhoneOtp;
import com.cardnect.model.entity.User;
import com.cardnect.repository.PhoneOtpRepository;
import com.cardnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class PhoneVerificationService {

    private final PhoneOtpRepository phoneOtpRepository;
    private final WhatsAppService whatsAppService;
    private final UserRepository userRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${auth.otp.bypass:false}")
    private boolean otpBypass;

    @Transactional
    public void generateAndSendOtp(User user, String phone) {
        String cleanPhone = phone.replaceAll("[^0-9]", "");
        
        // Basic rate limit protection: clear old
        phoneOtpRepository.deleteByPhone(cleanPhone);

        String otp = otpBypass ? "000000" : String.format("%06d", secureRandom.nextInt(1_000_000));
        
        PhoneOtp phoneOtp = PhoneOtp.builder()
                .phone(cleanPhone)
                .otpCode(otp)
                .attempts(0)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .build();
                
        phoneOtpRepository.saveAndFlush(phoneOtp);

        String message = String.format("""
                \uD83DD\uDD12 Your Cardnect OTP is: *%s*
                
                Valid for 5 minutes.
                Do not share with anyone.
                
                \u2014 Team Cardnect
                """, otp);

        whatsAppService.sendTextMessage(cleanPhone, message);
        log.info("Generated WhatsApp OTP for {}: {}", cleanPhone, otp);
        log.info("WhatsApp delivery initiated...");
    }

    @Transactional
    public void verifyOtp(User user, String phone, String code) {
        String cleanPhone = phone.replaceAll("[^0-9]", "");
        
        PhoneOtp phoneOtp = phoneOtpRepository.findByPhone(cleanPhone)
                .orElseThrow(() -> new IllegalArgumentException("OTP not found. Request a new one."));
                
        if (phoneOtp.getExpiresAt().isBefore(LocalDateTime.now())) {
            phoneOtpRepository.deleteByPhone(cleanPhone);
            throw new IllegalArgumentException("OTP expired. Please request a new code.");
        }

        if (phoneOtp.getAttempts() >= 3) {
            phoneOtpRepository.deleteByPhone(cleanPhone);
            throw new IllegalArgumentException("Too many wrong attempts. Request a new code.");
        }

        if (!phoneOtp.getOtpCode().equals(code) && !otpBypass) {
            phoneOtp.setAttempts(phoneOtp.getAttempts() + 1);
            phoneOtpRepository.save(phoneOtp);
            throw new IllegalArgumentException("Invalid OTP code. " + (3 - phoneOtp.getAttempts()) + " attempts left.");
        }

        // Success
        phoneOtpRepository.deleteByPhone(cleanPhone);
        
        user.setPhone(cleanPhone);
        user.setPhoneVerified(true);
        userRepository.save(user); // Triggers updateVerificationFlag via @PreUpdate
        log.info("User {} phone verified successfully", user.getId());
    }
}
