package com.cardnect.service.impl;

import com.cardnect.model.entity.User;
import com.cardnect.repository.UserRepository;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;

    /**
     * Called when a user logs in. Syncs Clerk JWT claims with local DB.
     * Creates user if new, updates phone/email verification status if existing.
     */
    @Transactional
    public User syncUser(User currentUser, Authentication authentication) {
        // Extract claims from JWT (already validated by ClerkJwtFilter)
        Claims claims = (Claims) authentication.getDetails();

        String name = getClaimAsString(claims, "name");
        String email = getClaimAsString(claims, "email");
        String phoneNumber = getClaimAsString(claims, "phone_number");
        boolean emailVerified = Boolean.TRUE.equals(claims.get("email_verified", Boolean.class));
        boolean phoneVerified = Boolean.TRUE.equals(claims.get("phone_number_verified", Boolean.class));

        currentUser.setName(name != null ? name : currentUser.getName());
        if (email != null) currentUser.setEmailVerified(emailVerified);
        if (phoneNumber != null) {
            currentUser.setPhoneNumber(phoneNumber);
            currentUser.setPhoneVerified(phoneVerified);
        }

        return userRepository.save(currentUser);
    }

    /**
     * Creates a new user record from Clerk JWT claims.
     * Used when a Clerk user exists but has no local DB record yet.
     */
    @Transactional
    public User createFromClaims(String clerkId, Claims claims) {
        User user = User.builder()
                .clerkId(clerkId)
                .name(getClaimAsString(claims, "name"))
                .phoneNumber(getClaimAsString(claims, "phone_number"))
                .phoneVerified(Boolean.TRUE.equals(claims.get("phone_number_verified", Boolean.class)))
                .emailVerified(Boolean.TRUE.equals(claims.get("email_verified", Boolean.class)))
                .build();
        log.info("Creating new user for Clerk ID: {}", clerkId);
        return userRepository.save(user);
    }

    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof User)) {
            throw new RuntimeException("No authenticated user found");
        }
        return (User) auth.getPrincipal();
    }

    private String getClaimAsString(Claims claims, String key) {
        Object value = claims.get(key);
        return value != null ? value.toString() : null;
    }
}
