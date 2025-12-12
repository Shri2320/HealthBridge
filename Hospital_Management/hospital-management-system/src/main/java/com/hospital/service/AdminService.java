package com.hospital.service;

import com.hospital.dto.*;
import com.hospital.model.*;
import com.hospital.repository.*;
import com.hospital.exception.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final AdminRepository adminRepository;
    private final HospitalRepository hospitalRepository;
    private final DepartmentRepository departmentRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final DoctorAvailabilityRepository doctorAvailabilityRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public Map<String, Object> loginAdmin(LoginDTO dto) {
        Admin admin = adminRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid credentials"));

        if (!passwordEncoder.matches(dto.getPassword(), admin.getPassword())) {
            throw new ValidationException("Invalid credentials");
        }

        String token = jwtService.generateToken(admin.getEmail(), "ADMIN");

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Login successful");
        response.put("adminId", admin.getId());
        response.put("name", admin.getName());
        response.put("hospitalId", admin.getHospital().getId());
        response.put("token", token);

        return response;
    }

    public Map<String, Object> getHospitalProfile(String email) {
        Admin admin = adminRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        Hospital hospital = admin.getHospital();
        List<Department> departments = departmentRepository.findByHospital(hospital);

        Map<String, Object> profile = new HashMap<>();
        profile.put("hospitalId", hospital.getId());
        profile.put("hospitalName", hospital.getName());
        profile.put("location", hospital.getLocation());
        profile.put("phoneNumber", hospital.getPhoneNumber());
        profile.put("email", hospital.getEmail());
//        profile.put("logo", hospital.getLogo()); // Added logo support
        profile.put("departments", departments);

        return profile;
    }

    // --- NEW METHOD ADDED FOR SEARCH ---
    public Map<String, Object> searchDoctorByEmail(String email) {
        Doctor doctor = doctorRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with email: " + email));

        // Create a safe response map avoiding infinite recursion if you have cyclic relationships
        Map<String, Object> response = new HashMap<>();
        response.put("id", doctor.getId());
        response.put("name", doctor.getName());
        response.put("email", doctor.getEmail());
        response.put("specialization", doctor.getSpecialization());
        response.put("departmentName", doctor.getDepartment().getName());

        // Return existing availabilities if any
        // Note: Make sure your Doctor entity has a getter: getAvailabilities()
        // If not, use doctorAvailabilityRepository.findByDoctor(doctor)
        List<Map<String, Object>> availabilityList = doctorAvailabilityRepository.findByDoctor(doctor)
                .stream()
                .map(avail -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("dayOfWeek", avail.getDayOfWeek());
                    map.put("startTime", avail.getStartTime());
                    map.put("endTime", avail.getEndTime());
                    map.put("isAvailable", avail.getIsAvailable());
                    return map;
                })
                .collect(Collectors.toList());

        response.put("availabilities", availabilityList);

        return response;
    }

    public Map<String, Object> getDepartmentStatistics(String email, Long departmentId, String period) {
        Admin admin = adminRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));

        if (!department.getHospital().getId().equals(admin.getHospital().getId())) {
            throw new ValidationException("Department does not belong to your hospital");
        }

        Long totalPatients = appointmentRepository.countByDepartment(department);

        Map<String, Object> statistics = new HashMap<>();
        statistics.put("departmentName", department.getName());
        statistics.put("totalPatients", totalPatients);

        if ("MONTHLY".equals(period)) {
            LocalDate now = LocalDate.now();
            Long monthlyPatients = appointmentRepository.countByDepartmentAndMonth(
                    department, now.getYear(), now.getMonthValue()
            );
            statistics.put("monthlyPatients", monthlyPatients);
        } else if ("WEEKLY".equals(period)) {
            LocalDate now = LocalDate.now();
            Long weeklyPatients = appointmentRepository.countByDepartmentAndWeek(
                    department, now.getYear(), now.getDayOfYear() / 7
            );
            statistics.put("weeklyPatients", weeklyPatients);
        }

        return statistics;
    }

    @Transactional
    public Doctor registerDoctor(String email, DoctorRegistrationDTO dto) {
        Admin admin = adminRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        if (doctorRepository.existsByEmail(dto.getEmail())) {
            throw new ValidationException("Doctor email already registered");
        }

        Department department = departmentRepository.findById(dto.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));

        if (!department.getHospital().getId().equals(admin.getHospital().getId())) {
            throw new ValidationException("Department does not belong to your hospital");
        }

        Doctor doctor = new Doctor();
        doctor.setName(dto.getName());
        doctor.setEmail(dto.getEmail());
        doctor.setPassword(passwordEncoder.encode(dto.getPassword()));
        doctor.setSpecialization(dto.getSpecialization());
        doctor.setQualification(dto.getQualification());
        doctor.setExperience(dto.getExperience());
        doctor.setPhoneNumber(dto.getPhoneNumber());
        doctor.setHospital(admin.getHospital());
        doctor.setDepartment(department);

        return doctorRepository.save(doctor);
    }

    @Transactional
    public DoctorAvailability updateDoctorAvailability(String email, DoctorAvailabilityDTO dto) {
        Admin admin = adminRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        Doctor doctor = doctorRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        if (!doctor.getHospital().getId().equals(admin.getHospital().getId())) {
            throw new ValidationException("Doctor does not belong to your hospital");
        }

        DoctorAvailability availability = doctorAvailabilityRepository
                .findByDoctorAndDayOfWeek(doctor, dto.getDayOfWeek())
                .orElse(new DoctorAvailability());

        availability.setDoctor(doctor);
        availability.setDayOfWeek(dto.getDayOfWeek());
        availability.setStartTime(dto.getStartTime());
        availability.setEndTime(dto.getEndTime());
        availability.setIsAvailable(dto.getIsAvailable());

        return doctorAvailabilityRepository.save(availability);
    }
}