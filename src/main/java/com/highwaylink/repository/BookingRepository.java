package com.highwaylink.repository;

import com.highwaylink.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByPassengerId(String passengerId);
    List<Booking> findByRideId(String rideId);
}
