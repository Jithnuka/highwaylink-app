package com.highwaylink.controller;

import com.highwaylink.model.Ride;
import com.highwaylink.model.User;
import com.highwaylink.repository.RideRepository;
import com.highwaylink.repository.UserRepository;
import com.highwaylink.config.JwtUtil;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.*;

@RestController
@RequestMapping("/api/rides")
@CrossOrigin(origins = "*")
public class RideController {


    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    //Create a new ride
    @PostMapping
    public ResponseEntity<?> createRide(@RequestBody Ride ride, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        String email = authentication.getName();
        User owner = userRepository.findByEmail(email).orElse(null);
        if (owner == null) {
            return ResponseEntity.status(401).body("Owner not found");
        }

        ride.setOwnerId(owner.getId());
        ride.setOwnerName(owner.getName());
        ride.setCreatedAt(new Date());
        ride.setActive(true);

        Ride savedRide = rideRepository.save(ride);
        return ResponseEntity.ok(savedRide);
    }

    @GetMapping
    public List<Ride> getRides(
            @RequestParam(required = false) String origin,
            @RequestParam(required = false) String destination
    ) {
        if (origin != null && destination != null) {
            return rideRepository.findByOriginContainingIgnoreCaseAndDestinationContainingIgnoreCase(origin, destination);
        } else if (origin != null) {
            return rideRepository.findByOriginContainingIgnoreCase(origin);
        } else if (destination != null) {
            return rideRepository.findByDestinationContainingIgnoreCase(destination);
        } else {
            return rideRepository.findAll();
        }
    }

