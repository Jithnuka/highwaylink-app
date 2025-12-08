package com.highwaylink.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.highwaylink.model.Inquiry;

public interface InquiryRepository extends MongoRepository<Inquiry, String> {
    List<Inquiry> findByUserEmail(String userEmail);
    List<Inquiry> findByUserId(String userId);
}
