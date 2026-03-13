package com.cardnect.security;

import io.jsonwebtoken.JwsHeader;
import io.jsonwebtoken.Jwts;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.math.BigInteger;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.spec.RSAPublicKeySpec;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Fetches and caches public keys from Clerk's JWKS endpoint.
 * Public keys are cached by key ID (kid) to avoid repeated HTTP calls.
 */
@Component
@Slf4j
public class ClerkJwksKeyProvider {

    @Value("${clerk.jwks-url:https://api.clerk.com/v1/jwks}")
    private String jwksUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final Map<String, PublicKey> keyCache = new ConcurrentHashMap<>();

    public PublicKey getPublicKey(String token) throws Exception {
        // Extract key id (kid) from JWT header without verifying
        String kid = extractKid(token);

        if (kid != null && keyCache.containsKey(kid)) {
            return keyCache.get(kid);
        }

        // Fetch JWKS
        refreshKeys();

        if (kid != null && keyCache.containsKey(kid)) {
            return keyCache.get(kid);
        }

        // Return first key if no kid match
        if (!keyCache.isEmpty()) {
            return keyCache.values().iterator().next();
        }

        throw new Exception("No public key found in JWKS");
    }

    private void refreshKeys() throws Exception {
        log.debug("Fetching JWKS from: {}", jwksUrl);
        @SuppressWarnings("unchecked")
        Map<String, Object> jwks = restTemplate.getForObject(jwksUrl, Map.class);
        if (jwks == null) throw new Exception("JWKS response is null");

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> keys = (List<Map<String, Object>>) jwks.get("keys");
        if (keys == null) throw new Exception("No keys in JWKS");

        for (Map<String, Object> key : keys) {
            String keyId = (String) key.get("kid");
            String n = (String) key.get("n");
            String e = (String) key.get("e");
            PublicKey publicKey = buildRsaPublicKey(n, e);
            if (keyId != null) {
                keyCache.put(keyId, publicKey);
            }
        }
    }

    private PublicKey buildRsaPublicKey(String n, String e) throws Exception {
        byte[] nBytes = Base64.getUrlDecoder().decode(n);
        byte[] eBytes = Base64.getUrlDecoder().decode(e);
        BigInteger modulus = new BigInteger(1, nBytes);
        BigInteger exponent = new BigInteger(1, eBytes);
        RSAPublicKeySpec spec = new RSAPublicKeySpec(modulus, exponent);
        return KeyFactory.getInstance("RSA").generatePublic(spec);
    }

    private String extractKid(String token) {
        try {
            // Decode header only (no verification)
            String[] parts = token.split("\\.");
            if (parts.length < 2) return null;
            byte[] headerBytes = Base64.getUrlDecoder().decode(parts[0]);
            String headerJson = new String(headerBytes);
            // Simple extraction (avoid full JSON parsing dependency)
            int kidIdx = headerJson.indexOf("\"kid\"");
            if (kidIdx < 0) return null;
            int start = headerJson.indexOf("\"", kidIdx + 5) + 1;
            int end = headerJson.indexOf("\"", start);
            return headerJson.substring(start, end);
        } catch (Exception e) {
            return null;
        }
    }
}
