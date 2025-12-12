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

        // Remove sensitive data
        doctor.setPassword(null);

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("doctor", Map.of(
                "id", doctor.getId(),
                "name", doctor.getName(),
                "email", doctor.getEmail(),
                "specialization", doctor.getSpecialization(),
                "qualification", doctor.getQualification(),
                "experience", doctor.getExperience(),
                "hospital", doctor.getHospital().getName(),
                "department", doctor.getDepartment().getName()));

        return response;
    }
    public Map<String, Object> getDoctorProfile(String email) {
        // FIX: Changed findByEmail -> findByEmailIgnoreCase
        Doctor doctor = doctorRepository.findByEmailIgnoreCase(email)
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
        // FIX: Changed findByEmail -> findByEmailIgnoreCase
        Doctor doctor = doctorRepository.findByEmailIgnoreCase(email)
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
        // Case-insensitive lookup
        Doctor doctor = doctorRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        LocalDate today = LocalDate.now();

        // Show all appointments for today (scheduled or already accepted/rejected)
        List<Appointment> appointments = appointmentRepository.findByDoctorAndAppointmentDate(doctor, today);

        return appointments.stream().map(appointment -> {
            Patient patient = appointment.getPatient();

            Map<String, Object> appointmentInfo = new HashMap<>();
            appointmentInfo.put("id", appointment.getId());
            appointmentInfo.put("date", appointment.getAppointmentDate());
            appointmentInfo.put("time", appointment.getAppointmentTime());
            appointmentInfo.put("status", appointment.getStatus()); // SCHEDULED / ACCEPTED / REJECTED / etc.
            appointmentInfo.put("symptoms", appointment.getSymptoms());
            appointmentInfo.put("patientName", patient.getName());
            appointmentInfo.put("patientGender", patient.getGender());
            appointmentInfo.put("patientAge", patient.getAge());

            return appointmentInfo;
        }).toList();
    }

    public Map<String, Object> updateAppointmentStatus(String email, Long appointmentId, String status) {
        // FIX: Changed findByEmail -> findByEmailIgnoreCase
        Doctor doctor = doctorRepository.findByEmailIgnoreCase(email)
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
            throw new ValidationException("Invalid status provided. Allowed values: SCHEDULED, ACCEPTED, REJECTED, COMPLETED, CANCELLED");
        }
    }

    public List<Map<String, Object>> getAllAppointments(String email) {
        Doctor doctor = doctorRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        List<Appointment> appointments = appointmentRepository.findByDoctorOrderByAppointmentDateAsc(doctor);

        return appointments.stream().map(appointment -> {
            Patient patient = appointment.getPatient();
            List<MedicalDocument> documents = medicalDocumentRepository.findByPatient(patient);
            Map<String, Object> info = new HashMap<>();
            info.put("id", appointment.getId());
            info.put("date", appointment.getAppointmentDate());
            info.put("time", appointment.getAppointmentTime());
            info.put("status", appointment.getStatus());
            info.put("symptoms", appointment.getSymptoms());
            info.put("patientName", patient.getName());
            info.put("patientEmail", patient.getEmail());
            info.put("documents", documents);
            return info;
        }).toList();
    }
}