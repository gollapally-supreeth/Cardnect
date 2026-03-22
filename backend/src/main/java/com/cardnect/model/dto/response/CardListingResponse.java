package com.cardnect.model.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CardListingResponse {
    private UUID id;
    private String bankName;
    private String cardName;
    private String cardNetwork;
    private String cardType;
    private String maskedNumber; // Formatted: "XXXX XXXX XXXX XXXX"
    private BigDecimal commissionPercentage;
    private boolean active;
    private String holderName;
    private LocalDateTime createdAt;
}
