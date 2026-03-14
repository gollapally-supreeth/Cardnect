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
public class ResendEmailService {

    @Value("${resend.api-key:}")
    private String resendApiKey;

    @Value("${resend.from-email:no-reply@cardnect.app}")
    private String fromEmail;

    @Value("${resend.enabled:false}")
    private boolean resendEnabled;

    private final RestTemplate restTemplate = new RestTemplate();

    public void sendOtpEmail(String toEmail, String otpCode) {
        if (!resendEnabled) {
            log.info("Resend disabled. OTP for {} is {}", toEmail, otpCode);
            return;
        }

        if (resendApiKey == null || resendApiKey.isBlank()) {
            throw new IllegalStateException("Resend API key is missing");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(resendApiKey);

        String htmlBody = """
                <div style=\"font-family:Arial,sans-serif;line-height:1.6;color:#0f172a\">
                  <h2 style=\"margin-bottom:8px\">Cardnect Verification Code</h2>
                  <p>Use the one-time code below to continue signing in to your Cardnect account.</p>
                  <p style=\"font-size:28px;font-weight:700;letter-spacing:4px;margin:20px 0;color:#2563eb\">%s</p>
                  <p>This code expires in <strong>5 minutes</strong>.</p>
                  <p>If you did not request this code, you can safely ignore this email.</p>
                </div>
                """.formatted(otpCode);

        Map<String, Object> payload = Map.of(
                "from", fromEmail,
                "to", new String[]{toEmail},
                "subject", "Cardnect Verification Code",
                "html", htmlBody
        );

        restTemplate.postForEntity(
                "https://api.resend.com/emails",
                new HttpEntity<>(payload, headers),
                String.class
        );
    }
}

