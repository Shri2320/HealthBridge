package com.hospital.dto;

import com.hospital.model.BloodGroup;
import com.hospital.model.Gender;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class PatientRegistrationDTO {
    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
             message = "Password must be at least 8 characters with uppercase, lowercase, number and special character")
    private String password;
    
    @NotBlank(message = "Confirm password is required")
    private String confirmPassword;
    
    @NotNull(message = "Gender is required")
    private Gender gender;
    
    @NotNull(message = "Age is required")
    @Min(value = 1, message = "Age must be at least 1")
    @Max(value = 150, message = "Age must be less than 150")
    private Integer age;
    
    @NotNull(message = "BMI is required")
    @DecimalMin(value = "10.0", message = "BMI must be at least 10")
    @DecimalMax(value = "60.0", message = "BMI must be less than 60")
    private Double bodyMassIndex;
    
    @NotBlank(message = "Address is required")
    private String address;
    
    @NotNull(message = "Blood group is required")
    private BloodGroup bloodGroup;
    
    @NotNull(message = "Income is required")
    @Min(value = 0, message = "Income must be non-negative")
    private Double income;
    
    @NotBlank(message = "Religion is required")
    private String religion;
    
    @NotBlank(message = "Occupation is required")
    private String occupation;
    
    private String familyBackgroundDiseases;
}
