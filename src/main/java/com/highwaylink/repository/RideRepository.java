package com.highwaylink.repository;

import com.highwaylink.model.Ride;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface RideRepository extends MongoRepository<Ride, String> {
    List<Ride> findByOwnerId(String ownerId);
    List<Ride> findByOriginContainingIgnoreCase(String origin);
    List<Ride> findByDestinationContainingIgnoreCase(String destination);
    List<Ride> findByOriginContainingIgnoreCaseAndDestinationContainingIgnoreCase(String origin, String destination);
    List<Ride> findByOwnerIdAndStatus(String ownerId, String status);
}
