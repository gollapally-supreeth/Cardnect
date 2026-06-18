package com.cardnect.model.entity;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OtpCode {

    private UUID id;

    private String email;

    private String otpCode;

    private LocalDateTime expiresAt;

    private LocalDateTime createdAt;
}
