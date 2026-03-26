package com.cardnect.model.dto.response;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class NotificationResponse {
    private UUID id;
    private String message;
    private boolean read;
    private LocalDateTime createdAt;
    
    // Request details for direct action
    private UUID requestId;
    private String requestStatus;
    private String requesterName;
    private String requesterPhone;
}
