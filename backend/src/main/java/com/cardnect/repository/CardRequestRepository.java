package com.cardnect.repository;

import com.cardnect.model.entity.CardRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CardRequestRepository extends JpaRepository<CardRequest, UUID> {
    List<CardRequest> findByRequesterId(UUID requesterId);

    @Query("SELECT cr FROM CardRequest cr WHERE cr.listing.user.id = :holderId ORDER BY cr.createdAt DESC")
    List<CardRequest> findIncomingRequestsByHolderId(UUID holderId);

    @Modifying
    @Query("DELETE FROM CardRequest cr WHERE cr.listing.id = :listingId")
    void deleteByListingId(UUID listingId);
}
