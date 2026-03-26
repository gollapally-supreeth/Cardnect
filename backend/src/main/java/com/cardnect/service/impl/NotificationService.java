package com.cardnect.service.impl;

import com.cardnect.model.dto.response.NotificationResponse;
import com.cardnect.model.entity.Notification;
import com.cardnect.model.entity.User;
import com.cardnect.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public List<NotificationResponse> getForUser(User user) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public void markRead(User user, UUID notifId) {
        Notification n = notificationRepository.findById(notifId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        if (!n.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Not your notification");
        }
        n.setRead(true);
        notificationRepository.save(n);
    }

    @Transactional
    public void markAllRead(User user) {
        notificationRepository.markAllReadByUserId(user.getId());
    }

    private NotificationResponse toResponse(Notification n) {
        NotificationResponse res = NotificationResponse.builder()
                .id(n.getId())
                .message(n.getMessage())
                .read(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
                
        if (n.getRequest() != null) {
            res.setRequestId(n.getRequest().getId());
            res.setRequestStatus(n.getRequest().getStatus().name());
            res.setRequesterName(n.getRequest().getRequester().getName());
            res.setRequesterPhone(n.getRequest().getRequester().getPhone());
        }
        
        return res;
    }
}
