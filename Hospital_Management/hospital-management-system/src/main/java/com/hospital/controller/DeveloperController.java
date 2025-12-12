package com.hospital.controller;

import com.hospital.dto.HospitalRegistrationDTO;
import com.hospital.service.DeveloperService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/developer")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DeveloperController {
    
    private final DeveloperService developerService;
    
    @PostMapping("/hospital/register")
    public ResponseEntity<Map<String, Object>> registerHospitalAndAdmin(
            @Valid @RequestBody HospitalRegistrationDTO dto) {
        
        Map<String, Object> response = developerService.registerHospitalAndAdmin(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
