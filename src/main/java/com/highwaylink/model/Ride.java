package com.highwaylink.model;

import java.util.Date;
import java.util.List;
import java.util.ArrayList;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Document("rides")
public class Ride {

    @Id
    private String id;
    private String ownerId;
    private String ownerName;
    @JsonProperty
    private String ownerContact;
    private String origin;
    private String destination;
    private Date startTime;
    private int seatsAvailable;
    private int totalSeats;
    private double pricePerSeat;
    private String schedule;
    private boolean active = true;
    private Date createdAt = new Date();
    private String status;



    @JsonProperty("requests")
    private List<String> requests = new ArrayList<>();
    private List<String> passengers = new ArrayList<>();
    @JsonProperty("acceptedPassengers")
    private List<String> acceptedPassengers = new ArrayList<>();
    private List<String> canceledRequests = new ArrayList<>();   // ids of canceled requests


    public String getId() {
        return id;
    }

    public String getOwnerId() {
        return ownerId;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public String getOwnerContact() { return ownerContact; }


    public String getOrigin() {
        return origin;
    }

    public String getDestination() {
        return destination;
    }

    public Date getStartTime() {
        return startTime;
    }

    public int getSeatsAvailable() {
        return seatsAvailable;
    }

    public int getTotalSeats() {
        return totalSeats;
    }

    public double getPricePerSeat() {
        return pricePerSeat;
    }

    public String getSchedule() {
        return schedule;
    }

    public boolean isActive() {
        return active;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public List<String> getRequests() {
        return requests;
    }

    public List<String> getPassengers() {
        return passengers;
    }

    public List<String> getAcceptedPassengers() {
        return acceptedPassengers;
    }

    public List<String> getCanceledRequests() {
        return canceledRequests;
    }


    public void setId(String id) {
        this.id = id;
    }

    public void setOwnerId(String ownerId) {
        this.ownerId = ownerId;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }

    public void setOwnerContact(String ownerContact) {
        this.ownerContact = ownerContact;
    }

    public void setOrigin(String origin) {
        this.origin = origin;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public void setStartTime(Date startTime) {
        this.startTime = startTime;
    }

    public void setSeatsAvailable(int seatsAvailable) {
        this.seatsAvailable = seatsAvailable;
    }

    public void setTotalSeats(int totalSeats) {
        this.totalSeats = totalSeats;
    }

    public void setPricePerSeat(double pricePerSeat) {
        this.pricePerSeat = pricePerSeat;
    }

    public void setSchedule(String schedule) {
        this.schedule = schedule;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public void setRequests(List<String> requests) {
        this.requests = requests;
    }

    public void setPassengers(List<String> passengers) {
        this.passengers = passengers;
    }

    public void setAcceptedPassengers(List<String> acceptedPassengers) {
        this.acceptedPassengers = acceptedPassengers;
    }

    public void setCanceledRequests(List<String> canceledRequests) {
        this.canceledRequests = canceledRequests;
    }
}
