package com.highwaylink.repository;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import com.highwaylink.model.Notification;

public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);

    long countByUserIdAndIsReadFalse(String userId);
}
