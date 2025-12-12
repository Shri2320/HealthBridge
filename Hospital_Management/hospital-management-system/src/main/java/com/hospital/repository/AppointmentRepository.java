package com.hospital.repository;

import com.hospital.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    // Existing methods
    List<Appointment> findByPatient(Patient patient);
    List<Appointment> findByDoctor(Doctor doctor);
    List<Appointment> findByDoctorAndAppointmentDate(Doctor doctor, LocalDate date);

    // ✅ NEW METHOD: To filter by Doctor, Date, AND Status
    List<Appointment> findByDoctorAndAppointmentDateAndStatus(Doctor doctor, LocalDate date, AppointmentStatus status);

    // All appointments for doctor ordered by date asc
    List<Appointment> findByDoctorOrderByAppointmentDateAsc(Doctor doctor);

    // Existing: For fetching patient history by email (Newest first)
    List<Appointment> findByPatientEmailOrderByAppointmentDateDesc(String email);

    // Existing Custom Queries
    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.doctor = :doctor AND a.appointmentDate = :date")
    Long countByDoctorAndDate(Doctor doctor, LocalDate date);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.department = :department")
    Long countByDepartment(Department department);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.department = :department " +
            "AND YEAR(a.appointmentDate) = :year AND MONTH(a.appointmentDate) = :month")
    Long countByDepartmentAndMonth(Department department, int year, int month);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.department = :department " +
            "AND YEAR(a.appointmentDate) = :year AND WEEK(a.appointmentDate) = :week")
    Long countByDepartmentAndWeek(Department department, int year, int week);
}