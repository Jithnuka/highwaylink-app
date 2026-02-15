package com.highwaylink.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.highwaylink.model.Ride;

public interface RideRepository extends MongoRepository<Ride, String> {
    List<Ride> findByOwnerId(String ownerId);

    Page<Ride> findByOwnerId(String ownerId, Pageable pageable);

    List<Ride> findByOwnerIdAndStatus(String ownerId, String status);

    Page<Ride> findByOwnerIdAndStatus(String ownerId, String status, Pageable pageable);

    Page<Ride> findByAcceptedPassengersContains(String userId, Pageable pageable);

    Page<Ride> findByRequestsContains(String userId, Pageable pageable);

    Page<Ride> findByCanceledRequestsContains(String userId, Pageable pageable);

    List<Ride> findByOriginContainingIgnoreCaseAndActiveTrueAndSeatsAvailableGreaterThan(String origin, int seats);

    List<Ride> findByDestinationContainingIgnoreCaseAndActiveTrueAndSeatsAvailableGreaterThan(String destination,
            int seats);

    List<Ride> findByOriginContainingIgnoreCaseAndDestinationContainingIgnoreCaseAndActiveTrueAndSeatsAvailableGreaterThan(
            String origin, String destination, int seats);

    List<Ride> findByActiveTrueAndSeatsAvailableGreaterThan(int seats);

    Page<Ride> findByActiveTrueAndSeatsAvailableGreaterThan(int seats, Pageable pageable);
}