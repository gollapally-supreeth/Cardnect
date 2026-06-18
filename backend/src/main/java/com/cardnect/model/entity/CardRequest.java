package com.cardnect.model.entity;

import com.cardnect.model.enums.RequestStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CardRequest {

    private UUID id;

    private CardListing listing;

    private User requester;

    @Builder.Default
    private RequestStatus status = RequestStatus.PENDING;

    private String offerDetails;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
