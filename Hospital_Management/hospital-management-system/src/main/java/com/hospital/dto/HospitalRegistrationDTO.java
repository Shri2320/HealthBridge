package com.hospital.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.List;

@Data
public class HospitalRegistrationDTO {
    @NotBlank(message = "Hospital name is required")
    @Size(min = 3, max = 200)
    private String hospitalName;
    
    @NotBlank(message = "Location is required")
    private String location;
    
    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9]{10}$")
    private String phoneNumber;
    
    @NotBlank(message = "Email is required")
    @Email
    private String email;
    
    @NotBlank(message = "Admin name is required")
    private String adminName;
    
    @NotBlank(message = "Admin email is required")
    @Email
    private String adminEmail;
    
    @NotBlank(message = "Admin password is required")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$")
    private String adminPassword;
    
    @NotEmpty(message = "At least one department is required")
    private List<String> departments;
}
