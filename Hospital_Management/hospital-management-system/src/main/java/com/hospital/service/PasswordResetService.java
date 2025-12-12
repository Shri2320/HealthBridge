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
        // 1. Check if user exists
        boolean userExists = adminRepository.findByEmail(email).isPresent() ||
                doctorRepository.findByEmail(email).isPresent() ||
                patientRepository.findByEmail(email).isPresent();

        if (!userExists) {
            throw new RuntimeException("Email is not registered with us.");
        }

        // 2. Generate OTP
        String otp = String.format("%06d", new Random().nextInt(999999));

        // 3. Set Expiration Time (Now + 5 minutes)
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(5);

        // 4. Store OTP with Expiration
        otpStorage.put(email, new OtpData(otp, expiry));

        // 5. Send Email
        sendEmail(email, otp);

        return "OTP sent successfully. It is valid for 5 minutes.";
    }

    public String resetPassword(String email, String otp, String newPassword) {
        // 1. Check if OTP exists
        if (!otpStorage.containsKey(email)) {
            throw new RuntimeException("No OTP request found for this email.");
        }

        OtpData storedData = otpStorage.get(email);

        // 2. Check if OTP matches
        if (!storedData.getOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP.");
        }

        // 3. NEW: Check if OTP is Expired
        if (LocalDateTime.now().isAfter(storedData.getExpiryTime())) {
            otpStorage.remove(email); // Clear expired OTP
            throw new RuntimeException("OTP has expired. Please request a new one.");
        }

        // 4. Update Password
        String encodedPassword = passwordEncoder.encode(newPassword);
        boolean passwordUpdated = false;

        Optional<Admin> adminOpt = adminRepository.findByEmail(email);
        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            admin.setPassword(encodedPassword);
            adminRepository.save(admin);
            passwordUpdated = true;
        } else {
            Optional<Doctor> doctorOpt = doctorRepository.findByEmail(email);
            if (doctorOpt.isPresent()) {
                Doctor doctor = doctorOpt.get();
                doctor.setPassword(encodedPassword);
                doctorRepository.save(doctor);
                passwordUpdated = true;
            } else {
                Optional<Patient> patientOpt = patientRepository.findByEmail(email);
                if (patientOpt.isPresent()) {
                    Patient patient = patientOpt.get();
                    patient.setPassword(encodedPassword);
                    patientRepository.save(patient);
                    passwordUpdated = true;
                }
            }
        }

        if (passwordUpdated) {
            otpStorage.remove(email); // Clear OTP after success
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