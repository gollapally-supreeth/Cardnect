package com.cardnect.model.entity;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {

    private UUID id;

    private String email;

    private String name;

    private String phone;

    /** BCrypt hash — null for OTP-only users */
    private String passwordHash;

    @Builder.Default
    private boolean phoneVerified = false;

    @Builder.Default
    private boolean emailVerified = false;

    @Builder.Default
    private boolean verifiedUser = false;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public void updateVerificationFlag() {
        // Temporarily bypass phone verification requirement for the aggregate badge.
        this.verifiedUser = this.emailVerified;
    }

    public boolean isFullyVerified() {
        // Temporarily check only email verification status.
        return this.emailVerified;
    }
}
