package com.cardnect.controller;

import com.cardnect.model.dto.request.CreateRequestDto;
import com.cardnect.model.entity.User;
import com.cardnect.service.impl.CardRequestService;
import com.cardnect.service.impl.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/requests")
@RequiredArgsConstructor
public class CardRequestController {

    private final CardRequestService requestService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<?> createRequest(@Valid @RequestBody CreateRequestDto dto) {
        User user = userService.getCurrentUser();
        return ResponseEntity.status(HttpStatus.CREATED).body(requestService.createRequest(user, dto));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyRequests() {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(requestService.getMyRequests(user));
    }

    @GetMapping("/incoming")
    public ResponseEntity<?> getIncomingRequests() {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(requestService.getIncomingRequests(user));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable UUID id,
                                          @RequestBody Map<String, String> body) {
        User user = userService.getCurrentUser();
        String status = body.get("status");
        if (status == null || status.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Status is required"));
        }
        return ResponseEntity.ok(requestService.updateStatus(user, id, status));
    }
}
