package com.highwaylink.repository;

import com.highwaylink.model.Message;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface MessageRepository extends MongoRepository<Message, String> {
    List<Message> findByRideIdOrderBySentAtAsc(String rideId);
}
