package com.highwaylink.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.highwaylink.model.Review;

@Repository
public interface ReviewRepository extends MongoRepository<Review, String> {

    List<Review> findByDriverId(String driverId);

    List<Review> findByRideId(String rideId);

    List<Review> findByReviewerId(String reviewerId);

    boolean existsByRideIdAndReviewerId(String rideId, String reviewerId);
}