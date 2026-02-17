package com.highwaylink.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.highwaylink.model.Notification;
import com.highwaylink.repository.NotificationRepository;
/**
 * NotificationService
 *
 * Handles business logic related to user notifications.
 * Communicates between Controller layer and NotificationRepository.
 */
@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;
    /**
     * -----------------------------------------
     * Create a new notification **/

    public Notification createNotification(String userId, String message, String type, String relatedId) {
        Notification notification = new Notification(userId, message, type, relatedId);
        return notificationRepository.save(notification);
    }

    /**
     * -----------------------------------------
     * Retrieve all notifications for a user
     * Ordered by creation date (latest first)
     **/ 
    
    public List<Notification> getUserNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
/**
     * -----------------------------------------
     * Get count of unread notifications
     **/
    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

   /**
     * -----------------------------------------
     * Mark a single notification as read
     **/

    public Notification markAsRead(String id) {
        if (id == null)
            return null;
        Notification notification = notificationRepository.findById(id).orElse(null);
        if (notification != null) {
            notification.setRead(true);
            return notificationRepository.save(notification);
        }
        return null;
    }

    public void markAllAsRead(String userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        notifications.forEach(n -> {
            if (!n.isRead()) {
                n.setRead(true);
                notificationRepository.save(n);
            }
        });
    }
}
