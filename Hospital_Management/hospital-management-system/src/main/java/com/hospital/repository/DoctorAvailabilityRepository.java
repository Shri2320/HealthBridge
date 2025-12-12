package com.hospital.repository;

import com.hospital.model.Doctor;
import com.hospital.model.DoctorAvailability;
import com.hospital.model.DayOfWeek;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorAvailabilityRepository extends JpaRepository<DoctorAvailability, Long> {
    List<DoctorAvailability> findByDoctor(Doctor doctor);
    Optional<DoctorAvailability> findByDoctorAndDayOfWeek(Doctor doctor, DayOfWeek dayOfWeek);
    List<DoctorAvailability> findByDoctorAndIsAvailable(Doctor doctor, Boolean isAvailable);
}
