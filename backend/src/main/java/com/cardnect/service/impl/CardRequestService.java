package com.cardnect.service.impl;

import com.cardnect.model.dto.request.CreateRequestDto;
import com.cardnect.model.dto.response.CardRequestResponse;
import com.cardnect.model.entity.CardListing;
import com.cardnect.model.entity.CardRequest;
import com.cardnect.model.entity.Notification;
import com.cardnect.model.entity.User;
import com.cardnect.model.enums.RequestStatus;
import com.cardnect.repository.CardListingRepository;
import com.cardnect.repository.CardRequestRepository;
import com.cardnect.repository.NotificationRepository;
import com.cardnect.websocket.WebSocketNotificationService;
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
public class CardRequestService {

    private final CardRequestRepository requestRepository;
    private final CardListingRepository listingRepository;
    private final NotificationRepository notificationRepository;
    private final WebSocketNotificationService wsNotificationService;
    private final WhatsAppService whatsAppService;

    @Transactional
    public CardRequestResponse createRequest(User requester, CreateRequestDto dto) {
        if (!requester.isFullyVerified()) {
            throw new AccessDeniedException("You must verify your phone and email before sending card requests.");
        }

        CardListing listing = listingRepository.findById(dto.getListingId())
                .filter(CardListing::isActive)
                .orElseThrow(() -> new RuntimeException("Card listing not found or inactive"));

        if (listing.getUser().getId().equals(requester.getId())) {
            throw new AccessDeniedException("You cannot request your own card listing.");
        }

        CardRequest request = CardRequest.builder()
                .listing(listing)
                .requester(requester)
                .offerDetails(dto.getOfferDetails())
                .status(RequestStatus.PENDING)
                .build();

        request = requestRepository.save(request);

        String holderName = listing.getUser().getName() != null ? listing.getUser().getName() : "Card Holder";
        String requesterName = requester.getName() != null ? requester.getName() : "A verified user";
        String commissionStr = listing.getCommissionPercentage() + "%";
        String reqId = request.getId().toString();

        String waMessage = String.format("""
                🪪 *New Card Request — Cardnect*
                
                Hi %s! Someone wants to use your card.
                
                💳 *Card:* %s (••••%s)
                🏦 *Bank:* %s
                💰 *Commission:* %s
                
                👤 *Requester:* %s
                
                Reply *ACCEPT_%s* to accept
                Reply *DECLINE_%s* to decline
                
                You have 24 hours to respond.
                — Team Cardnect
                """, 
                holderName, 
                listing.getCardType() + " " + listing.getCardNetwork(), 
                listing.getMaskedNumber(), 
                listing.getBankName(), 
                commissionStr, 
                requesterName, 
                reqId, 
                reqId);
                
        if (listing.getUser().getPhone() != null && !listing.getUser().getPhone().isBlank()) {
            whatsAppService.sendTextMessage(listing.getUser().getPhone(), waMessage);
        }

        String message = String.format(
                "New card request from %s for '%s' on your %s %s.",
                requester.getName() != null ? requester.getName() : requester.getEmail(),
                dto.getOfferDetails(),
                listing.getBankName(),
                listing.getCardType()
        );

        Notification notification = Notification.builder()
                .user(listing.getUser())
                .request(request)
                .message(message)
                .build();
        notificationRepository.save(notification);

        wsNotificationService.sendNotification(listing.getUser().getId().toString(), notification);

        log.info("Card request created: {} -> listing {}", requester.getId(), listing.getId());
        return toResponse(request, false);
    }

    public List<CardRequestResponse> getMyRequests(User requester) {
        return requestRepository.findByRequesterId(requester.getId()).stream()
                .map(r -> toResponse(r, false))
                .toList();
    }

    public List<CardRequestResponse> getIncomingRequests(User holder) {
        return requestRepository.findIncomingRequestsByHolderId(holder.getId()).stream()
                .map(r -> toResponse(r, true))
                .toList();
    }

    @Transactional
    public CardRequestResponse updateStatus(User holder, UUID requestId, String statusStr) {
        RequestStatus newStatus = RequestStatus.valueOf(statusStr.toUpperCase());
        CardRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!request.getListing().getUser().getId().equals(holder.getId())) {
            throw new AccessDeniedException("Not authorized to update this request");
        }

        request.setStatus(newStatus);
        return toResponse(requestRepository.save(request), true);
    }

    private CardRequestResponse toResponse(CardRequest r, boolean includePhone) {
        return CardRequestResponse.builder()
                .id(r.getId())
                .listingId(r.getListing().getId())
                .listingBankName(r.getListing().getBankName())
                .listingCardType(r.getListing().getCardType())
                .listingCardNetwork(r.getListing().getCardNetwork())
                .requesterName(r.getRequester().getName())
                .requesterPhone(includePhone ? r.getRequester().getPhone() : null)
                .status(r.getStatus())
                .offerDetails(r.getOfferDetails())
                .createdAt(r.getCreatedAt())
                .build();
    }

    @Transactional
    public void handleWebhookResponse(String requestIdStr, String action, String fromPhone) {
        try {
            UUID requestId = UUID.fromString(requestIdStr.trim());
            CardRequest request = requestRepository.findById(requestId).orElse(null);
            
            if (request == null || request.getStatus() != RequestStatus.PENDING) {
                return; // Already processed or invalid
            }
            
            // Verify phone number belongs to the card holder
            User holder = request.getListing().getUser();
            String holderPhone = holder.getPhone();
            if (holderPhone == null || !holderPhone.replaceAll("[^0-9]", "").equals(fromPhone.replaceAll("[^0-9]", ""))) {
                log.warn("Unauthorized webhook reply from {} for request {}", fromPhone, requestId);
                return;
            }

            if ("ACCEPT".equalsIgnoreCase(action)) {
                request.setStatus(RequestStatus.ACCEPTED);
                
                String reqName = request.getRequester().getName() != null ? request.getRequester().getName() : "Requester";
                String reqPhone = request.getRequester().getPhone() != null ? request.getRequester().getPhone() : "Not provided";
                String reqEmail = request.getRequester().getEmail();
                
                String msg = String.format("""
                        ✅ *Request Accepted!*
                        
                        Here are the requester's details:
                        
                        👤 Name: %s
                        📱 Phone: %s
                        📧 Email: %s
                        
                        Contact them now to complete the deal!
                        — Team Cardnect
                        """, reqName, reqPhone, reqEmail);
                        
                whatsAppService.sendTextMessage(holderPhone, msg);
                
            } else if ("DECLINE".equalsIgnoreCase(action)) {
                request.setStatus(RequestStatus.REJECTED);
                
                String reqMsg = String.format("❌ Your request for %s was declined. Browse other available cards on Cardnect.", 
                        request.getListing().getBankName());
                        
                Notification n = Notification.builder()
                        .user(request.getRequester())
                        .request(request)
                        .message(reqMsg)
                        .build();
                notificationRepository.save(n);
                wsNotificationService.sendNotification(request.getRequester().getId().toString(), n);
            }
            
            requestRepository.save(request);
            log.info("Request {} marked as {}", requestId, action);
        } catch (Exception e) {
            log.error("Failed to process webhook response: {}", e.getMessage());
        }
    }
}
