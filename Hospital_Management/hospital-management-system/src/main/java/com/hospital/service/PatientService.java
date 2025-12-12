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

        // Check if email already exists
        if (patientRepository.existsByEmail(dto.getEmail())) {
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
        Patient patient = patientRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid credentials"));

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
        Patient patient = patientRepository.findByEmail(email)
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
        Patient patient = patientRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        return medicalDocumentRepository.findByPatientOrderByUploadDateDesc(patient);
    }

    public List<Hospital> getAllHospitals() {
        return hospitalRepository.findAll();
    }

    @Transactional
    public Appointment bookAppointment(String email, AppointmentDTO dto) {
        Patient patient = patientRepository.findByEmail(email)
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
                    .hospitalName(appt.getHospital().getName()) // Make sure Hospital has getName()
                    .date(appt.getAppointmentDate())
                    .time(appt.getAppointmentTime())
                    .status(appt.getStatus())
                    .displayMessage(message)
                    .build();
        }).collect(Collectors.toList());
    }
}