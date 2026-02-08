package com.highwaylink.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.highwaylink.exception.BadRequestException;
import com.highwaylink.exception.ResourceNotFoundException;
import com.highwaylink.model.Review;
import com.highwaylink.model.Ride;
import com.highwaylink.repository.ReviewRepository;

import com.highwaylink.repository.RideRepository;
import com.highwaylink.model.User;

@Service
public class ReviewService {

    private static final Logger logger = LoggerFactory.getLogger(ReviewService.class);

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private com.highwaylink.repository.UserRepository userRepository;

    public Review submitReview(String rideId, String reviewerId, String driverId, int rating, String comment) {
        logger.info("Submitting review for ride {} by reviewer {}", rideId, reviewerId);

        // Validate rating
        if (rating < 1 || rating > 5) {
            throw new BadRequestException("Rating must be between 1 and 5");
        }

        // Check if ride exists and is completed
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found"));

        if (!"COMPLETED".equals(ride.getStatus())) {
            throw new BadRequestException("Can only review completed rides");
        }

        // Check if reviewer was a passenger on this ride
        boolean wasPassenger = ride.getAcceptedPassengers().contains(reviewerId);
        if (!wasPassenger) {
            throw new BadRequestException("Only passengers of the ride can submit reviews");
        }

        // Check if review already exists
        if (reviewRepository.existsByRideIdAndReviewerId(rideId, reviewerId)) {
            throw new BadRequestException("Review already submitted for this ride");
        }

        Review review = new Review(rideId, reviewerId, driverId, rating, comment);
        Review savedReview = reviewRepository.save(review);

        // Update Driver's Average Rating
        updateDriverAverageRating(driverId);

        // Notify Driver
        try {
            String msg = "You received a new " + rating + "-star review!";
            notificationService.createNotification(driverId, msg, "SUCCESS", rideId);
        } catch (Exception e) {
            logger.error("Failed to notify driver {} about new review", driverId, e);
        }

        return savedReview;
    }

    private void updateDriverAverageRating(String driverId) {
        try {
            List<Review> reviews = reviewRepository.findByDriverId(driverId);
            double avg = reviews.stream()
                    .mapToInt(Review::getRating)
                    .average()
                    .orElse(0.0);

            // Round to 1 decimal place
            avg = Math.round(avg * 10.0) / 10.0;

            com.highwaylink.model.User driver = userRepository.findById(driverId)
                    .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));

            driver.setAverageRating(avg);
            userRepository.save(driver);
            logger.info("Updated average rating for driver {} to {}", driverId, avg);
        } catch (Exception e) {
            logger.error("Failed to update average rating for driver {}", driverId, e);
        }
    }

    public List<Review> getReviewsForDriver(String driverId) {
        logger.info("Fetching reviews for driver {}", driverId);
        return reviewRepository.findByDriverId(driverId);
    }

    public List<Review> getReviewsForRide(String rideId) {
        logger.info("Fetching reviews for ride {}", rideId);
        return reviewRepository.findByRideId(rideId);
    }

    public double getAverageRatingForDriver(String driverId) {
        List<Review> reviews = reviewRepository.findByDriverId(driverId);
        if (reviews.isEmpty()) {
            return 0.0;
        }
        double avg = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);
        return Math.round(avg * 10.0) / 10.0;
    }

    public List<Review> getReviewsByReviewer(String reviewerId) {
        logger.info("Fetching reviews by reviewer {}", reviewerId);
        return reviewRepository.findByReviewerId(reviewerId);
    }
}