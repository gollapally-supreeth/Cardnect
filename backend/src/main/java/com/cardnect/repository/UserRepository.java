package com.cardnect.repository;

import com.cardnect.config.AppwriteClient;
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

@Repository
@RequiredArgsConstructor
public class UserRepository {

    private final AppwriteClient appwriteClient;
    private static final String COLLECTION_ID = "users";

    public Optional<User> findById(UUID id) {
        if (id == null) return Optional.empty();
        return appwriteClient.getDocument(COLLECTION_ID, id.toString())
                .map(AppwriteMapper::toUser);
    }

    public Optional<User> findByEmail(String email) {
        if (email == null) return Optional.empty();
        List<Map<String, Object>> docs = appwriteClient.listDocuments(
                COLLECTION_ID,
                List.of(AppwriteQuery.equal("email", email))
        );
        if (docs.isEmpty()) {
            return Optional.empty();
        }
        return Optional.of(AppwriteMapper.toUser(docs.get(0)));
    }

    public boolean existsByEmail(String email) {
        return findByEmail(email).isPresent();
    }

    public User save(User user) {
        user.updateVerificationFlag();
        if (user.getId() == null) {
            user.setId(UUID.randomUUID());
            user.setCreatedAt(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());
            Map<String, Object> data = AppwriteMapper.toUserMap(user);
            appwriteClient.createDocument(COLLECTION_ID, user.getId().toString(), data);
        } else {
            user.setUpdatedAt(LocalDateTime.now());
            Map<String, Object> data = AppwriteMapper.toUserMap(user);
            appwriteClient.updateDocument(COLLECTION_ID, user.getId().toString(), data);
        }
        return user;
    }

    public void delete(User user) {
        if (user != null && user.getId() != null) {
            appwriteClient.deleteDocument(COLLECTION_ID, user.getId().toString());
        }
    }
}
