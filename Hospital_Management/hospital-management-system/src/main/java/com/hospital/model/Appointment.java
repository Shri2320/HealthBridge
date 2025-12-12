package com.hospital.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Entity
@Table(name = "appointments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "doctor_id")
    @JsonIgnore // Prevents infinite recursion
    private Doctor doctor;

    @ManyToOne
    @JoinColumn(name = "hospital_id")
    @JsonIgnore // Prevents infinite recursion
    private Hospital hospital;

    @ManyToOne
    @JoinColumn(name = "department_id")
    @JsonIgnore // Prevents infinite recursion
    private Department department;

    @NotNull(message = "Appointment date is required")
    @Future(message = "Appointment date must be in the future")
    private LocalDate appointmentDate;

    @NotNull(message = "Appointment time is required")
    private LocalTime appointmentTime;

    @Column(length = 1000)
    private String symptoms;

    // Store as ordinal to match existing DB tinyint column
    @Enumerated(EnumType.ORDINAL)
    private AppointmentStatus status = AppointmentStatus.SCHEDULED; // Default status

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}