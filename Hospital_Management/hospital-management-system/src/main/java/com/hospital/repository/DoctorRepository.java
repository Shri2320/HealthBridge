package com.hospital.repository;

import com.hospital.model.Doctor;
import com.hospital.model.Hospital;
import com.hospital.model.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    // 1. For Login & Search (Case Insensitive is better)
    Optional<Doctor> findByEmailIgnoreCase(String email);

    // 2. Keep the old one just in case other services (like AdminService) still use it
    Optional<Doctor> findByEmail(String email);

    boolean existsByEmail(String email);

    // 3. For Admin Dashboard (Total Doctors Count)
    long countByHospital(Hospital hospital);

    // 4. For Patient Service (The method you were missing!)
    List<Doctor> findByHospitalAndDepartment(Hospital hospital, Department department);

    // Additional helper methods if needed
    List<Doctor> findByHospital(Hospital hospital);
    List<Doctor> findByDepartment(Department department);
}