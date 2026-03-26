package com.cardnect.model.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VerifyOtpRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email")
    private String email;

    @Size(max = 100, message = "Name must be at most 100 characters")
    private String name;

    @Pattern(regexp = "^[0-9+\\-()\\s]{7,20}$", message = "Please provide a valid phone number")
    private String phone;

    @Pattern(regexp = "^(|\\d{6})$", message = "OTP code must be a 6-digit number")
    private String otpCode;
}
