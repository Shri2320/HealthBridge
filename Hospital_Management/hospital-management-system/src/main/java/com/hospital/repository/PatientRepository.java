package com.hospital.repository;

import com.hospital.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    // Kept for consistency, but less reliable than IgnoreCase
    Optional<Patient> findByEmail(String email);
    boolean existsByEmail(String email);

    // ✅ NEW: Add methods for robust, case-insensitive checks
    Optional<Patient> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
}