package com.hospital.model;

public enum AppointmentStatus {
    SCHEDULED,  // <--- Add this (Used when patient first books)
    ACCEPTED,   // (Used when doctor approves)
    REJECTED,   // (Used when doctor denies)
    COMPLETED,  // (Optional: Used after visit is done)
    CANCELLED   // (Optional: Used if patient cancels)
}