    //Get single ride by ID (for RideDetails.jsx)
    @GetMapping("/{id}")
    public ResponseEntity<?> getRideById(@PathVariable String id) {
        return rideRepository.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body("Ride not found"));
    }

    //Passenger requests to join
    @PostMapping("/{rideId}/book")
    public ResponseEntity<?> requestJoin(@PathVariable String rideId, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        String email = authentication.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);
        Optional<Ride> rideOpt = rideRepository.findById(rideId);

        if (userOpt.isEmpty() || rideOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Ride or user not found");
        }

        Ride ride = rideOpt.get();
        User user = userOpt.get();

        if (ride.getRequests().contains(user.getId()) || ride.getAcceptedPassengers().contains(user.getId())) {
            return ResponseEntity.badRequest().body(Map.of("message", "You already requested or joined this ride"));
        }

        if (ride.getSeatsAvailable() <= 0) {
            return ResponseEntity.badRequest().body(Map.of("message", "No seats available"));
        }

        ride.getRequests().add(user.getId());
        rideRepository.save(ride);

        return ResponseEntity.ok(Map.of("message", "Request sent to owner"));
    }

    // Cancel ride request (for passengers)
    @PostMapping("/{rideId}/cancel")
    public ResponseEntity<?> cancelRequest(
            @PathVariable String rideId,
            Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        String email = authentication.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);
        Optional<Ride> rideOpt = rideRepository.findById(rideId);

        if (userOpt.isEmpty() || rideOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Ride or user not found");
        }

        User user = userOpt.get();
        Ride ride = rideOpt.get();

        if (ride.getRequests() != null && ride.getRequests().contains(user.getId())) {
            ride.getRequests().remove(user.getId());
            rideRepository.save(ride);
            return ResponseEntity.ok(Map.of("message", "Ride request canceled"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "No pending request to cancel"));
        }
    }

    //Owner accepts passenger
    @PostMapping("/{rideId}/accept/{userId}")
    public ResponseEntity<?> acceptPassenger(
            @PathVariable String rideId,
            @PathVariable String userId,
            Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        String email = authentication.getName();
        Optional<User> ownerOpt = userRepository.findByEmail(email);
        if (ownerOpt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Owner not found");

        Optional<Ride> rideOpt = rideRepository.findById(rideId);
        if (rideOpt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Ride not found");

        Ride ride = rideOpt.get();
        User owner = ownerOpt.get();

        if (!ride.getOwnerId().equals(owner.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not your ride");
        }

        if (ride.getRequests() == null) ride.setRequests(new ArrayList<>());
        if (ride.getAcceptedPassengers() == null) ride.setAcceptedPassengers(new ArrayList<>());

        if (ride.getRequests().contains(userId)) {
            ride.getRequests().remove(userId);
            ride.getAcceptedPassengers().add(userId);

            ride.setSeatsAvailable(ride.getSeatsAvailable() - 1);

            rideRepository.save(ride);
        }

        Map<String, String> response = new HashMap<>();
        response.put("message", "Passenger accepted");

        return ResponseEntity.ok(response);
    }

    // Owner cancels a passenger's request
    @PostMapping("/{rideId}/cancel-passenger/{passengerId}")
    public ResponseEntity<?> cancelPassengerRequest(
            @PathVariable String rideId,
            @PathVariable String passengerId,
            Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        String email = authentication.getName();
        Optional<User> ownerOpt = userRepository.findByEmail(email);
        Optional<Ride> rideOpt = rideRepository.findById(rideId);

        if (ownerOpt.isEmpty() || rideOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Ride or owner not found");
        }

        Ride ride = rideOpt.get();
        User owner = ownerOpt.get();

        // Check if this ride belongs to the owner
        if (!ride.getOwnerId().equals(owner.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not your ride");
        }

        // If passenger is in requests
        if (ride.getRequests() != null && ride.getRequests().contains(passengerId)) {
            ride.getRequests().remove(passengerId);

            // Add to canceledRequests list
            if (ride.getCanceledRequests() == null) ride.setCanceledRequests(new ArrayList<>());
            ride.getCanceledRequests().add(passengerId);

            rideRepository.save(ride);

            // Also remove ride from passenger's requests list if needed
            userRepository.findById(passengerId).ifPresent(passenger -> {
                // Optional: do something in passenger object if you track rides there
            });

            return ResponseEntity.ok(Map.of("message", "Passenger request canceled by owner"));
        }

        return ResponseEntity.badRequest().body(Map.of("message", "Passenger request not found"));
    }

    //Rides requested or approved by current user
    @GetMapping("/my-requests")
    public ResponseEntity<?> getUserRequestedRides(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        String email = authentication.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) return ResponseEntity.status(404).body("User not found");

        String userId = userOpt.get().getId();

        List<Ride> rides = rideRepository.findAll()
                .stream()
                .filter(r -> (r.getRequests() != null && r.getRequests().contains(userId))
                        || (r.getAcceptedPassengers() != null && r.getAcceptedPassengers().contains(userId)))
                .toList();

        return ResponseEntity.ok(rides);
    }

    @GetMapping("/my-offers")
    public ResponseEntity<?> getOwnerRides(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        String email = authentication.getName();
        User owner = userRepository.findByEmail(email).orElse(null);
        if (owner == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");

        // Fetch only ACTIVE rides
        List<Ride> rides = rideRepository.findByOwnerId(owner.getId())
                .stream()
                .filter(Ride::isActive)
                .toList();

        List<Map<String, Object>> response = new ArrayList<>();
        for (Ride r : rides) {
            Map<String, Object> rideMap = new HashMap<>();
            rideMap.put("id", r.getId());
            rideMap.put("origin", r.getOrigin());
            rideMap.put("destination", r.getDestination());
            rideMap.put("seatsAvailable", r.getSeatsAvailable());
            rideMap.put("totalSeats", r.getTotalSeats());
            rideMap.put("pricePerSeat", r.getPricePerSeat());
            rideMap.put("ownerId", r.getOwnerId());
            rideMap.put("ownerName", r.getOwnerName());
            rideMap.put("startTime", r.getStartTime());
            rideMap.put("schedule", r.getSchedule());
            rideMap.put("createdAt", r.getCreatedAt());

            // Map requests to {id, name}
            List<Map<String, String>> requestList = new ArrayList<>();
            if (r.getRequests() != null) {
                for (String uid : r.getRequests()) {
                    userRepository.findById(uid).ifPresent(u -> {
                        Map<String, String> uMap = new HashMap<>();
                        uMap.put("id", u.getId());
                        uMap.put("name", u.getName());
                        requestList.add(uMap);
                    });
                }
            }
            rideMap.put("requests", requestList);

            // Map accepted passengers to {id, name}
            List<Map<String, String>> acceptedList = new ArrayList<>();
            if (r.getAcceptedPassengers() != null) {
                for (String uid : r.getAcceptedPassengers()) {
                    userRepository.findById(uid).ifPresent(u -> {
                        Map<String, String> uMap = new HashMap<>();
                        uMap.put("id", u.getId());
                        uMap.put("name", u.getName());
                        acceptedList.add(uMap);
                    });
                }
            }
            rideMap.put("acceptedPassengers", acceptedList);

            response.add(rideMap);
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/my-rides")
    public ResponseEntity<?> getMyRides(Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Unauthorized"));
            }

            String email = authentication.getName();
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "User not found"));
            }

            User user = userOpt.get();
            String userId = user.getId();

            List<Ride> allRides = rideRepository.findAll();
            List<Map<String, Object>> pendingRequests = new ArrayList<>();
            List<Map<String, Object>> approvedRides = new ArrayList<>();
            List<Map<String, Object>> canceledRides = new ArrayList<>();

            for (Ride ride : allRides) {
                boolean isPending = ride.getRequests() != null && ride.getRequests().contains(userId);
                boolean isApproved = ride.getAcceptedPassengers() != null && ride.getAcceptedPassengers().contains(userId);
                boolean isCanceled = ride.getCanceledRequests() != null && ride.getCanceledRequests().contains(userId);

                Map<String, Object> rideMap = new HashMap<>();
                rideMap.put("id", ride.getId());
                rideMap.put("origin", ride.getOrigin());
                rideMap.put("destination", ride.getDestination());
                rideMap.put("seatsAvailable", ride.getSeatsAvailable());
                rideMap.put("totalSeats", ride.getTotalSeats());
                rideMap.put("pricePerSeat", ride.getPricePerSeat());
                rideMap.put("ownerId", ride.getOwnerId());
                rideMap.put("ownerName", ride.getOwnerName());
                rideMap.put("startTime", ride.getStartTime());
                rideMap.put("schedule", ride.getSchedule());
                rideMap.put("createdAt", ride.getCreatedAt());

                // Map requests with id & name
                List<Map<String, String>> requestsDto = new ArrayList<>();
                if (ride.getRequests() != null) {
                    for (String uid : ride.getRequests()) {
                        userRepository.findById(uid).ifPresent(u -> {
                            Map<String, String> map = new HashMap<>();
                            map.put("id", u.getId());
                            map.put("name", u.getName());
                            requestsDto.add(map);
                        });
                    }
                }
                rideMap.put("requests", requestsDto);

                // Map accepted passengers
                List<Map<String, String>> acceptedDto = new ArrayList<>();
                if (ride.getAcceptedPassengers() != null) {
                    for (String uid : ride.getAcceptedPassengers()) {
                        userRepository.findById(uid).ifPresent(u -> {
                            Map<String, String> map = new HashMap<>();
                            map.put("id", u.getId());
                            map.put("name", u.getName());
                            acceptedDto.add(map);
                        });
                    }
                }
                rideMap.put("acceptedPassengers", acceptedDto);

                // Map canceled rides
                List<Map<String, String>> canceledDto = new ArrayList<>();
                if (ride.getCanceledRequests() != null && ride.getCanceledRequests().contains(userId)) {
                    Map<String, String> map = new HashMap<>();
                    map.put("id", ride.getId());
                    map.put("origin", ride.getOrigin());
                    map.put("destination", ride.getDestination());
                    canceledDto.add(map);
                }

                if (isPending) pendingRequests.add(rideMap);
                if (isApproved) approvedRides.add(rideMap);
                if (!canceledDto.isEmpty()) canceledRides.add(rideMap); // add ride to canceledRides
            }

            Map<String, Object> response = new HashMap<>();
            response.put("pendingRequests", pendingRequests);
            response.put("approvedRides", approvedRides);
            response.put("canceledRides", canceledRides); // ✅ include canceled rides

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Server error: " + e.getMessage()));
        }
    }
    @GetMapping("/all")
    public ResponseEntity<?> getAllRides() {
        try {
            List<Ride> rides = rideRepository.findAll();
            return ResponseEntity.ok(rides);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Server error: " + e.getMessage()));
        }
    }
    @RestController
    @RequestMapping("/api/users")
    @CrossOrigin(origins = "*")
    public class UserController {

        @Autowired
        private UserRepository userRepository;

        @GetMapping("/all")
        public ResponseEntity<?> getAllUsers() {
            try {
                List<User> users = userRepository.findAll();
                List<Map<String, Object>> result = new ArrayList<>();

                for (User u : users) {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", u.getId());
                    map.put("name", u.getName());
                    map.put("email", u.getEmail());
                    map.put("role", u.getRole());
                    result.add(map);
                }

                return ResponseEntity.ok(result);
            } catch (Exception e) {
                e.printStackTrace();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("message", "Server error: " + e.getMessage()));
            }
        }

        @PutMapping("/{id}")
        public ResponseEntity<?> updateUser(@PathVariable String id, @RequestBody User userUpdate) {
            Optional<User> userOpt = userRepository.findById(id);
            if (userOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("message", "User not found"));

            User user = userOpt.get();
            user.setName(userUpdate.getName());
            user.setEmail(userUpdate.getEmail());
            user.setRole(userUpdate.getRole());
            userRepository.save(user);

            return ResponseEntity.ok(user);
        }
    }
    @PutMapping("/{id}")
    public ResponseEntity<?> updateRide(@PathVariable String id, @RequestBody Ride rideUpdate) {
        try {
            Optional<Ride> rideOpt = rideRepository.findById(id);
            if (rideOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Ride not found"));
            }

            Ride ride = rideOpt.get();

            // Update only editable fields
            if (rideUpdate.getOrigin() != null) ride.setOrigin(rideUpdate.getOrigin());
            if (rideUpdate.getDestination() != null) ride.setDestination(rideUpdate.getDestination());
            if (rideUpdate.getPricePerSeat() != 0) ride.setPricePerSeat(rideUpdate.getPricePerSeat());
            if (rideUpdate.getTotalSeats() != 0) ride.setTotalSeats(rideUpdate.getTotalSeats());
            if (rideUpdate.getSchedule() != null) ride.setSchedule(rideUpdate.getSchedule());
            if (rideUpdate.getStartTime() != null) ride.setStartTime(rideUpdate.getStartTime());

            rideRepository.save(ride);

            return ResponseEntity.ok(Map.of("message", "Ride updated successfully", "ride", ride));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Server error: " + e.getMessage()));
        }
    }

    @PostMapping("/{rideId}/cancel-ride")
    public ResponseEntity<?> cancelRide(@PathVariable String rideId, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Unauthorized"));
            }

            String email = authentication.getName();
            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "User not found"));
            }

            Optional<Ride> rideOpt = rideRepository.findById(rideId);
            if (rideOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Ride not found"));
            }

            Ride ride = rideOpt.get();

            //Allow Admins or the Owner of the ride to cancel
            if (!"ADMIN".equalsIgnoreCase(user.getRole()) &&
                    !ride.getOwnerId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "You are not allowed to cancel this ride"));
            }

            //Already canceled check
            if (!ride.isActive()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Ride is already canceled"));
            }

            // Mark as canceled
            ride.setActive(false);
            rideRepository.save(ride);

            String canceledBy = "ADMIN".equalsIgnoreCase(user.getRole()) ? "Admin" : "Owner";

            return ResponseEntity.ok(Map.of(
                    "message", "Ride canceled successfully by " + canceledBy
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Server error: " + e.getMessage()));
        }
    }


    // Remove an accepted passenger (Admin/Owner)
    @PostMapping("/{rideId}/remove-passenger/{passengerId}")
    public ResponseEntity<?> removePassenger(
            @PathVariable String rideId,
            @PathVariable String passengerId,
            Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        Optional<Ride> rideOpt = rideRepository.findById(rideId);
        if (rideOpt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Ride not found");

        Ride ride = rideOpt.get();

        // Only the owner or admin can remove
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");

        if (!ride.getOwnerId().equals(user.getId()) && !"ADMIN".equals(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not allowed to remove passengers");
        }

        if (ride.getAcceptedPassengers() != null && ride.getAcceptedPassengers().remove(passengerId)) {
            ride.setSeatsAvailable(ride.getSeatsAvailable() + 1);
            rideRepository.save(ride);
            return ResponseEntity.ok(Map.of("message", "Passenger removed successfully"));
        }

        return ResponseEntity.badRequest().body(Map.of("message", "Passenger not found in accepted list"));
    }
    @GetMapping("/canceled/{ownerId}")
    public ResponseEntity<List<Ride>> getCanceledRidesByOwner(@PathVariable String ownerId) {
        List<Ride> rides = rideRepository.findByOwnerIdAndStatus(ownerId, "CANCELED");
        return ResponseEntity.ok(rides);
    }

}
