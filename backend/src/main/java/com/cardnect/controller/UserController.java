package com.cardnect.controller;

import com.cardnect.model.entity.User;
import com.cardnect.service.impl.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * Called by the frontend after login/signup to sync JWT claims into the local DB.
     */
    @PostMapping("/sync")
    public ResponseEntity<?> syncUser(Authentication auth) {
        User user = userService.getCurrentUser();
        User updated = userService.syncUser(user, auth);
        return ResponseEntity.ok(Map.of(
                "id", updated.getId(),
                "name", updated.getName() != null ? updated.getName() : "",
                "phoneVerified", updated.isPhoneVerified(),
                "emailVerified", updated.isEmailVerified(),
                "fullyVerified", updated.isFullyVerified()
        ));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getProfile() {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "name", user.getName() != null ? user.getName() : "",
                "phoneVerified", user.isPhoneVerified(),
                "emailVerified", user.isEmailVerified(),
                "fullyVerified", user.isFullyVerified()
        ));
    }
}
