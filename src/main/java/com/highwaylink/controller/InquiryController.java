package com.highwaylink.controller;

import com.highwaylink.model.Inquiry;
import com.highwaylink.repository.InquiryRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inquiries")
@CrossOrigin(origins = "http://localhost:5173")
public class InquiryController {

    @Autowired
    private InquiryRepository inquiryRepository;

    @PostMapping
    public ResponseEntity<?> createInquiry(@RequestBody Inquiry inquiry) {
        try {
            if (inquiry.getUserId() == null || inquiry.getUserId().isEmpty()) {
                inquiry.setUserId("anonymous");
                inquiry.setUserName("Anonymous");
                inquiry.setUserEmail("");
            }

            Inquiry saved = inquiryRepository.save(inquiry);
            return ResponseEntity.ok(Map.of(
                    "message", "Inquiry submitted successfully!",
                    "inquiry", saved
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error submitting inquiry: " + e.getMessage()));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllInquiries() {
        List<Inquiry> inquiries = inquiryRepository.findAll();
        return ResponseEntity.ok(inquiries);
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<?> resolveInquiry(@PathVariable String id) {
        try {
            Inquiry inquiry = inquiryRepository.findById(id).orElse(null);
            if (inquiry == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Inquiry not found"));
            }

            inquiry.setResolved(true);
            inquiryRepository.save(inquiry);
            return ResponseEntity.ok(Map.of("message", "Inquiry marked as resolved"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to resolve inquiry: " + e.getMessage()));
        }
    }

    // GET - get inquiries by user email
    @GetMapping("/user/{email}")
    public ResponseEntity<?> getUserInquiries(@PathVariable String email) {
        List<Inquiry> inquiries = inquiryRepository.findByUserEmail(email);
        return ResponseEntity.ok(inquiries);
    }
}
