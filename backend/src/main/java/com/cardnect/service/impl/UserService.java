package com.cardnect.service.impl;

import com.cardnect.model.entity.User;
import com.cardnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof User user)) {
            throw new RuntimeException("No authenticated user found");
        }
        return user;
    }

    public User updatePhone(User user, String phone) {
        user.setPhone(phone);
        user.setPhoneVerified(phone != null && !phone.isBlank());
        return userRepository.save(user);
    }
}
