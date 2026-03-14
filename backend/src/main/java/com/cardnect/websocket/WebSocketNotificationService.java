package com.cardnect.websocket;

import com.cardnect.model.dto.response.NotificationResponse;
import com.cardnect.model.entity.Notification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

/**
 * Sends real-time WebSocket notifications to specific users.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class WebSocketNotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public void sendNotification(String userChannelKey, Notification notification) {
        NotificationResponse response = NotificationResponse.builder()
                .id(notification.getId())
                .message(notification.getMessage())
                .read(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();

        try {
            messagingTemplate.convertAndSendToUser(userChannelKey, "/queue/notifications", response);
            log.debug("Sent WebSocket notification to user: {}", userChannelKey);
        } catch (Exception e) {
            log.warn("Failed to send WebSocket notification to {}: {}", userChannelKey, e.getMessage());
        }
    }
}
