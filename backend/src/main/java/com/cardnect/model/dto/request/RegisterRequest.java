package com.cardnect.model.dto.request;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 100)
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email")
    private String email;

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "^[0-9+\\-()\\s]{7,20}$", message = "Please provide a valid phone number")
    private String phone;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 128, message = "Password must be 6–128 characters")
    private String password;

    /** OTP that was already sent to the email during the verify step */
    @Pattern(regexp = "^(|\\d{6})$", message = "OTP code must be a 6-digit number")
    private String otpCode;
}
