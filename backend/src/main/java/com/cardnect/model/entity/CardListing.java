package com.cardnect.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "card_listings", indexes = {
    @Index(name = "idx_card_listings_user_id", columnList = "user_id"),
    @Index(name = "idx_card_listings_is_active", columnList = "is_active")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CardListing {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "bank_name", nullable = false, length = 100)
    private String bankName;

    @Column(name = "card_network", nullable = false, length = 50)
    private String cardNetwork;

    @Column(name = "card_type", nullable = false, length = 50)
    private String cardType;

    /**
     * Stores ONLY last 4 digits. Display as "XXXX XXXX XXXX XXXX".
     * SECURITY: Full card numbers, CVV, and expiry are NEVER stored.
     */
    @Column(name = "masked_number", nullable = false, length = 4)
    private String maskedNumber;

    @Column(name = "commission_percentage", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal commissionPercentage = BigDecimal.ZERO;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
