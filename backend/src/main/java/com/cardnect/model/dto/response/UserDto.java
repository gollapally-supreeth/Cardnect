package com.cardnect.model.dto.response;

import com.cardnect.model.entity.User;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class UserDto {
    private UUID id;
    private String email;
    private String name;
    private String phone;
    private boolean phoneVerified;
    private boolean emailVerified;
    private boolean verifiedUser;

    public static UserDto from(User user) {
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .phone(user.getPhone())
                .phoneVerified(user.isPhoneVerified())
                .emailVerified(user.isEmailVerified())
                .verifiedUser(user.isFullyVerified())
                .build();
    }
}
