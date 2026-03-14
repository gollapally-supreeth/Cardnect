package com.cardnect.model.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class UserMeResponse {
    private UUID id;
    private String email;
    private String name;
    private String phone;
    private boolean emailVerified;
    private boolean phoneVerified;
    private boolean verifiedUser;
    private LocalDateTime createdAt;
}

