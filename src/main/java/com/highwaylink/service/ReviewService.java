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

@Service
public class ReviewService {

    private static final Logger logger = LoggerFactory.getLogger(ReviewService.class);

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private RideRepository rideRepository;

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
        return reviewRepository.save(review);
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
        List<Review> reviews = getReviewsForDriver(driverId);
        if (reviews.isEmpty()) {
            return 0.0;
        }
        return reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);
    }
}