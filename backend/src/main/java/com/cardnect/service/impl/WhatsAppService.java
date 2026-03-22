package com.cardnect.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@Slf4j
public class WhatsAppService {

    @Value("${whatsapp.enabled:true}")
    private boolean whatsappEnabled;

    @Value("${whatsapp.token:}")
    private String whatsappToken;

    @Value("${whatsapp.phone-id:}")
    private String phoneId;

    private final RestTemplate restTemplate = new RestTemplate();

    public void sendTextMessage(String toPhone, String textBody) {
        if (!whatsappEnabled) {
            log.info("WhatsApp is disabled. Mock sending to {}: {}", toPhone, textBody);
            return;
        }

        if (whatsappToken == null || whatsappToken.isBlank() || phoneId == null || phoneId.isBlank()) {
            log.warn("WhatsApp credentials missing. Skipping message to {}", toPhone);
            return;
        }

        String formattedPhone = formatPhone(toPhone);
        String url = "https://graph.facebook.com/v18.0/" + phoneId + "/messages";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(whatsappToken);

        Map<String, Object> payload = Map.of(
                "messaging_product", "whatsapp",
                "to", formattedPhone,
                "type", "text",
                "text", Map.of("body", textBody)
        );

        try {
            restTemplate.postForEntity(url, new HttpEntity<>(payload, headers), String.class);
            log.info("Successfully sent WhatsApp message to {}", formattedPhone);
        } catch (Exception e) {
            log.error("Failed to send WhatsApp message to {}: {}", formattedPhone, e.getMessage());
            throw new RuntimeException("Failed to send WhatsApp message. Please try again later.");
        }
    }

    /**
     * Ensures phone is in 91XXXXXXXXXX format.
     */
    private String formatPhone(String phone) {
        String cleanPhone = phone.replaceAll("[^0-9]", "");
        if (cleanPhone.length() == 10) {
            return "91" + cleanPhone; // Assume Indian number if 10 digits
        }
        return cleanPhone;
    }
}
