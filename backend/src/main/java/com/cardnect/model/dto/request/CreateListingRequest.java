package com.cardnect.model.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CreateListingRequest {

    @NotBlank(message = "Bank name is required")
    @Size(max = 100, message = "Bank name must be under 100 characters")
    private String bankName;

    @NotBlank(message = "Card network is required")
    private String cardNetwork;

    @NotBlank(message = "Card type is required")
    private String cardType;

    /**
     * Only last 4 digits. Client/server MUST enforce this.
     * SECURITY: Full card number must never reach this field.
     */
    @NotBlank(message = "Last 4 digits are required")
    @Pattern(regexp = "^\\d{4}$", message = "Must be exactly 4 digits")
    private String maskedNumber;

    @NotNull(message = "Commission percentage is required")
    @DecimalMin(value = "0.0", message = "Commission must be >= 0%")
    @DecimalMax(value = "100.0", message = "Commission must be <= 100%")
    private BigDecimal commissionPercentage;
}
