package com.cardnect.model.entity;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Notification {

    private UUID id;

    private User user;

    private CardRequest request;

    private String message;

    @Builder.Default
    private boolean read = false;

    private LocalDateTime createdAt;
}
