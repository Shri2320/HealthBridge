package com.hospital.service;

import com.hospital.dto.HospitalRegistrationDTO;
import com.hospital.model.*;
import com.hospital.repository.*;
import com.hospital.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DeveloperService {
    
    private final HospitalRepository hospitalRepository;
    private final AdminRepository adminRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Transactional
    public Map<String, Object> registerHospitalAndAdmin(HospitalRegistrationDTO dto) {
        // Validate hospital email doesn't exist
        if (hospitalRepository.existsByEmail(dto.getEmail())) {
            throw new ValidationException("Hospital email already registered");
        }
        
        // Validate admin email doesn't exist
        if (adminRepository.existsByEmail(dto.getAdminEmail())) {
            throw new ValidationException("Admin email already registered");
        }
        
        // Create hospital
        Hospital hospital = new Hospital();
        hospital.setName(dto.getHospitalName());
        hospital.setLocation(dto.getLocation());
        hospital.setPhoneNumber(dto.getPhoneNumber());
        hospital.setEmail(dto.getEmail());
        
        hospital = hospitalRepository.save(hospital);
        
        // Create admin
        Admin admin = new Admin();
        admin.setName(dto.getAdminName());
        admin.setEmail(dto.getAdminEmail());
        admin.setPassword(passwordEncoder.encode(dto.getAdminPassword()));
        admin.setHospital(hospital);
        
        admin = adminRepository.save(admin);
        
        // Create departments
        for (String deptName : dto.getDepartments()) {
            Department department = new Department();
            department.setName(DepartmentType.valueOf(deptName));
            department.setHospital(hospital);
            department.setTotalPatientsTreated(0);
            departmentRepository.save(department);
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Hospital and Admin registered successfully");
        response.put("hospitalId", hospital.getId());
        response.put("adminId", admin.getId());
        response.put("adminEmail", admin.getEmail());
        
        return response;
    }
}
