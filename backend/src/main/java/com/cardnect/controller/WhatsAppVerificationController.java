package com.cardnect.controller;

import com.cardnect.model.dto.request.SendWhatsAppOtpRequest;
import com.cardnect.model.dto.request.VerifyWhatsAppOtpRequest;
import com.cardnect.model.entity.User;
import com.cardnect.service.impl.PhoneVerificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/user/whatsapp")
@RequiredArgsConstructor
public class WhatsAppVerificationController {

    private final PhoneVerificationService phoneVerificationService;

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody SendWhatsAppOtpRequest request) {
        
        phoneVerificationService.generateAndSendOtp(user, request.getPhone());
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "OTP sent on WhatsApp"
        ));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody VerifyWhatsAppOtpRequest request) {
        
        phoneVerificationService.verifyOtp(user, request.getPhone(), request.getOtp());
        return ResponseEntity.ok(Map.of(
                "success", true,
                "valid", true,
                "message", "Phone number verified"
        ));
    }
}
