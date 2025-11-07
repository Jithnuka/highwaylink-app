package com.highwaylink.model;


import java.util.Date;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("bookings")
public class Booking {
    @Id private String id;
    private String rideId;
    private String passengerId;
    private String passengerName;
    private int seatsRequested = 1;
    private String status = "PENDING"; // PENDING / ACCEPTED / REJECTED / CANCELLED
    private Date requestedAt = new Date();

    public void setId(String id) {
        this.id = id;
    }

    public void setRideId(String rideId) {
        this.rideId = rideId;
    }

    public void setPassengerId(String passengerId) {
        this.passengerId = passengerId;
    }

    public void setPassengerName(String passengerName) {
        this.passengerName = passengerName;
    }

    public void setSeatsRequested(int seatsRequested) {
        this.seatsRequested = seatsRequested;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setRequestedAt(Date requestedAt) {
        this.requestedAt = requestedAt;
    }

    public String getId() {
        return id;
    }

    public String getRideId() {
        return rideId;
    }

    public String getPassengerId() {
        return passengerId;
    }

    public int getSeatsRequested() {
        return seatsRequested;
    }

    public String getPassengerName() {
        return passengerName;
    }

    public String getStatus() {
        return status;
    }

    public Date getRequestedAt() {
        return requestedAt;
    }
}
