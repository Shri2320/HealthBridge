package com.hospital.service;

import com.hospital.dto.*;
import com.hospital.model.*;
import com.hospital.repository.*;
import com.hospital.exception.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final HospitalRepository hospitalRepository;
    private final DepartmentRepository departmentRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final MedicalDocumentRepository medicalDocumentRepository;
    private final DoctorAvailabilityRepository doctorAvailabilityRepository;
    private final FileStorageService fileStorageService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public Map<String, Object> registerPatient(PatientRegistrationDTO dto) {
        // Validate passwords match
        if (!dto.getPassword().equals(dto.getConfirmPassword())) {
            throw new ValidationException("Passwords do not match");
        }

        // ✅ FIX: Use case-insensitive check for existence
        if (patientRepository.existsByEmailIgnoreCase(dto.getEmail())) {
            throw new ValidationException("Email already registered");
        }

        // Create patient
        Patient patient = new Patient();
        patient.setName(dto.getName());
        patient.setEmail(dto.getEmail());
        patient.setPassword(passwordEncoder.encode(dto.getPassword()));
        patient.setGender(dto.getGender());
        patient.setAge(dto.getAge());
        patient.setBodyMassIndex(dto.getBodyMassIndex());
        patient.setAddress(dto.getAddress());
        patient.setBloodGroup(dto.getBloodGroup());
        patient.setIncome(dto.getIncome());
        patient.setReligion(dto.getReligion());
        patient.setOccupation(dto.getOccupation());
        patient.setFamilyBackgroundDiseases(dto.getFamilyBackgroundDiseases());

        patient = patientRepository.save(patient);

        // Generate token
        String token = jwtService.generateToken(patient.getEmail(), "PATIENT");

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Patient registered successfully");
        response.put("patientId", patient.getId());
        response.put("token", token);

        return response;
    }

    public Map<String, Object> loginPatient(LoginDTO dto) {
        // Normalize email for consistent lookup
        String normalizedEmail = dto.getEmail() != null ? dto.getEmail().toLowerCase().trim() : null;
        
        // ✅ FIX: Use case-insensitive find for login
        Patient patient = patientRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid credentials"));

        System.out.println("Login attempt for email: " + normalizedEmail);
        System.out.println("Stored password hash: " + patient.getPassword());
        System.out.println("Password matches: " + passwordEncoder.matches(dto.getPassword(), patient.getPassword()));
        
        if (!passwordEncoder.matches(dto.getPassword(), patient.getPassword())) {
            throw new ValidationException("Invalid credentials");
        }

        String token = jwtService.generateToken(patient.getEmail(), "PATIENT");

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Login successful");
        response.put("patientId", patient.getId());
        response.put("name", patient.getName());
        response.put("token", token);

        return response;
    }

    @Transactional
    public MedicalDocument uploadDocument(String email, MultipartFile file,
                                          DocumentType documentType, String description) throws IOException {
        // ✅ FIX: Use case-insensitive find
        Patient patient = patientRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        String fileName = fileStorageService.storeFile(file);

        MedicalDocument document = new MedicalDocument();
        document.setPatient(patient);
        document.setDocumentType(documentType);
        document.setFileName(file.getOriginalFilename());
        document.setFilePath(fileName);
        document.setDescription(description);

        return medicalDocumentRepository.save(document);
    }

    public List<MedicalDocument> getPatientDocuments(String email) {
        // ✅ FIX: Use case-insensitive find
        Patient patient = patientRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        return medicalDocumentRepository.findByPatientOrderByUploadDateDesc(patient);
    }

    public List<Map<String, Object>> getAllHospitals() {
        return hospitalRepository.findAll().stream().map(hospital -> {
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", hospital.getId());
            dto.put("name", hospital.getName());
            dto.put("location", hospital.getLocation());
            dto.put("email", hospital.getEmail());
            dto.put("phoneNumber", hospital.getPhoneNumber());
            dto.put("logoUrl", hospital.getLogoUrl());

            // include department names only to avoid recursive serialization
            List<String> deptNames = hospital.getDepartments() == null ? List.of()
                    : hospital.getDepartments().stream()
                    .map(dept -> dept.getName().toString())
                    .toList();
            dto.put("departments", deptNames);
            return dto;
        }).toList();
    }

    @Transactional
    public Appointment bookAppointment(String email, AppointmentDTO dto) {
        // ✅ FIX: Use case-insensitive find
        Patient patient = patientRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        Hospital hospital = hospitalRepository.findById(dto.getHospitalId())
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found"));

        DepartmentType departmentType = DepartmentType.valueOf(dto.getDepartmentName());
        Department department = departmentRepository.findByHospitalAndName(hospital, departmentType)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));

        Doctor doctor = doctorRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        // Validate appointment date
        if (dto.getAppointmentDate().isBefore(LocalDate.now())) {
            throw new ValidationException("Appointment date cannot be in the past");
        }

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setHospital(hospital);
        appointment.setDepartment(department);
        appointment.setAppointmentDate(dto.getAppointmentDate());
        appointment.setAppointmentTime(dto.getAppointmentTime());
        appointment.setSymptoms(dto.getSymptoms());
        appointment.setStatus(AppointmentStatus.SCHEDULED); // Default status

        return appointmentRepository.save(appointment);
    }

    public List<Map<String, Object>> getDoctorAvailability(Long hospitalId, String departmentName) {
        Hospital hospital = hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found"));

        DepartmentType departmentType = DepartmentType.valueOf(departmentName);
        Department department = departmentRepository.findByHospitalAndName(hospital, departmentType)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));

        List<Doctor> doctors = doctorRepository.findByHospitalAndDepartment(hospital, department);

        return doctors.stream().map(doctor -> {
            List<DoctorAvailability> availability = doctorAvailabilityRepository.findByDoctor(doctor);

            Map<String, Object> doctorInfo = new HashMap<>();
            doctorInfo.put("doctorId", doctor.getId());
            doctorInfo.put("doctorName", doctor.getName());
            doctorInfo.put("specialization", doctor.getSpecialization());
            doctorInfo.put("experience", doctor.getExperience());
            doctorInfo.put("availability", availability);

            return doctorInfo;
        }).toList();
    }

    // ✅ NEW METHOD: Fetch appointment history with custom status messages
    public List<AppointmentResponseDTO> getPatientAppointments(String email) {
        // ✅ FIX: Use case-insensitive find in repository logic if possible
        List<Appointment> appointments = appointmentRepository.findByPatientEmailOrderByAppointmentDateDesc(email);

        return appointments.stream().map(appt -> {
            String message = "";

            if (appt.getStatus() == AppointmentStatus.ACCEPTED) {
                message = "Appointment Accepted";
            } else if (appt.getStatus() == AppointmentStatus.REJECTED) {
                message = "Your appointment is cancelled because the doctor has a tight schedule. Please try another day.";
            } else {
                message = "Appointment is pending approval.";
            }

            return AppointmentResponseDTO.builder()
                    .appointmentId(appt.getId())
                    .doctorName(appt.getDoctor().getName())
                    .department(appt.getDoctor().getDepartment().getName().toString())
                    .hospitalName(appt.getHospital().getName())
                    .date(appt.getAppointmentDate())
                    .time(appt.getAppointmentTime())
                    .status(appt.getStatus())
                    .displayMessage(message)
                    .symptoms(appt.getSymptoms())
                    .build();
        }).collect(Collectors.toList());
    }

    public Map<String, Object> getPatientProfile(String email) {
        // Use the robust case-insensitive lookup
        Patient patient = patientRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        // Fetch patient-specific documents (optional, can be moved to separate API if too large)
        List<MedicalDocument> documents = medicalDocumentRepository.findByPatientOrderByUploadDateDesc(patient);

        Map<String, Object> profile = new HashMap<>();
        profile.put("id", patient.getId());
        profile.put("name", patient.getName());
        profile.put("email", patient.getEmail());
        profile.put("gender", patient.getGender().toString());
        profile.put("age", patient.getAge());
        profile.put("bmi", patient.getBodyMassIndex()); // Use 'bmi' for frontend compatibility
        profile.put("address", patient.getAddress());
        profile.put("bloodGroup", patient.getBloodGroup().toString());
        profile.put("income", patient.getIncome());
        profile.put("religion", patient.getReligion());
        profile.put("occupation", patient.getOccupation());
        profile.put("familyBackgroundDiseases", patient.getFamilyBackgroundDiseases());
        profile.put("documents", documents);

        // Note: Appointments and previousDetails would ideally be fetched here too,
        // but we'll fetch them separately below for simplicity, or include them
        // if your Patient model has lazy loading disabled or uses DTO projections.

        return profile;
    }
}