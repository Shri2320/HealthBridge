package com.hospital.controller;

import com.hospital.dto.*;
import com.hospital.model.*;
import com.hospital.service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/patient")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PatientController {

    private final PatientService patientService;

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody PatientRegistrationDTO dto) {
        Map<String, Object> response = patientService.registerPatient(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody LoginDTO dto) {
        Map<String, Object> response = patientService.loginPatient(dto);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/documents/upload")
    public ResponseEntity<Map<String, Object>> uploadDocument(
            Authentication authentication,
            @RequestParam("file") MultipartFile file,
            @RequestParam("documentType") DocumentType documentType,
            @RequestParam(value = "description", required = false) String description) throws IOException {

        String email = authentication.getName();
        MedicalDocument document = patientService.uploadDocument(email, file, documentType, description);

        Map<String, Object> response = Map.of(
                "message", "Document uploaded successfully",
                "documentId", document.getId(),
                "fileName", document.getFileName()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/documents")
    public ResponseEntity<List<MedicalDocument>> getDocuments(Authentication authentication) {
        String email = authentication.getName();
        List<MedicalDocument> documents = patientService.getPatientDocuments(email);
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/hospitals")
    public ResponseEntity<List<Map<String, Object>>> getAllHospitals() {
        List<Map<String, Object>> hospitals = patientService.getAllHospitals();
        return ResponseEntity.ok(hospitals);
    }

    @PostMapping("/appointment/book")
    public ResponseEntity<Map<String, Object>> bookAppointment(
            Authentication authentication,
            @Valid @RequestBody AppointmentDTO dto) {

        String email = authentication.getName();
        Appointment appointment = patientService.bookAppointment(email, dto);

        // UPDATED: Added "status" to the response map
        Map<String, Object> response = Map.of(
                "message", "Appointment booked successfully",
                "appointmentId", appointment.getId(),
                "appointmentDate", appointment.getAppointmentDate(),
                "appointmentTime", appointment.getAppointmentTime(),
                "status", appointment.getStatus() // <--- ADDED THIS LINE
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/doctors/availability")
    public ResponseEntity<List<Map<String, Object>>> getDoctorAvailability(
            @RequestParam Long hospitalId,
            @RequestParam String department) {

        List<Map<String, Object>> availability = patientService.getDoctorAvailability(hospitalId, department);
        return ResponseEntity.ok(availability);
    }

    @GetMapping("/appointments/history")
    public ResponseEntity<List<AppointmentResponseDTO>> getAppointmentHistory(Authentication authentication) {
        String email = authentication.getName();
        List<AppointmentResponseDTO> appointments = patientService.getPatientAppointments(email);
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/profile") // NEW ENDPOINT
    public ResponseEntity<Map<String, Object>> getPatientProfile(Authentication authentication) {
        String email = authentication.getName();
        Map<String, Object> profile = patientService.getPatientProfile(email);
        return ResponseEntity.ok(profile);
    }
}