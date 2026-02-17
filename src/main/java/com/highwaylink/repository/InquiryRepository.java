package com.highwaylink.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.highwaylink.model.Inquiry;
/**
 * InquiryRepository
 *
 * Repository interface for Inquiry collection.
 * Extends MongoRepository to provide:
 * - Basic CRUD operations
 * - Pagination and sorting support
 *
 * MongoDB Collection: inquiries
 */

public interface InquiryRepository extends MongoRepository<Inquiry, String> {
    List<Inquiry> findByUserEmail(String userEmail);
    List<Inquiry> findByUserId(String userId);
}
