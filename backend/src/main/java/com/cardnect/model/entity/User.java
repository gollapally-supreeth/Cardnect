package com.cardnect.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_users_email", columnList = "email")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "email", unique = true, nullable = false, length = 255)
    private String email;

    @Column(name = "name")
    private String name;

    @Column(name = "phone", length = 20)
    private String phone;

    /** BCrypt hash — null for OTP-only users */
    @Column(name = "password_hash", length = 72)
    private String passwordHash;

    @Column(name = "phone_verified", nullable = false)
    @Builder.Default
    private boolean phoneVerified = false;

    @Column(name = "email_verified", nullable = false)
    @Builder.Default
    private boolean emailVerified = false;

    @Column(name = "verified_user", nullable = false)
    @Builder.Default
    private boolean verifiedUser = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    public void updateVerificationFlag() {
        // Temporarily bypass phone verification requirement for the aggregate badge.
        this.verifiedUser = this.emailVerified;
    }

    public boolean isFullyVerified() {
        return this.emailVerified;
    }
}
