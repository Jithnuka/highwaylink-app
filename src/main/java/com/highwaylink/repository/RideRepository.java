package com.highwaylink.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.highwaylink.model.Ride;

public interface RideRepository extends MongoRepository<Ride, String> {
    List<Ride> findByOwnerId(String ownerId);
    List<Ride> findByOriginContainingIgnoreCase(String origin);
    List<Ride> findByDestinationContainingIgnoreCase(String destination);
    List<Ride> findByOriginContainingIgnoreCaseAndDestinationContainingIgnoreCase(
        String origin, String destination);
}
