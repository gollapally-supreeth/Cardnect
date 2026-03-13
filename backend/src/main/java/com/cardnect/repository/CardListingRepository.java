package com.cardnect.repository;

import com.cardnect.model.entity.CardListing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CardListingRepository extends JpaRepository<CardListing, UUID> {
    List<CardListing> findByActiveTrue();
    List<CardListing> findByUserId(UUID userId);
    Optional<CardListing> findByIdAndUserId(UUID id, UUID userId);
}
