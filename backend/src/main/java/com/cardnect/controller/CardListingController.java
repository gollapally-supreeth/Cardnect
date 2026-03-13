package com.cardnect.controller;

import com.cardnect.model.dto.request.CreateListingRequest;
import com.cardnect.model.entity.User;
import com.cardnect.service.impl.CardListingService;
import com.cardnect.service.impl.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/listings")
@RequiredArgsConstructor
public class CardListingController {

    private final CardListingService listingService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<?> getAllListings() {
        return ResponseEntity.ok(listingService.getActiveListings());
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyListings() {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(listingService.getMyListings(user));
    }

    @PostMapping
    public ResponseEntity<?> createListing(@Valid @RequestBody CreateListingRequest req) {
        User user = userService.getCurrentUser();
        return ResponseEntity.status(HttpStatus.CREATED).body(listingService.createListing(user, req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateListing(@PathVariable UUID id,
                                            @Valid @RequestBody CreateListingRequest req) {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(listingService.updateListing(user, id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteListing(@PathVariable UUID id) {
        User user = userService.getCurrentUser();
        listingService.deleteListing(user, id);
        return ResponseEntity.noContent().build();
    }
}
