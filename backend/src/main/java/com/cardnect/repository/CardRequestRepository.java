package com.cardnect.repository;

import com.cardnect.config.AppwriteClient;
import com.cardnect.model.entity.CardListing;
import com.cardnect.model.entity.CardRequest;
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
public class CardRequestRepository {

    private final AppwriteClient appwriteClient;
    private final CardListingRepository cardListingRepository;
    private final UserRepository userRepository;
    private static final String COLLECTION_ID = "card_requests";

    private CardRequest mapToEntity(Map<String, Object> doc) {
        String listingIdStr = (String) doc.get("listingId");
        String requesterIdStr = (String) doc.get("requesterId");

        CardListing listing = null;
        if (listingIdStr != null) {
            listing = cardListingRepository.findById(UUID.fromString(listingIdStr)).orElse(null);
        }

        User requester = null;
        if (requesterIdStr != null) {
            requester = userRepository.findById(UUID.fromString(requesterIdStr)).orElse(null);
        }

        return AppwriteMapper.toCardRequest(doc, listing, requester);
    }

    public Optional<CardRequest> findById(UUID id) {
        if (id == null) return Optional.empty();
        return appwriteClient.getDocument(COLLECTION_ID, id.toString())
                .map(this::mapToEntity);
    }

    public List<CardRequest> findByRequesterId(UUID requesterId) {
        if (requesterId == null) return List.of();
        List<Map<String, Object>> docs = appwriteClient.listDocuments(
                COLLECTION_ID,
                List.of(AppwriteQuery.equal("requesterId", requesterId))
        );
        return docs.stream()
                .map(this::mapToEntity)
                .collect(Collectors.toList());
    }

    public List<CardRequest> findIncomingRequestsByHolderId(UUID holderId) {
        if (holderId == null) return List.of();

        // Step 1: Find listings of the holder
        List<CardListing> listings = cardListingRepository.findByUserId(holderId);
        if (listings.isEmpty()) {
            return List.of();
        }

        List<String> listingIds = listings.stream()
                .map(l -> l.getId().toString())
                .collect(Collectors.toList());

        // Step 2: Fetch requests matching these listings, sorted by createdAt desc
        List<Map<String, Object>> docs = appwriteClient.listDocuments(
                COLLECTION_ID,
                List.of(
                        AppwriteQuery.equal("listingId", listingIds),
                        AppwriteQuery.orderDesc("createdAt")
                )
        );

        return docs.stream()
                .map(this::mapToEntity)
                .collect(Collectors.toList());
    }

    public void deleteByListingId(UUID listingId) {
        if (listingId == null) return;
        // Fetch all requests for this listing
        List<Map<String, Object>> docs = appwriteClient.listDocuments(
                COLLECTION_ID,
                List.of(AppwriteQuery.equal("listingId", listingId))
        );
        // Batch delete
        for (Map<String, Object> doc : docs) {
            String docId = (String) doc.get("$id");
            appwriteClient.deleteDocument(COLLECTION_ID, docId);
        }
    }

    public CardRequest save(CardRequest request) {
        if (request.getId() == null) {
            request.setId(UUID.randomUUID());
            request.setCreatedAt(LocalDateTime.now());
            request.setUpdatedAt(LocalDateTime.now());
            Map<String, Object> data = AppwriteMapper.toCardRequestMap(request);
            appwriteClient.createDocument(COLLECTION_ID, request.getId().toString(), data);
        } else {
            request.setUpdatedAt(LocalDateTime.now());
            Map<String, Object> data = AppwriteMapper.toCardRequestMap(request);
            appwriteClient.updateDocument(COLLECTION_ID, request.getId().toString(), data);
        }
        return request;
    }

    public void delete(CardRequest request) {
        if (request != null && request.getId() != null) {
            appwriteClient.deleteDocument(COLLECTION_ID, request.getId().toString());
        }
    }
}
