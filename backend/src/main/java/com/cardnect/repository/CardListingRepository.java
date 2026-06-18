package com.cardnect.repository;

import com.cardnect.config.AppwriteClient;
import com.cardnect.model.entity.CardListing;
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
public class CardListingRepository {

    private final AppwriteClient appwriteClient;
    private final UserRepository userRepository;
    private static final String COLLECTION_ID = "card_listings";

    private CardListing mapToEntity(Map<String, Object> doc) {
        String userIdStr = (String) doc.get("userId");
        User user = null;
        if (userIdStr != null) {
            user = userRepository.findById(UUID.fromString(userIdStr)).orElse(null);
        }
        return AppwriteMapper.toCardListing(doc, user);
    }

    public Optional<CardListing> findById(UUID id) {
        if (id == null) return Optional.empty();
        return appwriteClient.getDocument(COLLECTION_ID, id.toString())
                .map(this::mapToEntity);
    }

    public List<CardListing> findByActiveTrue() {
        List<Map<String, Object>> docs = appwriteClient.listDocuments(
                COLLECTION_ID,
                List.of(AppwriteQuery.equal("isActive", true))
        );
        return docs.stream()
                .map(this::mapToEntity)
                .collect(Collectors.toList());
    }

    public List<CardListing> findByUserId(UUID userId) {
        if (userId == null) return List.of();
        List<Map<String, Object>> docs = appwriteClient.listDocuments(
                COLLECTION_ID,
                List.of(AppwriteQuery.equal("userId", userId))
        );
        return docs.stream()
                .map(this::mapToEntity)
                .collect(Collectors.toList());
    }

    public Optional<CardListing> findByIdAndUserId(UUID id, UUID userId) {
        if (id == null || userId == null) return Optional.empty();
        List<Map<String, Object>> docs = appwriteClient.listDocuments(
                COLLECTION_ID,
                List.of(
                        AppwriteQuery.equal("$id", id.toString()),
                        AppwriteQuery.equal("userId", userId)
                )
        );
        if (docs.isEmpty()) return Optional.empty();
        return Optional.of(mapToEntity(docs.get(0)));
    }

    public CardListing save(CardListing listing) {
        if (listing.getId() == null) {
            listing.setId(UUID.randomUUID());
            listing.setCreatedAt(LocalDateTime.now());
            listing.setUpdatedAt(LocalDateTime.now());
            Map<String, Object> data = AppwriteMapper.toCardListingMap(listing);
            appwriteClient.createDocument(COLLECTION_ID, listing.getId().toString(), data);
        } else {
            listing.setUpdatedAt(LocalDateTime.now());
            Map<String, Object> data = AppwriteMapper.toCardListingMap(listing);
            appwriteClient.updateDocument(COLLECTION_ID, listing.getId().toString(), data);
        }
        return listing;
    }

    public void delete(CardListing listing) {
        if (listing != null && listing.getId() != null) {
            appwriteClient.deleteDocument(COLLECTION_ID, listing.getId().toString());
        }
    }
}
