package com.highwaylink.DTO;

import java.util.Date;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;

public class RideUpdateRequestDTO {
    private String origin;
    private String destination;
    private Date startTime;
    
    @Min(value = 1, message = "Total seats must be at least 1")
    private int totalSeats;
    
    @DecimalMin(value = "0.0", inclusive = false, message = "Price per seat must be greater than 0")
    private double pricePerSeat;
    
    private String schedule;
    private String ownerContact;

    public RideUpdateRequestDTO() {}

    public String getOrigin() { return origin; }
    public void setOrigin(String origin) { this.origin = origin; }

    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }

    public Date getStartTime() { return startTime; }
    public void setStartTime(Date startTime) { this.startTime = startTime; }

    public int getTotalSeats() { return totalSeats; }
    public void setTotalSeats(int totalSeats) { this.totalSeats = totalSeats; }

    public double getPricePerSeat() { return pricePerSeat; }
    public void setPricePerSeat(double pricePerSeat) { this.pricePerSeat = pricePerSeat; }

    public String getSchedule() { return schedule; }
    public void setSchedule(String schedule) { this.schedule = schedule; }

    public String getOwnerContact() { return ownerContact; }
    public void setOwnerContact(String ownerContact) { this.ownerContact = ownerContact; }
}
