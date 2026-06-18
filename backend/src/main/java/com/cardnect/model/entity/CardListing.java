package com.cardnect.model.entity;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CardListing {

    private UUID id;

    private User user;

    private String bankName;

    private String cardName;

    private String cardNetwork;

    private String cardType;

    /**
     * Stores ONLY last 4 digits. Display as "XXXX XXXX XXXX XXXX".
     * SECURITY: Full card numbers, CVV, and expiry are NEVER stored.
     */
    private String maskedNumber;

    @Builder.Default
    private BigDecimal commissionPercentage = BigDecimal.ZERO;

    @Builder.Default
    private boolean active = true;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
