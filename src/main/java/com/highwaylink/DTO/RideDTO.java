package com.highwaylink.DTO;

import java.util.Date;


public class RideDTO {
    private String id;
    private String ownerId;
    private String ownerName;
    private String ownerContact;
    private String ownerGender;        // NEW
    private String ownerVehicleType;   // NEW
    private String ownerVehicleNumber; // NEW
    
    private String origin;
    private String destination;
    private Date startTime;
    private int seatsAvailable;
    private int totalSeats;
    private double pricePerSeat;
    private String schedule;
    private boolean active;
    private Date createdAt;
    private String status; // NEW: Ride status field
    
    private java.util.List<String> requests;
    private java.util.List<String> acceptedPassengers;
    private java.util.List<String> canceledRequests;
    private java.util.List<com.highwaylink.model.Booking> bookings;

    public RideDTO() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getOwnerId() { return ownerId; }
    public void setOwnerId(String ownerId) { this.ownerId = ownerId; }

    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }

    public String getOwnerContact() { return ownerContact; }
    public void setOwnerContact(String ownerContact) { this.ownerContact = ownerContact; }

    // NEW GETTERS AND SETTERS
    public String getOwnerGender() { return ownerGender; }
    public void setOwnerGender(String ownerGender) { this.ownerGender = ownerGender; }

    public String getOwnerVehicleType() { return ownerVehicleType; }
    public void setOwnerVehicleType(String ownerVehicleType) { this.ownerVehicleType = ownerVehicleType; }

    public String getOwnerVehicleNumber() { return ownerVehicleNumber; }
    public void setOwnerVehicleNumber(String ownerVehicleNumber) { this.ownerVehicleNumber = ownerVehicleNumber; }

    public String getOrigin() { return origin; }
    public void setOrigin(String origin) { this.origin = origin; }

    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }

    public Date getStartTime() { return startTime; }
    public void setStartTime(Date startTime) { this.startTime = startTime; }

    public int getSeatsAvailable() { return seatsAvailable; }
    public void setSeatsAvailable(int seatsAvailable) { this.seatsAvailable = seatsAvailable; }

    public int getTotalSeats() { return totalSeats; }
    public void setTotalSeats(int totalSeats) { this.totalSeats = totalSeats; }

    public double getPricePerSeat() { return pricePerSeat; }
    public void setPricePerSeat(double pricePerSeat) { this.pricePerSeat = pricePerSeat; }

    public String getSchedule() { return schedule; }
    public void setSchedule(String schedule) { this.schedule = schedule; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public java.util.List<String> getRequests() { return requests; }
    public void setRequests(java.util.List<String> requests) { this.requests = requests; }

    public java.util.List<String> getAcceptedPassengers() { return acceptedPassengers; }
    public void setAcceptedPassengers(java.util.List<String> acceptedPassengers) { this.acceptedPassengers = acceptedPassengers; }

    public java.util.List<String> getCanceledRequests() { return canceledRequests; }
    public void setCanceledRequests(java.util.List<String> canceledRequests) { this.canceledRequests = canceledRequests; }

    public java.util.List<com.highwaylink.model.Booking> getBookings() { return bookings; }
    public void setBookings(java.util.List<com.highwaylink.model.Booking> bookings) { this.bookings = bookings; }
}