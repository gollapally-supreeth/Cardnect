package com.cardnect.util;

import com.cardnect.model.entity.*;
import com.cardnect.model.enums.RequestStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class AppwriteMapper {

    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_DATE_TIME;

    public static LocalDateTime parseDateTime(String value) {
        if (value == null || value.isEmpty()) return null;
        try {
            return java.time.OffsetDateTime.parse(value).atZoneSameInstant(ZoneId.systemDefault()).toLocalDateTime();
        } catch (Exception e) {
            try {
                return LocalDateTime.parse(value, ISO_FORMATTER);
            } catch (Exception ex) {
                try {
                    return java.time.Instant.parse(value).atZone(ZoneId.systemDefault()).toLocalDateTime();
                } catch (Exception ex2) {
                    return null;
                }
            }
        }
    }

    public static String formatDateTime(LocalDateTime value) {
        if (value == null) return null;
        return value.atZone(ZoneId.systemDefault()).withZoneSameInstant(ZoneOffset.UTC).format(DateTimeFormatter.ISO_INSTANT);
    }

    public static User toUser(Map<String, Object> map) {
        if (map == null) return null;
        return User.builder()
                .id(UUID.fromString((String) map.get("$id")))
                .email((String) map.get("email"))
                .name((String) map.get("name"))
                .phone((String) map.get("phone"))
                .passwordHash((String) map.get("passwordHash"))
                .phoneVerified(Boolean.TRUE.equals(map.get("phoneVerified")))
                .emailVerified(Boolean.TRUE.equals(map.get("emailVerified")))
                .verifiedUser(Boolean.TRUE.equals(map.get("verifiedUser")))
                .createdAt(parseDateTime((String) map.get("createdAt")))
                .updatedAt(parseDateTime((String) map.get("updatedAt")))
                .build();
    }

    public static Map<String, Object> toUserMap(User user) {
        Map<String, Object> map = new HashMap<>();
        map.put("email", user.getEmail());
        map.put("name", user.getName());
        map.put("phone", user.getPhone());
        map.put("passwordHash", user.getPasswordHash());
        map.put("phoneVerified", user.isPhoneVerified());
        map.put("emailVerified", user.isEmailVerified());
        map.put("verifiedUser", user.isVerifiedUser());
        map.put("createdAt", formatDateTime(user.getCreatedAt()));
        map.put("updatedAt", formatDateTime(user.getUpdatedAt()));
        return map;
    }

    public static CardListing toCardListing(Map<String, Object> map, User user) {
        if (map == null) return null;
        Number comm = (Number) map.get("commissionPercentage");
        BigDecimal commission = comm != null ? BigDecimal.valueOf(comm.doubleValue()) : BigDecimal.ZERO;

        return CardListing.builder()
                .id(UUID.fromString((String) map.get("$id")))
                .user(user)
                .bankName((String) map.get("bankName"))
                .cardName((String) map.get("cardName"))
                .cardNetwork((String) map.get("cardNetwork"))
                .cardType((String) map.get("cardType"))
                .maskedNumber((String) map.get("maskedNumber"))
                .commissionPercentage(commission)
                .active(Boolean.TRUE.equals(map.get("isActive")))
                .createdAt(parseDateTime((String) map.get("createdAt")))
                .updatedAt(parseDateTime((String) map.get("updatedAt")))
                .build();
    }

    public static Map<String, Object> toCardListingMap(CardListing listing) {
        Map<String, Object> map = new HashMap<>();
        map.put("userId", listing.getUser().getId().toString());
        map.put("bankName", listing.getBankName());
        map.put("cardName", listing.getCardName());
        map.put("cardNetwork", listing.getCardNetwork());
        map.put("cardType", listing.getCardType());
        map.put("maskedNumber", listing.getMaskedNumber());
        map.put("commissionPercentage", listing.getCommissionPercentage() != null ? listing.getCommissionPercentage().doubleValue() : 0.0);
        map.put("isActive", listing.isActive());
        map.put("createdAt", formatDateTime(listing.getCreatedAt()));
        map.put("updatedAt", formatDateTime(listing.getUpdatedAt()));
        return map;
    }

    public static CardRequest toCardRequest(Map<String, Object> map, CardListing listing, User requester) {
        if (map == null) return null;
        String statusStr = (String) map.get("status");
        RequestStatus status = statusStr != null ? RequestStatus.valueOf(statusStr) : RequestStatus.PENDING;

        return CardRequest.builder()
                .id(UUID.fromString((String) map.get("$id")))
                .listing(listing)
                .requester(requester)
                .status(status)
                .offerDetails((String) map.get("offerDetails"))
                .createdAt(parseDateTime((String) map.get("createdAt")))
                .updatedAt(parseDateTime((String) map.get("updatedAt")))
                .build();
    }

    public static Map<String, Object> toCardRequestMap(CardRequest request) {
        Map<String, Object> map = new HashMap<>();
        map.put("listingId", request.getListing().getId().toString());
        map.put("requesterId", request.getRequester().getId().toString());
        map.put("status", request.getStatus().name());
        map.put("offerDetails", request.getOfferDetails());
        map.put("createdAt", formatDateTime(request.getCreatedAt()));
        map.put("updatedAt", formatDateTime(request.getUpdatedAt()));
        return map;
    }

    public static Notification toNotification(Map<String, Object> map, User user, CardRequest request) {
        if (map == null) return null;
        return Notification.builder()
                .id(UUID.fromString((String) map.get("$id")))
                .user(user)
                .request(request)
                .message((String) map.get("message"))
                .read(Boolean.TRUE.equals(map.get("isRead")))
                .createdAt(parseDateTime((String) map.get("createdAt")))
                .build();
    }

    public static Map<String, Object> toNotificationMap(Notification notification) {
        Map<String, Object> map = new HashMap<>();
        map.put("userId", notification.getUser().getId().toString());
        map.put("requestId", notification.getRequest() != null ? notification.getRequest().getId().toString() : null);
        map.put("message", notification.getMessage());
        map.put("isRead", notification.isRead());
        map.put("createdAt", formatDateTime(notification.getCreatedAt()));
        return map;
    }

    public static OtpCode toOtpCode(Map<String, Object> map) {
        if (map == null) return null;
        return OtpCode.builder()
                .id(UUID.fromString((String) map.get("$id")))
                .email((String) map.get("email"))
                .otpCode((String) map.get("otpCode"))
                .expiresAt(parseDateTime((String) map.get("expiresAt")))
                .createdAt(parseDateTime((String) map.get("createdAt")))
                .build();
    }

    public static Map<String, Object> toOtpCodeMap(OtpCode otpCode) {
        Map<String, Object> map = new HashMap<>();
        map.put("email", otpCode.getEmail());
        map.put("otpCode", otpCode.getOtpCode());
        map.put("expiresAt", formatDateTime(otpCode.getExpiresAt()));
        map.put("createdAt", formatDateTime(otpCode.getCreatedAt()));
        return map;
    }

    public static PhoneOtp toPhoneOtp(Map<String, Object> map) {
        if (map == null) return null;
        Number att = (Number) map.get("attempts");
        int attempts = att != null ? att.intValue() : 0;

        return PhoneOtp.builder()
                .id(UUID.fromString((String) map.get("$id")))
                .phone((String) map.get("phone"))
                .otpCode((String) map.get("otpCode"))
                .attempts(attempts)
                .createdAt(parseDateTime((String) map.get("createdAt")))
                .expiresAt(parseDateTime((String) map.get("expiresAt")))
                .build();
    }

    public static Map<String, Object> toPhoneOtpMap(PhoneOtp phoneOtp) {
        Map<String, Object> map = new HashMap<>();
        map.put("phone", phoneOtp.getPhone());
        map.put("otpCode", phoneOtp.getOtpCode());
        map.put("attempts", phoneOtp.getAttempts());
        map.put("createdAt", formatDateTime(phoneOtp.getCreatedAt()));
        map.put("expiresAt", formatDateTime(phoneOtp.getExpiresAt()));
        return map;
    }
}
