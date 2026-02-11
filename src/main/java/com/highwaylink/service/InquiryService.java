package com.highwaylink.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.highwaylink.exception.ResourceNotFoundException;
import com.highwaylink.model.Inquiry;
import com.highwaylink.repository.InquiryRepository;

@Service
public class InquiryService {

    private static final Logger logger = LoggerFactory.getLogger(InquiryService.class);

    @Autowired
    private com.highwaylink.repository.UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private InquiryRepository inquiryRepository;

    @Transactional
    public Inquiry createInquiry(Inquiry inquiry) {
        logger.info("Creating inquiry from user: {}", inquiry.getUserEmail());
        if (inquiry.getCreatedAt() == null) {
            inquiry.setCreatedAt(java.time.LocalDateTime.now());
        }
        Inquiry saved = inquiryRepository.save(inquiry);
        logger.info("Inquiry created with id: {}", saved.getId());

        // Notify Admins
        try {
            List<com.highwaylink.model.User> admins = userRepository.findByRole("ADMIN");
            for (com.highwaylink.model.User admin : admins) {
                notificationService.createNotification(
                        admin.getId(),
                        "New Inquiry from " + inquiry.getUserName() + ": " + inquiry.getSubject(),
                        "INFO",
                        saved.getId());
            }
        } catch (Exception e) {
            logger.error("Failed to notify admins about new inquiry", e);
        }

        return saved;
    }

    public List<Inquiry> getAllInquiries() {
        logger.info("Fetching all inquiries");
        List<Inquiry> inquiries = inquiryRepository.findAll();
        logger.info("Retrieved {} inquiries", inquiries.size());
        return inquiries;
    }

    public List<Inquiry> getInquiriesByUserEmail(String email) {
        logger.info("Fetching inquiries for user: {}", email);
        List<Inquiry> inquiries = inquiryRepository.findByUserEmail(email);
        logger.info("Retrieved {} inquiries for user: {}", inquiries.size(), email);
        return inquiries;
    }

    public Inquiry getInquiryById(String id) {
        logger.info("Fetching inquiry with id: {}", id);
        return inquiryRepository.findById(id)
                .orElseThrow(() -> {
                    logger.warn("Inquiry not found: {}", id);
                    return new ResourceNotFoundException("Inquiry not found");
                });
    }

    @Transactional
    public Inquiry updateInquiry(String id, Inquiry inquiryUpdate) {
        logger.info("Updating inquiry: {}", id);

        Inquiry inquiry = inquiryRepository.findById(id)
                .orElseThrow(() -> {
                    logger.warn("Inquiry not found for update: {}", id);
                    return new ResourceNotFoundException("Inquiry not found");
                });

        inquiry.setResolved(inquiryUpdate.isResolved());
        Inquiry updated = inquiryRepository.save(inquiry);

        logger.info("Inquiry updated: {}", id);
        return updated;
    }

    @Transactional
    public void deleteInquiry(String id) {
        logger.info("Deleting inquiry: {}", id);

        if (!inquiryRepository.existsById(id)) {
            logger.warn("Inquiry not found for deletion: {}", id);
            throw new ResourceNotFoundException("Inquiry not found");
        }

        inquiryRepository.deleteById(id);
        logger.info("Inquiry deleted: {}", id);

    }
}
