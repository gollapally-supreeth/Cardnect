package com.cardnect.model.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ForgotPasswordRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email")
    private String email;

    @NotBlank(message = "OTP code is required")
    @Pattern(regexp = "^(|\\d{6})$", message = "OTP code must be a 6-digit number")
    private String otpCode;

    @NotBlank(message = "New password is required")
    @Size(min = 6, max = 128, message = "Password must be 6–128 characters")
    private String newPassword;
}
