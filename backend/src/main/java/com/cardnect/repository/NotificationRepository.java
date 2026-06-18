package com.cardnect.repository;

import com.cardnect.config.AppwriteClient;
import com.cardnect.model.entity.CardRequest;
import com.cardnect.model.entity.Notification;
import com.cardnect.model.entity.User;
import com.cardnect.util.AppwriteMapper;
import com.cardnect.util.AppwriteQuery;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class NotificationRepository {

    private final AppwriteClient appwriteClient;
    private final UserRepository userRepository;
    private final CardRequestRepository cardRequestRepository;
    private static final String COLLECTION_ID = "notifications";

    private Notification mapToEntity(Map<String, Object> doc) {
        String userIdStr = (String) doc.get("userId");
        String requestIdStr = (String) doc.get("requestId");

        User user = null;
        if (userIdStr != null) {
            user = userRepository.findById(UUID.fromString(userIdStr)).orElse(null);
        }

        CardRequest request = null;
        if (requestIdStr != null) {
            request = cardRequestRepository.findById(UUID.fromString(requestIdStr)).orElse(null);
        }

        return AppwriteMapper.toNotification(doc, user, request);
    }

    public Optional<Notification> findById(UUID id) {
        if (id == null) return Optional.empty();
        return appwriteClient.getDocument(COLLECTION_ID, id.toString())
                .map(this::mapToEntity);
    }

    public List<Notification> findByUserIdOrderByCreatedAtDesc(UUID userId) {
        if (userId == null) return List.of();
        List<Map<String, Object>> docs = appwriteClient.listDocuments(
                COLLECTION_ID,
                List.of(
                        AppwriteQuery.equal("userId", userId),
                        AppwriteQuery.orderDesc("createdAt")
                )
        );
        return docs.stream()
                .map(this::mapToEntity)
                .collect(Collectors.toList());
    }

    public int markAllReadByUserId(UUID userId) {
        if (userId == null) return 0;
        // Fetch all unread notifications for the user
        List<Map<String, Object>> docs = appwriteClient.listDocuments(
                COLLECTION_ID,
                List.of(
                        AppwriteQuery.equal("userId", userId),
                        AppwriteQuery.equal("isRead", false)
                )
        );

        int updatedCount = 0;
        for (Map<String, Object> doc : docs) {
            String docId = (String) doc.get("$id");
            Map<String, Object> updates = Map.of("isRead", true);
            appwriteClient.updateDocument(COLLECTION_ID, docId, updates);
            updatedCount++;
        }
        return updatedCount;
    }

    public Notification save(Notification notification) {
        if (notification.getId() == null) {
            notification.setId(UUID.randomUUID());
            notification.setCreatedAt(LocalDateTime.now());
            Map<String, Object> data = AppwriteMapper.toNotificationMap(notification);
            appwriteClient.createDocument(COLLECTION_ID, notification.getId().toString(), data);
        } else {
            Map<String, Object> data = AppwriteMapper.toNotificationMap(notification);
            appwriteClient.updateDocument(COLLECTION_ID, notification.getId().toString(), data);
        }
        return notification;
    }

    public void delete(Notification notification) {
        if (notification != null && notification.getId() != null) {
            appwriteClient.deleteDocument(COLLECTION_ID, notification.getId().toString());
        }
    }
}
