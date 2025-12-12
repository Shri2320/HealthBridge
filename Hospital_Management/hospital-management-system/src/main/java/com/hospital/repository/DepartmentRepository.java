package com.hospital.repository;

import com.hospital.model.Department;
import com.hospital.model.DepartmentType;
import com.hospital.model.Hospital;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    List<Department> findByHospital(Hospital hospital);
    Optional<Department> findByHospitalAndName(Hospital hospital, DepartmentType name);
}
