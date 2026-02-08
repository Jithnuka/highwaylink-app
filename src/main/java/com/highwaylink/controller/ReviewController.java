package com.highwaylink.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.highwaylink.model.Review;
import com.highwaylink.service.ReviewService;
import com.highwaylink.service.UserService;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
public class ReviewController {

    private static final Logger logger = LoggerFactory.getLogger(ReviewController.class);

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<Review> submitReview(
            @RequestBody ReviewRequest request,
            Authentication authentication) {

        String userEmail = authentication.getName();
        String userId = userService.getUserByEmail(userEmail).getId();

        logger.info("POST /api/reviews - user: {}", userId);

        Review review = reviewService.submitReview(
                request.getRideId(),
                userId,
                request.getDriverId(),
                request.getRating(),
                request.getComment());

        return ResponseEntity.ok(review);
    }

    @GetMapping("/driver/{driverId}")
    public ResponseEntity<List<Review>> getReviewsForDriver(@PathVariable String driverId) {
        logger.info("GET /api/reviews/driver/{} - Fetching reviews", driverId);
        List<Review> reviews = reviewService.getReviewsForDriver(driverId);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/ride/{rideId}")
    public ResponseEntity<List<Review>> getReviewsForRide(@PathVariable String rideId) {
        logger.info("GET /api/reviews/ride/{} - Fetching reviews", rideId);
        List<Review> reviews = reviewService.getReviewsForRide(rideId);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Review>> getReviewsByUser(@PathVariable String userId) {
        logger.info("GET /api/reviews/user/{} - Fetching reviews", userId);
        List<Review> reviews = reviewService.getReviewsByReviewer(userId);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/driver/{driverId}/average")
    public ResponseEntity<Double> getAverageRatingForDriver(@PathVariable String driverId) {
        logger.info("GET /api/reviews/driver/{}/average - Fetching average rating", driverId);
        double average = reviewService.getAverageRatingForDriver(driverId);
        return ResponseEntity.ok(average);
    }

    // DTO for review request
    public static class ReviewRequest {
        private String rideId;
        private String driverId;
        private int rating;
        private String comment;

        public String getRideId() {
            return rideId;
        }

        public void setRideId(String rideId) {
            this.rideId = rideId;
        }

        public String getDriverId() {
            return driverId;
        }

        public void setDriverId(String driverId) {
            this.driverId = driverId;
        }

        public int getRating() {
            return rating;
        }

        public void setRating(int rating) {
            this.rating = rating;
        }

        public String getComment() {
            return comment;
        }

        public void setComment(String comment) {
            this.comment = comment;
        }
    }
}