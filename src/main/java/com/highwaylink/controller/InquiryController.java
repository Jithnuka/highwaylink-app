package com.highwaylink.controller;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.highwaylink.model.Inquiry;
import com.highwaylink.service.InquiryService;

/**
 * InquiryController
 *
 * REST APIs for managing user inquiries.
 * Base URL: /api/inquiries
 */

@RestController
@RequestMapping("/api/inquiries")
@CrossOrigin(origins = "*") // Allows cross-origin requests (frontend integration)
public class InquiryController {
     // Logger for tracking API activity
    private static final Logger logger = LoggerFactory.getLogger(InquiryController.class);

     // Service layer dependency
    @Autowired
    private InquiryService inquiryService;

     /**
     * -----------------------------------------
     * API: Create Inquiry
     * Method: POST
     * URL: /api/inquiries
     *
     * Request Body: Inquiry JSON object
     * Response: Created Inquiry object
     * -----------------------------------------
     */
     
    @PostMapping
    public ResponseEntity<Inquiry> createInquiry(@RequestBody Inquiry inquiry) {
        logger.info("POST /api/inquiries - Creating inquiry");
        Inquiry saved = inquiryService.createInquiry(inquiry);
        return ResponseEntity.ok(saved);
    }

      /**
     * -----------------------------------------
     * API: Get All Inquiries
     * Method: GET
     * URL: /api/inquiries
     *
     * Response: List<Inquiry>
     * -----------------------------------------
     */
    @GetMapping
    public ResponseEntity<List<Inquiry>> getAllInquiries() {
        logger.info("GET /api/inquiries - Fetching all inquiries");
        List<Inquiry> inquiries = inquiryService.getAllInquiries();
        return ResponseEntity.ok(inquiries);
    }

      /**
     * -----------------------------------------
     * API: Get Inquiries by User Email
     * Method: GET
     * URL: /api/inquiries/user/{email}
     *
     * Path Variable: email (String)
     * Response: List<Inquiry>
     * -----------------------------------------
     */

    @GetMapping("/user/{email}")
    public ResponseEntity<List<Inquiry>> getInquiriesByUserEmail(@PathVariable String email) {
        logger.info("GET /api/inquiries/user/{} - Fetching inquiries", email);
        List<Inquiry> inquiries = inquiryService.getInquiriesByUserEmail(email);
        return ResponseEntity.ok(inquiries);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Inquiry> getInquiryById(@PathVariable String id) {
        logger.info("GET /api/inquiries/{} - Fetching inquiry", id);
        Inquiry inquiry = inquiryService.getInquiryById(id);
        return ResponseEntity.ok(inquiry);
    }
        /**
     * Update an existing inquiry
     * PUT /api/inquiries/{id}
     */

    @PutMapping("/{id}")
    public ResponseEntity<Inquiry> updateInquiry(
            @PathVariable String id,
            @RequestBody Inquiry inquiryUpdate) {
        logger.info("PUT /api/inquiries/{} - Updating inquiry", id);
        Inquiry updated = inquiryService.updateInquiry(id, inquiryUpdate);
        return ResponseEntity.ok(updated);
    }
    /**
     * Delete an inquiry by ID
     * DELETE /api/inquiries/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteInquiry(@PathVariable String id) {
        logger.info("DELETE /api/inquiries/{} - Deleting inquiry", id);
        inquiryService.deleteInquiry(id);
        return ResponseEntity.ok(Map.of("message", "Inquiry deleted successfully"));
    }
}
