package com.cardnect.controller;

import com.cardnect.model.entity.User;
import com.cardnect.service.impl.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<?> getProfile() {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "name", user.getName() != null ? user.getName() : "",
                "phone", user.getPhone() != null ? user.getPhone() : "",
                "phoneVerified", user.isPhoneVerified(),
                "emailVerified", user.isEmailVerified(),
                "verifiedUser", user.isVerifiedUser(),
                "fullyVerified", user.isFullyVerified(),
                "createdAt", user.getCreatedAt()
        ));
    }
}
