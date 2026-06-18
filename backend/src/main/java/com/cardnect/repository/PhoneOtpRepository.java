package com.cardnect.repository;

import com.cardnect.config.AppwriteClient;
import com.cardnect.model.entity.PhoneOtp;
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
public class PhoneOtpRepository {

    private final AppwriteClient appwriteClient;
    private static final String COLLECTION_ID = "phone_otps";

    public Optional<PhoneOtp> findByPhone(String phone) {
        if (phone == null) return Optional.empty();
        List<Map<String, Object>> docs = appwriteClient.listDocuments(
                COLLECTION_ID,
                List.of(AppwriteQuery.equal("phone", phone))
        );
        if (docs.isEmpty()) return Optional.empty();
        return Optional.of(AppwriteMapper.toPhoneOtp(docs.get(0)));
    }

    public void deleteByPhone(String phone) {
        if (phone == null) return;
        List<Map<String, Object>> docs = appwriteClient.listDocuments(
                COLLECTION_ID,
                List.of(AppwriteQuery.equal("phone", phone))
        );
        for (Map<String, Object> doc : docs) {
            String docId = (String) doc.get("$id");
            appwriteClient.deleteDocument(COLLECTION_ID, docId);
        }
    }

    public PhoneOtp save(PhoneOtp phoneOtp) {
        if (phoneOtp.getId() == null) {
            phoneOtp.setId(UUID.randomUUID());
            phoneOtp.setCreatedAt(LocalDateTime.now());
            Map<String, Object> data = AppwriteMapper.toPhoneOtpMap(phoneOtp);
            appwriteClient.createDocument(COLLECTION_ID, phoneOtp.getId().toString(), data);
        } else {
            Map<String, Object> data = AppwriteMapper.toPhoneOtpMap(phoneOtp);
            appwriteClient.updateDocument(COLLECTION_ID, phoneOtp.getId().toString(), data);
        }
        return phoneOtp;
    }

    public PhoneOtp saveAndFlush(PhoneOtp phoneOtp) {
        return save(phoneOtp);
    }
}
