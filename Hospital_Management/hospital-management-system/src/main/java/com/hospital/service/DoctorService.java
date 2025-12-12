package com.hospital.service;

import com.hospital.dto.LoginDTO;
import com.hospital.model.*;
import com.hospital.repository.*;
import com.hospital.exception.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final MedicalDocumentRepository medicalDocumentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public Map<String, Object> loginDoctor(LoginDTO dto) {
        Doctor doctor = doctorRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid credentials"));

        if (!passwordEncoder.matches(dto.getPassword(), doctor.getPassword())) {
            throw new ValidationException("Invalid credentials");
        }

        String token = jwtService.generateToken(doctor.getEmail(), "DOCTOR");

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Login successful");
        response.put("doctorId", doctor.getId());
        response.put("name", doctor.getName());
        response.put("specialization", doctor.getSpecialization());
        response.put("token", token);

        return response;
    }

    public Map<String, Object> getDoctorProfile(String email) {
        Doctor doctor = doctorRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        Map<String, Object> profile = new HashMap<>();
        profile.put("id", doctor.getId());
        profile.put("name", doctor.getName());
        profile.put("email", doctor.getEmail());
        profile.put("specialization", doctor.getSpecialization());
        profile.put("qualification", doctor.getQualification());
        profile.put("experience", doctor.getExperience());
        profile.put("hospital", doctor.getHospital().getName());
        profile.put("department", doctor.getDepartment().getName());

        return profile;
    }

    public Map<String, Object> getTreatmentHistory(String email, LocalDate date) {
        Doctor doctor = doctorRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        List<Appointment> appointments = appointmentRepository.findByDoctorAndAppointmentDate(doctor, date);
        Long patientCount = appointmentRepository.countByDoctorAndDate(doctor, date);

        Map<String, Object> history = new HashMap<>();
        history.put("date", date);
        history.put("totalPatients", patientCount);
        history.put("appointments", appointments);

        return history;
    }

    public List<Map<String, Object>> getTodayAppointments(String email) {
        Doctor doctor = doctorRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        LocalDate today = LocalDate.now();

        // ✅ UPDATED LINE: Now filters by date AND Status (ACCEPTED)
        // Ensure AppointmentStatus.ACCEPTED exists in your Enum. If you use CONFIRMED, change it here.
        List<Appointment> appointments = appointmentRepository.findByDoctorAndAppointmentDateAndStatus(
                doctor,
                today,
                AppointmentStatus.ACCEPTED
        );

        return appointments.stream().map(appointment -> {
            Patient patient = appointment.getPatient();
            List<MedicalDocument> documents = medicalDocumentRepository.findByPatient(patient);

            Map<String, Object> appointmentInfo = new HashMap<>();
            appointmentInfo.put("appointmentId", appointment.getId());
            appointmentInfo.put("appointmentTime", appointment.getAppointmentTime());
            appointmentInfo.put("status", appointment.getStatus());
            appointmentInfo.put("symptoms", appointment.getSymptoms());
            appointmentInfo.put("patientName", patient.getName());
            appointmentInfo.put("patientGender", patient.getGender());
            appointmentInfo.put("patientAge", patient.getAge());
            appointmentInfo.put("patientBMI", patient.getBodyMassIndex());
            appointmentInfo.put("patientAddress", patient.getAddress());
            appointmentInfo.put("patientBloodGroup", patient.getBloodGroup());
            appointmentInfo.put("patientIncome", patient.getIncome());
            appointmentInfo.put("patientReligion", patient.getReligion());
            appointmentInfo.put("patientOccupation", patient.getOccupation());
            appointmentInfo.put("familyDiseases", patient.getFamilyBackgroundDiseases());
            appointmentInfo.put("medicalDocuments", documents);

            return appointmentInfo;
        }).toList();
    }

    public Map<String, Object> updateAppointmentStatus(String email, Long appointmentId, String status) {
        Doctor doctor = doctorRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (!appointment.getDoctor().getId().equals(doctor.getId())) {
            throw new ValidationException("Unauthorized: This appointment does not belong to you");
        }

        try {
            AppointmentStatus newStatus = AppointmentStatus.valueOf(status.toUpperCase());
            appointment.setStatus(newStatus);
            appointmentRepository.save(appointment);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Appointment status updated successfully");
            response.put("appointmentId", appointment.getId());
            response.put("newStatus", appointment.getStatus());

            return response;
        } catch (IllegalArgumentException e) {
            throw new ValidationException("Invalid status provided. Allowed values: SCHEDULED, ACCEPTED, COMPLETED, CANCELLED");
        }
    }
}