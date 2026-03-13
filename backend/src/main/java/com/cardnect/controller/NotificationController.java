package com.cardnect.controller;

import com.cardnect.model.entity.User;
import com.cardnect.service.impl.NotificationService;
import com.cardnect.service.impl.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<?> getMyNotifications() {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(notificationService.getForUser(user));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<?> markRead(@PathVariable UUID id) {
        User user = userService.getCurrentUser();
        notificationService.markRead(user, id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<?> markAllRead() {
        User user = userService.getCurrentUser();
        notificationService.markAllRead(user);
        return ResponseEntity.ok().build();
    }
}
