package com.medicore.patient.controller;

import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = "*")
public class PatientController {

    private final Map<String, Patient> patients = new ConcurrentHashMap<>();

    public record Patient(
        String id,
        String name,
        String email,
        String phone,
        int age,
        String gender
    ) {}

    @GetMapping
    public Collection<Patient> getPatients() {
        return patients.values();
    }

    @PostMapping
    public Patient addPatient(@RequestBody Patient request) {
        Patient patient = new Patient(
            UUID.randomUUID().toString(),
            request.name(),
            request.email(),
            request.phone(),
            request.age(),
            request.gender()
        );

        patients.put(patient.id(), patient);
        return patient;
    }

    @GetMapping("/{id}")
    public Patient getPatient(@PathVariable String id) {
        Patient patient = patients.get(id);
        if (patient == null) {
            throw new NoSuchElementException("Patient not found");
        }
        return patient;
    }

    @DeleteMapping("/{id}")
    public Map<String, String> deletePatient(@PathVariable String id) {
        if (patients.remove(id) == null) {
            throw new NoSuchElementException("Patient not found");
        }
        return Map.of("message", "Patient deleted successfully");
    }
}
