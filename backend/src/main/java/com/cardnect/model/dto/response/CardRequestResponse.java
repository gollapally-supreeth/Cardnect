package com.cardnect.model.dto.response;

import com.cardnect.model.enums.RequestStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CardRequestResponse {
    private UUID id;
    private UUID listingId;
    private String listingBankName;
    private String listingCardType;
    private String listingCardNetwork;
    private String requesterName;
    private String requesterPhone; // Only exposed to card holder (incoming requests)
    private RequestStatus status;
    private String offerDetails;
    private LocalDateTime createdAt;
}
