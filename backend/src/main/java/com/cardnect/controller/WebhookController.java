package com.cardnect.controller;

import com.cardnect.service.impl.CardRequestService;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/webhook/whatsapp")
@RequiredArgsConstructor
@Slf4j
public class WebhookController {

    private final CardRequestService cardRequestService;

    @Value("${whatsapp.webhook-token:cardnect_webhook_secret}")
    private String verifyToken;

    @GetMapping
    public ResponseEntity<String> verifyWebhook(
            @RequestParam("hub.mode") String mode,
            @RequestParam("hub.verify_token") String token,
            @RequestParam("hub.challenge") String challenge) {

        if ("subscribe".equals(mode) && verifyToken.equals(token)) {
            log.info("Webhook verified successfully!");
            return ResponseEntity.ok(challenge);
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @PostMapping
    public ResponseEntity<Void> receiveMessage(@RequestBody JsonNode payload) {
        try {
            if (payload.has("object") && "whatsapp_business_account".equals(payload.get("object").asText())) {
                JsonNode entry = payload.path("entry").get(0);
                if (entry != null) {
                    JsonNode changes = entry.path("changes").get(0);
                    if (changes != null) {
                        JsonNode value = changes.path("value");
                        JsonNode messages = value.path("messages");
                        
                        if (messages != null && messages.isArray() && messages.size() > 0) {
                            JsonNode message = messages.get(0);
                            
                            // Only process text messages
                            if ("text".equals(message.path("type").asText())) {
                                String fromPhone = message.path("from").asText();
                                String textBody = message.path("text").path("body").asText().trim();
                                
                                log.info("Received WhatsApp message from {}: {}", fromPhone, textBody);
                                
                                if (textBody.toUpperCase().startsWith("ACCEPT_")) {
                                    String requestId = textBody.substring("ACCEPT_".length());
                                    cardRequestService.handleWebhookResponse(requestId, "ACCEPT", fromPhone);
                                } else if (textBody.toUpperCase().startsWith("DECLINE_")) {
                                    String requestId = textBody.substring("DECLINE_".length());
                                    cardRequestService.handleWebhookResponse(requestId, "DECLINE", fromPhone);
                                }
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error processing WhatsApp webhook: {}", e.getMessage());
        }
        
        // Meta requires a 200 OK response immediately to acknowledge receipt
        return ResponseEntity.ok().build();
    }
}
