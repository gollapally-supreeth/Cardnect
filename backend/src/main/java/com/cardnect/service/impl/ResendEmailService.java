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

    @Value("${app.base-url:http://localhost:5173}")
    private String baseUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    /* ── OTP verification email ── */
    public void sendOtpEmail(String toEmail, String otpCode) {
        if (!resendEnabled) {
            log.info("Resend disabled. OTP for {} is {}", toEmail, otpCode);
            return;
        }
        String htmlBody = """
                <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
                  <h2 style="margin-bottom:8px">Cardnect Verification Code</h2>
                  <p>Use the one-time code below to continue signing in to your Cardnect account.</p>
                  <p style="font-size:28px;font-weight:700;letter-spacing:4px;margin:20px 0;color:#2563eb">%s</p>
                  <p>This code expires in <strong>5 minutes</strong>.</p>
                  <p>If you did not request this code, you can safely ignore this email.</p>
                </div>
                """.formatted(otpCode);
        sendEmail(toEmail, "Cardnect Verification Code", htmlBody);
    }

    /* ── Card Request notification email to card holder ── */
    public void sendCardRequestEmail(
            String holderEmail,
            String holderName,
            String requesterName,
            String requesterEmail,
            String bankName,
            String cardType,
            String cardNetwork,
            String maskedNumber,
            String commissionPct,
            String offerDetails
    ) {
        if (!resendEnabled) {
            log.info("Resend disabled – skipping card request email to {}", holderEmail);
            return;
        }

        String requestsUrl = baseUrl + "/dashboard/requests";

        String htmlBody = """
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
                <tr><td align="center">
                  <table width="560" cellpadding="0" cellspacing="0"
                    style="background:#111111;border-radius:16px;border:1px solid rgba(255,255,255,0.10);overflow:hidden;">

                    <!-- Header -->
                    <tr>
                      <td style="padding:32px 40px;border-bottom:1px solid rgba(255,255,255,0.07);">
                        <p style="margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.35);">
                          CARDNECT NETWORK
                        </p>
                        <h1 style="margin:10px 0 0;font-size:22px;font-weight:600;color:#ffffff;letter-spacing:-0.3px;">
                          New Card Request
                        </h1>
                      </td>
                    </tr>

                    <!-- Greeting -->
                    <tr>
                      <td style="padding:28px 40px 0;">
                        <p style="margin:0;font-size:15px;color:rgba(255,255,255,0.65);line-height:1.7;">
                          Hi <strong style="color:#fff;">%s</strong>,<br><br>
                          <strong style="color:#fff;">%s</strong> has sent you a card access request on Cardnect.
                          Review the details below and respond directly from the platform.
                        </p>
                      </td>
                    </tr>

                    <!-- Card Details -->
                    <tr>
                      <td style="padding:22px 40px 0;">
                        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.09);border-radius:12px;padding:20px 24px;">
                          <p style="margin:0 0 14px;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,0.3);">
                            Your Card
                          </p>
                          <table width="100%%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding:5px 0;font-size:13px;color:rgba(255,255,255,0.4);width:150px;">Bank</td>
                              <td style="padding:5px 0;font-size:13px;color:#ffffff;font-weight:500;">%s</td>
                            </tr>
                            <tr>
                              <td style="padding:5px 0;font-size:13px;color:rgba(255,255,255,0.4);">Card</td>
                              <td style="padding:5px 0;font-size:13px;color:#ffffff;font-weight:500;">%s · %s</td>
                            </tr>
                            <tr>
                              <td style="padding:5px 0;font-size:13px;color:rgba(255,255,255,0.4);">Number</td>
                              <td style="padding:5px 0;font-size:13px;color:#ffffff;font-weight:500;">••••%s</td>
                            </tr>
                            <tr>
                              <td style="padding:5px 0;font-size:13px;color:rgba(255,255,255,0.4);">Your Commission</td>
                              <td style="padding:5px 0;font-size:13px;color:#ffffff;font-weight:500;">%s%%</td>
                            </tr>
                          </table>
                        </div>
                      </td>
                    </tr>

                    <!-- Request Message -->
                    <tr>
                      <td style="padding:14px 40px 0;">
                        <div style="border-left:3px solid rgba(255,255,255,0.18);padding:12px 18px;border-radius:0 8px 8px 0;">
                          <p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,0.3);">
                            Request Message
                          </p>
                          <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.75);line-height:1.65;font-style:italic;">
                            "%s"
                          </p>
                          <p style="margin:8px 0 0;font-size:12px;color:rgba(255,255,255,0.3);">
                            — %s &lt;%s&gt;
                          </p>
                        </div>
                      </td>
                    </tr>

                    <!-- CTA Buttons -->
                    <tr>
                      <td style="padding:28px 40px;">
                        <table cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding-right:12px;">
                              <a href="%s"
                                style="display:inline-block;padding:13px 32px;background:#ffffff;color:#000000;
                                       font-size:14px;font-weight:700;text-decoration:none;border-radius:10px;">
                                ✓ Accept Request
                              </a>
                            </td>
                            <td>
                              <a href="%s"
                                style="display:inline-block;padding:13px 32px;background:transparent;
                                       color:rgba(255,255,255,0.45);font-size:14px;font-weight:500;
                                       text-decoration:none;border-radius:10px;border:1px solid rgba(255,255,255,0.12);">
                                Decline
                              </a>
                            </td>
                          </tr>
                        </table>
                        <p style="margin:14px 0 0;font-size:12px;color:rgba(255,255,255,0.2);line-height:1.6;">
                          Both buttons open the Requests section on Cardnect where you can manage all incoming requests.
                          If you accept, the requester's contact details will be revealed to you.
                        </p>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);">
                        <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.18);line-height:1.6;">
                          You are receiving this because you have an active card listing on Cardnect.<br>
                          © 2026 Cardnect Protocol. All rights reserved.
                        </p>
                      </td>
                    </tr>

                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(
                holderName, requesterName,             // greeting
                bankName, cardType, cardNetwork,        // card details
                maskedNumber, commissionPct,
                offerDetails, requesterName, requesterEmail,  // message block
                requestsUrl, requestsUrl                // accept + decline URLs
        );

        sendEmail(holderEmail,
                  "New Card Request from " + requesterName + " — Cardnect",
                  htmlBody);
    }

    /* ── Private send helper ── */
    private void sendEmail(String toEmail, String subject, String htmlBody) {
        if (!resendEnabled) return;
        if (resendApiKey == null || resendApiKey.isBlank()) {
            throw new IllegalStateException("Resend API key is missing");
        }
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(resendApiKey);

        Map<String, Object> payload = Map.of(
                "from",    fromEmail,
                "to",      new String[]{toEmail},
                "subject", subject,
                "html",    htmlBody
        );

        try {
            restTemplate.postForEntity(
                    "https://api.resend.com/emails",
                    new HttpEntity<>(payload, headers),
                    String.class
            );
            log.info("Email '{}' sent to {}", subject, toEmail);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", toEmail, e.getMessage());
        }
    }
}
