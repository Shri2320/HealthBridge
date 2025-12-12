package com.hospital.model;

import com.fasterxml.jackson.annotation.JsonIgnore; // <--- Import added
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "departments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Department {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private DepartmentType name;

    @ManyToOne
    @JoinColumn(name = "hospital_id")
    @JsonIgnore // <--- PREVENTS RECURSION (Hospital -> Department -> Hospital)
    private Hospital hospital;

    @OneToMany(mappedBy = "department")
    @JsonIgnore // <--- PREVENTS RECURSION (Doctor -> Department -> List<Doctor>)
    private List<Doctor> doctors = new ArrayList<>();

    @OneToMany(mappedBy = "department")
    @JsonIgnore // <--- PREVENTS RECURSION
    private List<Appointment> appointments = new ArrayList<>();

    private Integer totalPatientsTreated = 0;

    @CreationTimestamp
    private LocalDateTime createdAt;
}