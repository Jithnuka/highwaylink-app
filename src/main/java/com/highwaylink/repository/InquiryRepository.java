package com.highwaylink.repository;

import com.highwaylink.model.Inquiry;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface InquiryRepository extends MongoRepository<Inquiry, String> {
    List<Inquiry> findByUserEmail(String userEmail);
}
