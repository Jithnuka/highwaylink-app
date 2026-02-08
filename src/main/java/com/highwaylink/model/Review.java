package com.highwaylink.model;

import java.util.Date;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Document("reviews")
public class Review {

    @Id
    private String id;
    private String rideId;
    private String reviewerId; // passenger who is reviewing
    private String driverId; // driver being reviewed
    private int rating; // 1-5 stars
    private String comment;
    private Date createdAt = new Date();

    public Review() {}

    public Review(String rideId, String reviewerId, String driverId, int rating, String comment) {
        this.rideId = rideId;
        this.reviewerId = reviewerId;
        this.driverId = driverId;
        this.rating = rating;
        this.comment = comment;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getRideId() { return rideId; }
    public void setRideId(String rideId) { this.rideId = rideId; }

    public String getReviewerId() { return reviewerId; }
    public void setReviewerId(String reviewerId) { this.reviewerId = reviewerId; }

    public String getDriverId() { return driverId; }
    public void setDriverId(String driverId) { this.driverId = driverId; }

    public int getRating() { return rating; }
    public void setRating(int rating) { this.rating = rating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
}