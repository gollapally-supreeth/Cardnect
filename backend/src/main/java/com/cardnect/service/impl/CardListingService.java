package com.cardnect.service.impl;

import com.cardnect.model.dto.request.CreateListingRequest;
import com.cardnect.model.dto.response.CardListingResponse;
import com.cardnect.model.entity.CardListing;
import com.cardnect.model.entity.User;
import com.cardnect.repository.CardListingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CardListingService {

    private final CardListingRepository listingRepository;

    public List<CardListingResponse> getActiveListings() {
        return listingRepository.findByActiveTrue().stream()
                .map(this::toResponse)
                .toList();
    }

    public List<CardListingResponse> getMyListings(User user) {
        return listingRepository.findByUserId(user.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public CardListingResponse createListing(User user, CreateListingRequest req) {
        CardListing listing = CardListing.builder()
                .user(user)
                .bankName(req.getBankName())
                .cardNetwork(req.getCardNetwork())
                .cardType(req.getCardType())
                .maskedNumber(req.getMaskedNumber()) // 4 digits, enforced by DTO validation
                .commissionPercentage(req.getCommissionPercentage())
                .active(true)
                .build();
        return toResponse(listingRepository.save(listing));
    }

    @Transactional
    public CardListingResponse updateListing(User user, UUID listingId, CreateListingRequest req) {
        CardListing listing = listingRepository.findByIdAndUserId(listingId, user.getId())
                .orElseThrow(() -> new AccessDeniedException("Listing not found or not owned by you"));

        listing.setBankName(req.getBankName());
        listing.setCardNetwork(req.getCardNetwork());
        listing.setCardType(req.getCardType());
        listing.setMaskedNumber(req.getMaskedNumber());
        listing.setCommissionPercentage(req.getCommissionPercentage());

        return toResponse(listingRepository.save(listing));
    }

    @Transactional
    public void deleteListing(User user, UUID listingId) {
        CardListing listing = listingRepository.findByIdAndUserId(listingId, user.getId())
                .orElseThrow(() -> new AccessDeniedException("Listing not found or not owned by you"));
        listing.setActive(false);
        listingRepository.save(listing);
    }

    private CardListingResponse toResponse(CardListing l) {
        String formatted = "XXXX XXXX XXXX " + l.getMaskedNumber();
        return CardListingResponse.builder()
                .id(l.getId())
                .bankName(l.getBankName())
                .cardNetwork(l.getCardNetwork())
                .cardType(l.getCardType())
                .maskedNumber(formatted)
                .commissionPercentage(l.getCommissionPercentage())
                .active(l.isActive())
                .holderName(l.getUser().getName())
                .createdAt(l.getCreatedAt())
                .build();
    }
}
