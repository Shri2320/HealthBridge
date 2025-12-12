package com.hospital.controller;

import com.hospital.dto.*;
import com.hospital.model.*;
import com.hospital.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminController {

    private final AdminService adminService;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody LoginDTO dto) {
        Map<String, Object> response = adminService.loginAdmin(dto);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/hospital/profile")
    public ResponseEntity<Map<String, Object>> getHospitalProfile(Authentication authentication) {
        String email = authentication.getName();
        Map<String, Object> profile = adminService.getHospitalProfile(email);
        return ResponseEntity.ok(profile);
    }

    // --- FIX IS HERE ---
    @GetMapping("/doctor/search")
    public ResponseEntity<Map<String, Object>> searchDoctor(
            Authentication authentication, // 1. Inject Authentication
            @RequestParam String email) {  // 2. The doctor's email to search

        String adminEmail = authentication.getName(); // 3. Get Admin's email

        // 4. Pass BOTH to the service
        Map<String, Object> doctorData = adminService.searchDoctorByEmail(adminEmail, email);

        return ResponseEntity.ok(doctorData);
    }

    @GetMapping("/department/{departmentId}/statistics")
    public ResponseEntity<Map<String, Object>> getDepartmentStatistics(
            Authentication authentication,
            @PathVariable Long departmentId,
            @RequestParam(defaultValue = "TOTAL") String period) {

        String email = authentication.getName();
        Map<String, Object> statistics = adminService.getDepartmentStatistics(email, departmentId, period);
        return ResponseEntity.ok(statistics);
    }

    @PostMapping("/doctor/register")
    public ResponseEntity<Map<String, Object>> registerDoctor(
            Authentication authentication,
            @Valid @RequestBody DoctorRegistrationDTO dto) {

        String email = authentication.getName();
        Doctor doctor = adminService.registerDoctor(email, dto);

        Map<String, Object> response = Map.of(
                "message", "Doctor registered successfully",
                "doctorId", doctor.getId(),
                "doctorName", doctor.getName(),
                "doctorEmail", doctor.getEmail()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/doctor/availability")
    public ResponseEntity<Map<String, Object>> updateDoctorAvailability(
            Authentication authentication,
            @Valid @RequestBody DoctorAvailabilityDTO dto) {

        String email = authentication.getName();
        DoctorAvailability availability = adminService.updateDoctorAvailability(email, dto);

        Map<String, Object> response = Map.of(
                "message", "Doctor availability updated successfully",
                "availabilityId", availability.getId(),
                "doctorId", availability.getDoctor().getId(),
                "dayOfWeek", availability.getDayOfWeek(),
                "isAvailable", availability.getIsAvailable()
        );

        return ResponseEntity.ok(response);
    }
}