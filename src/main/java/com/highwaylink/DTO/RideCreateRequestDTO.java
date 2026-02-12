package com.highwaylink.DTO;

import java.util.Date;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public class RideCreateRequestDTO {
    @NotBlank(message = "Origin is required")
    private String origin;

    @NotBlank(message = "Destination is required")
    private String destination;

    @NotNull(message = "Start time is required")
    private Date startTime;

    @Min(value = 1, message = "Total seats must be at least 1")
    private int totalSeats;

    @DecimalMin(value = "0.0", inclusive = false, message = "Price per seat must be greater than 0")
    private double pricePerSeat;

    private String schedule;

    @NotBlank(message = "Owner contact is required")
    @Pattern(regexp = "^0\\d{9}$", message = "Invalid contact number format. Must be 10 digits starting with 0 (e.g., 0712345678)")
    private String ownerContact;

    public RideCreateRequestDTO() {
    }

    public String getOrigin() {
        return origin;
    }

    public void setOrigin(String origin) {
        this.origin = origin;
    }

    public String getDestination() {
        return destination;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public Date getStartTime() {
        return startTime;
    }

    public void setStartTime(Date startTime) {
        this.startTime = startTime;
    }

    public int getTotalSeats() {
        return totalSeats;
    }

    public void setTotalSeats(int totalSeats) {
        this.totalSeats = totalSeats;
    }

    public double getPricePerSeat() {
        return pricePerSeat;
    }

    public void setPricePerSeat(double pricePerSeat) {
        this.pricePerSeat = pricePerSeat;
    }

    public String getSchedule() {
        return schedule;
    }

    public void setSchedule(String schedule) {
        this.schedule = schedule;
    }

    public String getOwnerContact() {
        return ownerContact;
    }

    public void setOwnerContact(String ownerContact) {
        this.ownerContact = ownerContact;
    }
}