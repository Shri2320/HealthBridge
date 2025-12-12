package com.hospital.dto;

import com.hospital.model.AppointmentStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
public class AppointmentResponseDTO {
    private Long appointmentId;
    private String doctorName;
    private String department;
    private String hospitalName;
    private LocalDate date;
    private LocalTime time;
    private AppointmentStatus status; // ACCEPTED, REJECTED, PENDING
    private String displayMessage;    // The specific message for the frontend
}