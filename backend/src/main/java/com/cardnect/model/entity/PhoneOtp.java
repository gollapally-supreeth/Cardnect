package com.cardnect.model.entity;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PhoneOtp {

    private UUID id;

    private String phone;

    private String otpCode;

    @Builder.Default
    private int attempts = 0;

    private LocalDateTime createdAt;

    private LocalDateTime expiresAt;
}
