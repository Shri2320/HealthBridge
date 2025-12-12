package com.hospital.repository;

import com.hospital.model.MedicalDocument;
import com.hospital.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MedicalDocumentRepository extends JpaRepository<MedicalDocument, Long> {
    List<MedicalDocument> findByPatient(Patient patient);
    List<MedicalDocument> findByPatientOrderByUploadDateDesc(Patient patient);
}

