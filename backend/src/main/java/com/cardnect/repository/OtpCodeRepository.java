package com.cardnect.repository;

import com.cardnect.config.AppwriteClient;
import com.cardnect.model.entity.OtpCode;
import com.cardnect.util.AppwriteMapper;
import com.cardnect.util.AppwriteQuery;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class OtpCodeRepository {

    private final AppwriteClient appwriteClient;
    private static final String COLLECTION_ID = "otp_codes";

    public Optional<OtpCode> findTopByEmailOrderByCreatedAtDesc(String email) {
        if (email == null) return Optional.empty();
        List<Map<String, Object>> docs = appwriteClient.listDocuments(
                COLLECTION_ID,
                List.of(
                        AppwriteQuery.equal("email", email),
                        AppwriteQuery.orderDesc("createdAt"),
                        AppwriteQuery.limit(1)
                )
        );
        if (docs.isEmpty()) return Optional.empty();
        return Optional.of(AppwriteMapper.toOtpCode(docs.get(0)));
    }

    public void deleteByEmail(String email) {
        if (email == null) return;
        List<Map<String, Object>> docs = appwriteClient.listDocuments(
                COLLECTION_ID,
                List.of(AppwriteQuery.equal("email", email))
        );
        for (Map<String, Object> doc : docs) {
            String docId = (String) doc.get("$id");
            appwriteClient.deleteDocument(COLLECTION_ID, docId);
        }
    }

    public OtpCode save(OtpCode otpCode) {
        if (otpCode.getId() == null) {
            otpCode.setId(UUID.randomUUID());
            Map<String, Object> data = AppwriteMapper.toOtpCodeMap(otpCode);
            appwriteClient.createDocument(COLLECTION_ID, otpCode.getId().toString(), data);
        } else {
            Map<String, Object> data = AppwriteMapper.toOtpCodeMap(otpCode);
            appwriteClient.updateDocument(COLLECTION_ID, otpCode.getId().toString(), data);
        }
        return otpCode;
    }
}
