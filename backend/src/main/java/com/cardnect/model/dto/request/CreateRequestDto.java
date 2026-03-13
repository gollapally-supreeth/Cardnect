package com.cardnect.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.UUID;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CreateRequestDto {

    @NotNull(message = "Listing ID is required")
    private UUID listingId;

    @NotBlank(message = "Offer details are required")
    @Size(max = 500, message = "Offer details must be under 500 characters")
    private String offerDetails;
}
