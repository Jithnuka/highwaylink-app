// RideController.java - Complete with all endpoints properly defined
package com.highwaylink.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.highwaylink.DTO.BookingRequestDTO;
import com.highwaylink.DTO.MyRidesResponseDTO;
import com.highwaylink.DTO.RideCreateRequestDTO;
import com.highwaylink.DTO.RideDTO;
import com.highwaylink.config.JwtUtil;
import com.highwaylink.model.Ride;
import com.highwaylink.service.RideService;
import com.highwaylink.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/rides")
@CrossOrigin(origins = "*")
public class RideController {

    private static final Logger logger = LoggerFactory.getLogger(RideController.class);

    @Autowired
    private RideService rideService;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Extract user ID from JWT token (helper method)
     */
    private String extractUserIdFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        String token = authHeader.substring(7);
        return jwtUtil.extractUserId(token);
    }

    @GetMapping("/public")
    public ResponseEntity<List<RideDTO>> getPublicRides(
            @RequestParam(required = false) String origin,
            @RequestParam(required = false) String destination,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        logger.info("GET /api/rides/public - origin: {}, destination: {}", origin, destination);
        
        String userId = extractUserIdFromToken(authHeader);
        List<RideDTO> rides = rideService.getPublicRides(origin, destination, userId);
        
        return ResponseEntity.ok(rides);
    }

    @GetMapping
    public ResponseEntity<List<RideDTO>> getAllRides() {
        logger.info("GET /api/rides - Fetching all rides");
        List<RideDTO> rides = rideService.getAllRides();
        return ResponseEntity.ok(rides);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RideDTO> getRideById(@PathVariable String id) {
        logger.info("GET /api/rides/{} - Fetching ride", id);
        RideDTO ride = rideService.getRideById(id);
        return ResponseEntity.ok(ride);
    }

    @GetMapping("/search")
    public ResponseEntity<List<RideDTO>> searchRides(
            @RequestParam(required = false) String origin,
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) String date,
            @RequestParam(required = false) String timeFrom,
            @RequestParam(required = false) String timeTo,
            @RequestParam(required = false) String vehicleType,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        logger.info("GET /api/rides/search - origin: {}, destination: {}, date: {}, timeFrom: {}, timeTo: {}, vehicleType: {}", 
                   origin, destination, date, timeFrom, timeTo, vehicleType);
        
        String userId = extractUserIdFromToken(authHeader);
        List<RideDTO> rides = rideService.searchRides(origin, destination, date, timeFrom, timeTo, vehicleType, userId);
        
        return ResponseEntity.ok(rides);
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<RideDTO>> getRidesByOwnerId(@PathVariable String ownerId) {
        logger.info("GET /api/rides/owner/{} - Fetching rides", ownerId);
        List<RideDTO> rides = rideService.getRidesByOwnerId(ownerId);
        return ResponseEntity.ok(rides);
    }

    @GetMapping("/my-rides")
    public ResponseEntity<MyRidesResponseDTO> getMyRides(Authentication authentication) {
        String userEmail = authentication.getName();
        String userId = userService.getUserByEmail(userEmail).getId();
        
        logger.info("GET /api/rides/my-rides - user: {}", userId);
        
        MyRidesResponseDTO rides = rideService.getMyRides(userId);
        return ResponseEntity.ok(rides);
    }

    @GetMapping("/my-offers")
    public ResponseEntity<List<RideDTO>> getMyOffers(Authentication authentication) {
        String userEmail = authentication.getName();
        String userId = userService.getUserByEmail(userEmail).getId();
        
        logger.info("GET /api/rides/my-offers - user: {}", userId);
        
        List<RideDTO> offers = rideService.getMyOffers(userId);
        return ResponseEntity.ok(offers);
    }

    @PostMapping("/{id}/book")
    public ResponseEntity<RideDTO> bookRide(
            @PathVariable String id,
            @RequestBody(required = false) BookingRequestDTO bookingRequest,
            Authentication authentication) {
        
        String userEmail = authentication.getName();
        String userId = userService.getUserByEmail(userEmail).getId();
        
        int seatsRequested = (bookingRequest != null && bookingRequest.getSeatsRequested() > 0) 
            ? bookingRequest.getSeatsRequested() 
            : 1;
        
        logger.info("POST /api/rides/{}/book - user: {}, seats: {}", id, userId, seatsRequested);
        
        RideDTO ride = rideService.bookRide(id, userId, seatsRequested);
        return ResponseEntity.ok(ride);
    }

    @DeleteMapping("/{id}/cancel-request")
    public ResponseEntity<RideDTO> cancelBookingRequest(
            @PathVariable String id,
            Authentication authentication) {
        
        String userEmail = authentication.getName();
        String userId = userService.getUserByEmail(userEmail).getId();
        
        logger.info("DELETE /api/rides/{}/cancel-request - user: {}", id, userId);
        
        RideDTO ride = rideService.cancelBookingRequest(id, userId);
        return ResponseEntity.ok(ride);
    }

    @PostMapping("/{id}/accept/{passengerId}")
    public ResponseEntity<RideDTO> acceptBookingRequest(
            @PathVariable String id,
            @PathVariable String passengerId,
            Authentication authentication) {
        
        String userEmail = authentication.getName();
        String ownerId = userService.getUserByEmail(userEmail).getId();
        
        logger.info("POST /api/rides/{}/accept/{} - owner: {}", id, passengerId, ownerId);
        
        RideDTO ride = rideService.acceptBookingRequest(id, passengerId, ownerId);
        return ResponseEntity.ok(ride);
    }

    @PostMapping("/{id}/reject/{passengerId}")
    public ResponseEntity<RideDTO> rejectBookingRequest(
            @PathVariable String id,
            @PathVariable String passengerId,
            Authentication authentication) {
        
        String userEmail = authentication.getName();
        String ownerId = userService.getUserByEmail(userEmail).getId();
        
        logger.info("POST /api/rides/{}/reject/{} - owner: {}", id, passengerId, ownerId);
        
        RideDTO ride = rideService.rejectBookingRequest(id, passengerId, ownerId);
        return ResponseEntity.ok(ride);
    }

    @DeleteMapping("/{id}/remove-passenger/{passengerId}")
    public ResponseEntity<RideDTO> removePassenger(
            @PathVariable String id,
            @PathVariable String passengerId,
            Authentication authentication) {
        
        String userEmail = authentication.getName();
        String ownerId = userService.getUserByEmail(userEmail).getId();
        
        logger.info("DELETE /api/rides/{}/remove-passenger/{} - owner: {}", id, passengerId, ownerId);
        
        RideDTO ride = rideService.removePassenger(id, passengerId, ownerId);
        return ResponseEntity.ok(ride);
    }

    @PostMapping
    public ResponseEntity<RideDTO> createRide(
            @Valid @RequestBody RideCreateRequestDTO request,
            Authentication authentication) {
        
        String userEmail = authentication.getName();
        logger.info("POST /api/rides - Creating ride for user: {}", userEmail);
        
        RideDTO ride = rideService.createRide(request, userEmail);
        return ResponseEntity.ok(ride);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RideDTO> updateRide(
            @PathVariable String id,
            @RequestBody Ride ride,
            Authentication authentication) {
        
        String userEmail = authentication.getName();
        logger.info("PUT /api/rides/{} - user: {}", id, userEmail);
        
        RideDTO updated = rideService.updateRide(id, ride, userEmail);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRide(
            @PathVariable String id,
            Authentication authentication) {
        
        String userEmail = authentication.getName();
        logger.info("DELETE /api/rides/{} - user: {}", id, userEmail);
        
        rideService.deleteRide(id, userEmail);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/mark-payment-collected/{passengerId}")
    public ResponseEntity<RideDTO> markPaymentCollected(
            @PathVariable String id,
            @PathVariable String passengerId,
            @RequestParam Double amount,
            Authentication authentication) {
        
        String userEmail = authentication.getName();
        String ownerId = userService.getUserByEmail(userEmail).getId();
        
        logger.info("POST /api/rides/{}/mark-payment-collected/{} - owner: {}, amount: {}", id, passengerId, ownerId, amount);
        
        RideDTO ride = rideService.markPaymentCollected(id, passengerId, ownerId, amount);
        return ResponseEntity.ok(ride);
    }

    @GetMapping("/earnings/today")
    public ResponseEntity<java.util.Map<String, Object>> getTodayEarnings(Authentication authentication) {
        String userEmail = authentication.getName();
        String ownerId = userService.getUserByEmail(userEmail).getId();
        
        logger.info("GET /api/rides/earnings/today - owner: {}", ownerId);
        
        java.util.Map<String, Object> earnings = rideService.getTodayEarnings(ownerId);
        return ResponseEntity.ok(earnings);
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<RideDTO> startRide(
            @PathVariable String id,
            Authentication authentication) {
        
        String userEmail = authentication.getName();
        String ownerId = userService.getUserByEmail(userEmail).getId();
        
        logger.info("POST /api/rides/{}/start - owner: {}", id, ownerId);
        
        RideDTO ride = rideService.startRide(id, ownerId);
        return ResponseEntity.ok(ride);
    }

    @PostMapping("/{id}/end")
    public ResponseEntity<RideDTO> endRide(
            @PathVariable String id,
            Authentication authentication) {
        
        String userEmail = authentication.getName();
        String ownerId = userService.getUserByEmail(userEmail).getId();
        
        logger.info("POST /api/rides/{}/end - owner: {}", id, ownerId);
        
        RideDTO ride = rideService.endRide(id, ownerId);
        return ResponseEntity.ok(ride);
    }
}