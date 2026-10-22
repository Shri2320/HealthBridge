package com.hospital.service;

import com.hospital.model.Admin;
import com.hospital.model.Doctor;
import com.hospital.model.Patient;
import com.hospital.repository.AdminRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.PatientRepository;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final AdminRepository adminRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final JavaMailSender mailSender;
    private final PasswordEncoder passwordEncoder;

    // Helper class to store OTP + Expiration Time
    @Data
    @AllArgsConstructor
    private static class OtpData {
        private String otp;
        private LocalDateTime expiryTime;
    }

    // Map stores OtpData instead of just String
    private final Map<String, OtpData> otpStorage = new HashMap<>();

    public String forgotPassword(String email) {
        // Normalize email to lowercase for consistent lookup
        String normalizedEmail = email.toLowerCase().trim();
        
        // 1. Check if user exists (use case-insensitive for Patient, case-sensitive for others)
        boolean userExists = adminRepository.findByEmailIgnoreCase(normalizedEmail).isPresent() ||
                doctorRepository.findByEmailIgnoreCase(normalizedEmail).isPresent() ||
                patientRepository.findByEmailIgnoreCase(normalizedEmail).isPresent();

        if (!userExists) {
            throw new RuntimeException("Email is not registered with us.");
        }

        // 2. Generate OTP
        String otp = String.format("%06d", new Random().nextInt(999999));

        // 3. Set Expiration Time (Now + 5 minutes)
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(5);

        // 4. Store OTP with Expiration (use normalized email as key)
        otpStorage.put(normalizedEmail, new OtpData(otp, expiry));

        // 5. Send Email (use original email for sending)
        sendEmail(email, otp);

        return "OTP sent successfully. It is valid for 5 minutes.";
    }

    @Transactional
    public String resetPassword(String email, String otp, String newPassword) {
        // Normalize email to lowercase for consistent lookup
        String normalizedEmail = email.toLowerCase().trim();
        
        // 1. Check if OTP exists
        if (!otpStorage.containsKey(normalizedEmail)) {
            throw new RuntimeException("No OTP request found for this email.");
        }

        OtpData storedData = otpStorage.get(normalizedEmail);

        // 2. Check if OTP matches
        if (!storedData.getOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP.");
        }

        // 3. Check if OTP is Expired
        if (LocalDateTime.now().isAfter(storedData.getExpiryTime())) {
            otpStorage.remove(normalizedEmail); // Clear expired OTP
            throw new RuntimeException("OTP has expired. Please request a new one.");
        }

        // 4. Update Password (use case-insensitive lookup for Patient and Doctor to match login behavior)
        String encodedPassword = passwordEncoder.encode(newPassword);
        boolean passwordUpdated = false;

        // Try Admin first (case-sensitive)
        Optional<Admin> adminOpt = adminRepository.findByEmailIgnoreCase(normalizedEmail);
        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            admin.setPassword(encodedPassword);
            adminRepository.save(admin);
            passwordUpdated = true;
        } else {
            // Try Doctor (case-insensitive to match login)
            Optional<Doctor> doctorOpt = doctorRepository.findByEmailIgnoreCase(normalizedEmail);
            if (doctorOpt.isPresent()) {
                Doctor doctor = doctorOpt.get();
                doctor.setPassword(encodedPassword);
                doctorRepository.save(doctor);
                passwordUpdated = true;
            } else {
                // Try Patient (case-insensitive to match login)
                Optional<Patient> patientOpt = patientRepository.findByEmailIgnoreCase(normalizedEmail);
                if (patientOpt.isPresent()) {
                    Patient patient = patientOpt.get();
                    String oldPasswordHash = patient.getPassword();
                    patient.setPassword(encodedPassword);
                    Patient savedPatient = patientRepository.saveAndFlush(patient); // Save and flush immediately
                    System.out.println("Password reset for patient: " + savedPatient.getEmail());
                    System.out.println("Old password hash: " + oldPasswordHash);
                    System.out.println("New password hash: " + savedPatient.getPassword());
                    System.out.println("Password verification test: " + passwordEncoder.matches(newPassword, savedPatient.getPassword()));
                    passwordUpdated = true;
                }
            }
        }

        if (passwordUpdated) {
            otpStorage.remove(normalizedEmail); // Clear OTP after success
            return "Password reset successfully. You can now login.";
        } else {
            throw new RuntimeException("User not found.");
        }
    }

    private void sendEmail(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Password Reset OTP");
        message.setText("Your OTP is: " + otp + "\n\nThis OTP is valid for 5 minutes.");
        mailSender.send(message);
    }
}