package com.hospital.controller;

import com.hospital.service.PasswordResetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    // URL: POST /api/auth/forgot-password?email=doctor@example.com
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestParam String email) {
        String response = passwordResetService.forgotPassword(email);
        return ResponseEntity.ok(response);
    }

    // URL: POST /api/auth/reset-password?email=...&otp=...&newPassword=...
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(
            @RequestParam String email,
            @RequestParam String otp,
            @RequestParam String newPassword) {

        String response = passwordResetService.resetPassword(email, otp, newPassword);
        return ResponseEntity.ok(response);
    }
}