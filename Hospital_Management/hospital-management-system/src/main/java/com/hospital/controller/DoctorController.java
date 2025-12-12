package com.hospital.controller;

import com.hospital.dto.LoginDTO;
import com.hospital.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/doctor")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DoctorController {

    private final DoctorService doctorService;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody LoginDTO dto) {
        Map<String, Object> response = doctorService.loginDoctor(dto);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile(Authentication authentication) {
        String email = authentication.getName();
        Map<String, Object> profile = doctorService.getDoctorProfile(email);
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/history")
    public ResponseEntity<Map<String, Object>> getTreatmentHistory(
            Authentication authentication,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        String email = authentication.getName();
        Map<String, Object> history = doctorService.getTreatmentHistory(email, date);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/appointments/today")
    public ResponseEntity<List<Map<String, Object>>> getTodayAppointments(Authentication authentication) {
        String email = authentication.getName();
        List<Map<String, Object>> appointments = doctorService.getTodayAppointments(email);
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/appointments")
    public ResponseEntity<List<Map<String, Object>>> getAllAppointments(Authentication authentication) {
        String email = authentication.getName();
        List<Map<String, Object>> appointments = doctorService.getAllAppointments(email);
        return ResponseEntity.ok(appointments);
    }

    // --- NEW ENDPOINT ADDED HERE ---
    @PutMapping("/appointments/{id}/status")
    public ResponseEntity<Map<String, Object>> updateAppointmentStatus(
            Authentication authentication,
            @PathVariable Long id,
            @RequestParam String status) {

        String email = authentication.getName();
        Map<String, Object> response = doctorService.updateAppointmentStatus(email, id, status);
        return ResponseEntity.ok(response);
    }
}