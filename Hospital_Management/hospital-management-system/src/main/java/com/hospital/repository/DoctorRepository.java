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
    Optional<Doctor> findByEmail(String email);
    boolean existsByEmail(String email);
    List<Doctor> findByHospital(Hospital hospital);
    List<Doctor> findByDepartment(Department department);
    List<Doctor> findByHospitalAndDepartment(Hospital hospital, Department department);
}
