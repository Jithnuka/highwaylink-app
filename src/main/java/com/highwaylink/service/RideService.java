package com.highwaylink.service;

import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.highwaylink.DTO.MyRidesResponseDTO;
import com.highwaylink.DTO.RideCreateRequestDTO;
import com.highwaylink.DTO.RideDTO;
import com.highwaylink.exception.BadRequestException;
import com.highwaylink.exception.ResourceNotFoundException;
import com.highwaylink.exception.UnauthorizedException;
import com.highwaylink.model.Ride;
import com.highwaylink.model.User;
import com.highwaylink.repository.RideRepository;
import com.highwaylink.repository.UserRepository;
import com.highwaylink.util.DTOMapper;

@Service
public class RideService {

    private static final Logger logger = LoggerFactory.getLogger(RideService.class);

    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private DTOMapper dtoMapper;

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private NotificationService notificationService;

    // Helper method to enrich RideDTO with owner rating
    private RideDTO enrichWithOwnerRating(RideDTO rideDTO) {
        if (rideDTO != null && rideDTO.getOwnerId() != null) {

            double rating = reviewService.getAverageRatingForDriver(rideDTO.getOwnerId());
            rideDTO.setOwnerRating(rating);
        }
        return rideDTO;
    }

    @Autowired
    private com.highwaylink.repository.ReviewRepository reviewRepository;

    // Helper method to enrich a list of RideDTOs
    private List<RideDTO> enrichListWithOwnerRating(List<RideDTO> rideDTOs) {
        if (rideDTOs != null && !rideDTOs.isEmpty()) {
            java.util.Set<String> ownerIds = rideDTOs.stream()
                    .map(RideDTO::getOwnerId)
                    .collect(Collectors.toSet());

            if (!ownerIds.isEmpty()) {
                // Fetch ALL reviews for these drivers (Better accuracy than User.averageRating)
                List<com.highwaylink.model.Review> allReviews = reviewRepository.findByDriverIdIn(ownerIds);

                // Group reviews by driverId
                java.util.Map<String, List<com.highwaylink.model.Review>> reviewsByDriver = allReviews.stream()
                        .collect(Collectors.groupingBy(com.highwaylink.model.Review::getDriverId));

                // Calculate averages
                java.util.Map<String, Double> ratingMap = new java.util.HashMap<>();
                for (String ownerId : ownerIds) {
                    List<com.highwaylink.model.Review> driverReviews = reviewsByDriver.get(ownerId);
                    if (driverReviews != null && !driverReviews.isEmpty()) {
                        double avg = driverReviews.stream().mapToInt(com.highwaylink.model.Review::getRating).average()
                                .orElse(0.0);
                        ratingMap.put(ownerId, Math.round(avg * 10.0) / 10.0);
                    } else {
                        ratingMap.put(ownerId, 0.0);
                    }
                }

                rideDTOs.forEach(dto -> {
                    dto.setOwnerRating(ratingMap.getOrDefault(dto.getOwnerId(), 0.0));
                });
            }
        }
        return rideDTOs;
    }

    public List<RideDTO> getPublicRides(String origin, String destination, String currentUserId) {
        logger.info("Fetching public rides - origin: {}, destination: {}", origin, destination);

        List<Ride> rides;

        if (origin != null && !origin.isEmpty() && destination != null && !destination.isEmpty()) {
            rides = rideRepository
                    .findByOriginContainingIgnoreCaseAndDestinationContainingIgnoreCaseAndActiveTrueAndSeatsAvailableGreaterThan(
                            origin,
                            destination, 0);
        } else if (origin != null && !origin.isEmpty()) {
            rides = rideRepository.findByOriginContainingIgnoreCaseAndActiveTrueAndSeatsAvailableGreaterThan(origin, 0);
        } else if (destination != null && !destination.isEmpty()) {
            rides = rideRepository
                    .findByDestinationContainingIgnoreCaseAndActiveTrueAndSeatsAvailableGreaterThan(destination, 0);
        } else {
            rides = rideRepository.findByActiveTrueAndSeatsAvailableGreaterThan(0);
        }

        logger.info("Found {} public rides", rides.size());
        return enrichListWithOwnerRating(dtoMapper.toRideDTOList(rides));
    }

    public List<RideDTO> searchRides(String origin, String destination, String date, String timeFrom, String timeTo,
            String vehicleType, String currentUserId) {
        logger.info(
                "Searching rides - origin: {}, destination: {}, date: {}, timeFrom: {}, timeTo: {}, vehicleType: {}",
                origin, destination, date, timeFrom, timeTo, vehicleType);

        List<Ride> rides;

        // Start with basic location filtering
        if (origin != null && !origin.isEmpty() && destination != null && !destination.isEmpty()) {
            rides = rideRepository
                    .findByOriginContainingIgnoreCaseAndDestinationContainingIgnoreCaseAndActiveTrueAndSeatsAvailableGreaterThan(
                            origin,
                            destination, 0);
        } else if (origin != null && !origin.isEmpty()) {
            rides = rideRepository.findByOriginContainingIgnoreCaseAndActiveTrueAndSeatsAvailableGreaterThan(origin, 0);
        } else if (destination != null && !destination.isEmpty()) {
            rides = rideRepository
                    .findByDestinationContainingIgnoreCaseAndActiveTrueAndSeatsAvailableGreaterThan(destination, 0);
        } else {
            rides = rideRepository.findByActiveTrueAndSeatsAvailableGreaterThan(0);
        }

        // Apply additional filters
        if (date != null && !date.isEmpty()) {
            rides = rides.stream()
                    .filter(ride -> {
                        // Filter by date (YYYY-MM-DD format)
                        if (ride.getStartTime() == null)
                            return false;
                        String rideDate = new java.text.SimpleDateFormat("yyyy-MM-dd").format(ride.getStartTime());
                        return rideDate.equals(date);
                    })
                    .collect(Collectors.toList());
        }

        if ((timeFrom != null && !timeFrom.isEmpty()) || (timeTo != null && !timeTo.isEmpty())) {
            rides = rides.stream()
                    .filter(ride -> {
                        // Filter by time range (HH:mm format)
                        String rideTime = new java.text.SimpleDateFormat("HH:mm").format(ride.getStartTime());

                        boolean matchesFrom = timeFrom == null || timeFrom.isEmpty()
                                || rideTime.compareTo(timeFrom) >= 0;
                        boolean matchesTo = timeTo == null || timeTo.isEmpty() || rideTime.compareTo(timeTo) <= 0;

                        return matchesFrom && matchesTo;
                    })
                    .collect(Collectors.toList());
        }

        if (vehicleType != null && !vehicleType.isEmpty()) {
            rides = rides.stream()
                    .filter(ride -> {
                        try {
                            if (ride.getOwnerId() == null)
                                return false;
                            User owner = userRepository.findById(ride.getOwnerId()).orElse(null);
                            return owner != null && vehicleType.equalsIgnoreCase(owner.getVehicleType());
                        } catch (Exception e) {
                            logger.warn("Error filtering by vehicle type for ride {}: {}", ride.getId(),
                                    e.getMessage());
                            return false;
                        }
                    })
                    .collect(Collectors.toList());
        }

        // Exclude rides owned by current user - REMOVED so users can see their own
        // rides on Search results
        // if (currentUserId != null) {
        // rides = rides.stream()
        // .filter(ride -> !ride.getOwnerId().equals(currentUserId))
        // .collect(Collectors.toList());
        // }

        logger.info("Search found {} rides after filtering", rides.size());
        return enrichListWithOwnerRating(dtoMapper.toRideDTOList(rides));
    }

    public Page<RideDTO> getAllRides(Pageable pageable) {
        logger.info("Fetching all rides - page: {}, size: {}", pageable.getPageNumber(), pageable.getPageSize());
        Page<Ride> ridesPage = rideRepository.findAll(pageable);
        List<RideDTO> dtos = enrichListWithOwnerRating(dtoMapper.toRideDTOList(ridesPage.getContent()));
        return new PageImpl<>(dtos, pageable, ridesPage.getTotalElements());
    }

    public RideDTO getRideById(String id) {
        logger.info("Fetching ride with id: {}", id);
        Ride ride = rideRepository.findById(id)
                .orElseThrow(() -> {
                    logger.error("Ride not found with id: {}", id);
                    return new ResourceNotFoundException("Ride not found with id: " + id);
                });
        logger.info("Successfully retrieved ride: {}", id);
        return enrichWithOwnerRating(dtoMapper.toRideDTO(ride));
    }

    public Page<RideDTO> getMyOffers(String ownerId, Pageable pageable) {
        logger.info("Fetching rides for owner: {} - page: {}, size: {}", ownerId, pageable.getPageNumber(),
                pageable.getPageSize());
        Page<Ride> ridesPage = rideRepository.findByOwnerId(ownerId, pageable);
        List<RideDTO> dtos = enrichListWithOwnerRating(dtoMapper.toRideDTOList(ridesPage.getContent()));
        return new PageImpl<>(dtos, pageable, ridesPage.getTotalElements());
    }

    public List<RideDTO> getRidesByOwnerId(String ownerId) {
        logger.info("Fetching rides for owner: {}", ownerId);
        List<Ride> rides = rideRepository.findByOwnerId(ownerId);
        logger.info("Found {} rides for owner: {}", rides.size(), ownerId);
        return enrichListWithOwnerRating(dtoMapper.toRideDTOList(rides));
    }

    public MyRidesResponseDTO getMyRides(String userId, Pageable pageable) {
        logger.info("Fetching my rides for user: {} - page: {}, size: {}", userId, pageable.getPageNumber(),
                pageable.getPageSize());

        Page<Ride> bookedRidesPage = rideRepository.findByAcceptedPassengersContains(userId, pageable);
        Page<Ride> pendingRidesPage = rideRepository.findByRequestsContains(userId, pageable);
        Page<Ride> canceledRidesPage = rideRepository.findByCanceledRequestsContains(userId, pageable);

        MyRidesResponseDTO response = new MyRidesResponseDTO();
        response.setApprovedRides(enrichListWithOwnerRating(dtoMapper.toRideDTOList(bookedRidesPage.getContent())));
        response.setPendingRequests(enrichListWithOwnerRating(dtoMapper.toRideDTOList(pendingRidesPage.getContent())));
        response.setCanceledRides(enrichListWithOwnerRating(dtoMapper.toRideDTOList(canceledRidesPage.getContent())));

        response.setTotalApproved(bookedRidesPage.getTotalElements());
        response.setTotalPending(pendingRidesPage.getTotalElements());
        response.setTotalCanceled(canceledRidesPage.getTotalElements());

        logger.info("Retrieved paginated rides for user: {}", userId);
        return response;
    }

    @Transactional
    public RideDTO createRide(RideCreateRequestDTO request, String userEmail) {
        logger.info("Creating new ride from {} to {}", request.getOrigin(), request.getDestination());

        User owner = userService.getUserByEmail(userEmail);

        Ride ride = dtoMapper.toRide(request);
        ride.setOwnerId(owner.getId());
        ride.setOwnerName(owner.getName());
        ride.setStatus("SCHEDULED"); // Set initial status

        Ride savedRide = rideRepository.save(ride);
        logger.info("Successfully created ride with id: {}", savedRide.getId());

        return enrichWithOwnerRating(dtoMapper.toRideDTO(savedRide));
    }

    @Transactional
    public RideDTO bookRide(String rideId, String userId, int seatsRequested) {
        logger.info("User {} requesting to book ride: {} with {} seats", userId, rideId, seatsRequested);

        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found with id: " + rideId));

        if (ride.getOwnerId().equals(userId)) {
            logger.warn("User {} tried to book their own ride {}", userId, rideId);
            throw new BadRequestException("Cannot book your own ride");
        }

        if (ride.getRequests() != null && ride.getRequests().contains(userId)) {
            throw new BadRequestException("Already requested to join this ride");
        }

        if (ride.getAcceptedPassengers() != null && ride.getAcceptedPassengers().contains(userId)) {
            throw new BadRequestException("Already a passenger on this ride");
        }

        if (seatsRequested < 1) {
            throw new BadRequestException("Must request at least 1 seat");
        }

        if (ride.getSeatsAvailable() < seatsRequested) {
            throw new BadRequestException("Not enough seats available. Available: " + ride.getSeatsAvailable()
                    + ", Requested: " + seatsRequested);
        }

        if (ride.getRequests() == null) {
            ride.setRequests(new java.util.ArrayList<>());
        }
        if (!ride.getRequests().contains(userId)) {
            ride.getRequests().add(userId);
        }

        if (ride.getBookings() == null) {
            ride.setBookings(new java.util.ArrayList<>());
        }

        // Remove any stale pending booking for this passenger
        ride.getBookings().removeIf(b -> userId.equals(b.getPassengerId()) && "PENDING".equals(b.getStatus()));

        com.highwaylink.model.Booking booking = new com.highwaylink.model.Booking();
        booking.setRideId(rideId);
        booking.setPassengerId(userId);
        booking.setStatus("PENDING");
        booking.setPaymentMethod("CASH");
        booking.setPaymentStatus("PENDING");
        booking.setSeatsRequested(seatsRequested);
        booking.setRequestedAt(new java.util.Date());

        try {
            com.highwaylink.model.User passenger = userRepository.findById(userId).orElse(null);
            if (passenger != null) {
                booking.setPassengerName(passenger.getName());
            }
        } catch (Exception e) {
            logger.warn("Could not fetch passenger name for {}", userId);
        }

        ride.getBookings().add(booking);

        Ride updatedRide = rideRepository.save(ride);
        logger.info("Successfully added booking request for user {} to ride {} with {} seats", userId, rideId,
                seatsRequested);

        // Notify Owner
        try {
            String passengerName = (booking.getPassengerName() != null ? booking.getPassengerName() : "a user");
            String msg = "New booking request from " + passengerName + " " + ride.getOrigin() + " to "
                    + ride.getDestination();
            notificationService.createNotification(ride.getOwnerId(), msg, "INFO", rideId);
        } catch (Exception e) {
            logger.error("Failed to send notification", e);
        }

        return dtoMapper.toRideDTO(updatedRide);
    }

    @Transactional
    public RideDTO cancelBookingRequest(String rideId, String userId) {
        logger.info("User {} canceling booking request for ride {}", userId, rideId);

        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found"));

        if (ride.getRequests() != null && ride.getRequests().contains(userId)) {
            ride.getRequests().remove(userId);

            if (ride.getBookings() != null) {
                ride.getBookings().removeIf(b -> userId.equals(b.getPassengerId()) && "PENDING".equals(b.getStatus()));
            }

            Ride updatedRide = rideRepository.save(ride);
            logger.info("Successfully canceled booking request for user {} on ride {}", userId, rideId);

            // Notify Owner
            try {
                notificationService.createNotification(ride.getOwnerId(),
                        "A passenger canceled their request for your ride", "WARNING", rideId);
            } catch (Exception e) {
                logger.error("Failed to send notification", e);
            }

            return dtoMapper.toRideDTO(updatedRide);
        }

        throw new BadRequestException("No pending request found");
    }

    @Transactional
    public RideDTO acceptBookingRequest(String rideId, String passengerId, String ownerId) {
        logger.info("User {} accepting passenger {} for ride {}", ownerId, passengerId, rideId);

        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found"));

        if (!ride.getOwnerId().equals(ownerId)) {
            logger.warn("User {} tried to accept request on ride {} they don't own", ownerId, rideId);
            throw new UnauthorizedException("Only ride owner can accept requests");
        }

        if (ride.getSeatsAvailable() <= 0) {
            throw new BadRequestException("No seats available");
        }

        if (ride.getRequests() != null && ride.getRequests().contains(passengerId)) {
            if (ride.getBookings() == null) {
                throw new BadRequestException("No booking found for this passenger");
            }

            com.highwaylink.model.Booking booking = ride.getBookings().stream()
                    .filter(b -> passengerId.equals(b.getPassengerId()))
                    .findFirst()
                    .orElse(null);

            if (booking == null) {
                throw new BadRequestException("No booking found for this passenger");
            }

            int seatsToAllocate = Math.max(1, booking.getSeatsRequested());

            if (ride.getSeatsAvailable() < seatsToAllocate) {
                throw new BadRequestException("No seats available");
            }

            ride.getRequests().remove(passengerId);

            if (ride.getAcceptedPassengers() == null) {
                ride.setAcceptedPassengers(new java.util.ArrayList<>());
            }
            ride.getAcceptedPassengers().add(passengerId);
            ride.setSeatsAvailable(ride.getSeatsAvailable() - seatsToAllocate);

            booking.setStatus("APPROVED");
            booking.setPaymentStatus("PENDING");

            Ride updatedRide = rideRepository.save(ride);
            logger.info("Successfully accepted passenger {} for ride {} with {} seats", passengerId, rideId,
                    seatsToAllocate);

            // Notify Passenger
            try {
                String msg = "Your request for ride " + ride.getOrigin() + " -> " + ride.getDestination()
                        + " has been accepted!";
                notificationService.createNotification(passengerId, msg, "SUCCESS", rideId);
            } catch (Exception e) {
                logger.error("Failed to send notification", e);
            }

            return dtoMapper.toRideDTO(updatedRide);
        }

        throw new BadRequestException("Passenger not in requests");
    }

    @Transactional
    public RideDTO rejectBookingRequest(String rideId, String passengerId, String ownerId) {
        logger.info("User {} rejecting passenger {} for ride {}", ownerId, passengerId, rideId);

        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found"));

        if (!ride.getOwnerId().equals(ownerId)) {
            logger.warn("User {} tried to reject request on ride {} they don't own", ownerId, rideId);
            throw new UnauthorizedException("Only ride owner can reject requests");
        }

        if (ride.getRequests() != null && ride.getRequests().contains(passengerId)) {
            ride.getRequests().remove(passengerId);

            // Add to canceledRequests array
            if (ride.getCanceledRequests() == null) {
                ride.setCanceledRequests(new java.util.ArrayList<>());
            }
            if (!ride.getCanceledRequests().contains(passengerId)) {
                ride.getCanceledRequests().add(passengerId);
            }

            if (ride.getBookings() != null) {
                ride.getBookings().forEach(b -> {
                    if (passengerId.equals(b.getPassengerId()) && "PENDING".equals(b.getStatus())) {
                        b.setStatus("REJECTED");
                    }
                });
                ride.getBookings()
                        .removeIf(b -> passengerId.equals(b.getPassengerId()) && "REJECTED".equals(b.getStatus()));
            }

            Ride updatedRide = rideRepository.save(ride);
            logger.info("Successfully rejected passenger {} for ride {} and added to canceledRequests", passengerId,
                    rideId);

            // Notify Passenger
            try {
                String msg = "Your request for ride " + ride.getOrigin() + " -> " + ride.getDestination()
                        + " has been rejected.";
                notificationService.createNotification(passengerId, msg, "ERROR", rideId);
            } catch (Exception e) {
                logger.error("Failed to send notification", e);
            }
            return dtoMapper.toRideDTO(updatedRide);
        }

        throw new BadRequestException("Passenger not in requests");
    }

    @Transactional
    public RideDTO removePassenger(String rideId, String passengerId, String ownerId) {
        logger.info("User {} removing passenger {} from ride {}", ownerId, passengerId, rideId);

        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found"));

        if (!ride.getOwnerId().equals(ownerId)) {
            logger.warn("User {} tried to remove passenger from ride {} they don't own", ownerId, rideId);
            throw new UnauthorizedException("Only ride owner can remove passengers");
        }

        if (!"SCHEDULED".equals(ride.getStatus())) {
            throw new BadRequestException("Cannot remove passengers after the ride has started");
        }

        if (ride.getAcceptedPassengers() != null && ride.getAcceptedPassengers().contains(passengerId)) {
            int seatsToRestore = 1;
            if (ride.getBookings() != null) {
                for (com.highwaylink.model.Booking booking : ride.getBookings()) {
                    if (passengerId.equals(booking.getPassengerId()) && "APPROVED".equals(booking.getStatus())) {
                        seatsToRestore = Math.max(1, booking.getSeatsRequested());
                        booking.setStatus("REMOVED");
                        break;
                    }
                }
                ride.getBookings()
                        .removeIf(b -> passengerId.equals(b.getPassengerId()) && "REMOVED".equals(b.getStatus()));
            }

            ride.getAcceptedPassengers().remove(passengerId);
            ride.setSeatsAvailable(ride.getSeatsAvailable() + seatsToRestore);

            Ride updatedRide = rideRepository.save(ride);
            logger.info("Successfully removed passenger {} from ride {} and restored {} seats", passengerId, rideId,
                    seatsToRestore);
            return dtoMapper.toRideDTO(updatedRide);
        }

        throw new BadRequestException("Passenger not found in this ride");
    }

    @Transactional
    public RideDTO updateRide(String id, Ride ride, String userEmail) {
        logger.info("Updating ride with id: {}", id);

        User user = userService.getUserByEmail(userEmail);
        Ride existingRide = rideRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found"));

        // Allow ADMIN to update any ride, or owner to update their own ride
        if (!"ADMIN".equals(user.getRole()) && !existingRide.getOwnerId().equals(user.getId())) {
            throw new UnauthorizedException("Only ride owner or admin can update the ride");
        }

        // Merge fields while preserving immutable and managed lists
        if (ride.getOrigin() != null)
            existingRide.setOrigin(ride.getOrigin());
        if (ride.getDestination() != null)
            existingRide.setDestination(ride.getDestination());
        if (ride.getStartTime() != null)
            existingRide.setStartTime(ride.getStartTime());
        if (ride.getPricePerSeat() > 0)
            existingRide.setPricePerSeat(ride.getPricePerSeat());

        // Handle totalSeats and seatsAvailable carefully
        if (ride.getTotalSeats() != null && ride.getTotalSeats() > 0) {
            existingRide.setTotalSeats(ride.getTotalSeats());
        }

        int acceptedSeats = 0;
        if (existingRide.getBookings() != null) {
            acceptedSeats = existingRide.getBookings().stream()
                    .filter(b -> "APPROVED".equals(b.getStatus()))
                    .mapToInt(b -> Math.max(1, b.getSeatsRequested()))
                    .sum();
        }
        existingRide.setSeatsAvailable(existingRide.getTotalSeats() - acceptedSeats);

        if (ride.getSeatsAvailable() != null && ride.getSeatsAvailable() >= 0) {
            // Only allow override if there are no approved bookings, or if the admin
            // intentionally sent a value.
            // Actually, let's trust the re-calculation if bookings are present.
            if (acceptedSeats == 0) {
                existingRide.setSeatsAvailable(ride.getSeatsAvailable());
            }
        }

        if (ride.getOwnerName() != null)
            existingRide.setOwnerName(ride.getOwnerName());
        if (ride.getOwnerContact() != null)
            existingRide.setOwnerContact(ride.getOwnerContact());
        if (ride.getSchedule() != null)
            existingRide.setSchedule(ride.getSchedule());
        if (ride.getStatus() != null)
            existingRide.setStatus(ride.getStatus());

        // Save the merged existing ride
        Ride updatedRide = rideRepository.save(existingRide);
        logger.info("Successfully updated ride: {}", id);
        return dtoMapper.toRideDTO(updatedRide);
    }

    @Transactional
    public void deleteRide(String id, String userEmail) {
        logger.info("Deleting ride with id: {}", id);

        User user = userService.getUserByEmail(userEmail);
        Ride ride = rideRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found"));

        if (!ride.getOwnerId().equals(user.getId())) {
            throw new UnauthorizedException("Only ride owner can delete the ride");
        }

        // Schedule field is kept for historical data but no longer auto-reschedules

        rideRepository.deleteById(id);
        logger.info("Successfully deleted ride: {}", id);
    }

    @Transactional
    public RideDTO markPaymentCollected(String rideId, String passengerId, String ownerId, Double amount) {
        logger.info("Marking payment collected for ride: {}, passenger: {}, amount: {}", rideId, passengerId, amount);

        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found"));

        if (!ride.getOwnerId().equals(ownerId)) {
            throw new UnauthorizedException("Only ride owner can mark payment as collected");
        }

        // Find and update the booking for this passenger
        boolean bookingFound = false;
        for (com.highwaylink.model.Booking booking : ride.getBookings()) {
            if (booking.getPassengerId().equals(passengerId) && "APPROVED".equals(booking.getStatus())) {
                booking.setPaymentStatus("COMPLETED");
                booking.setPaymentCollectedAt(new java.util.Date());
                booking.setAmountPaid(amount);
                bookingFound = true;
                logger.info("Payment marked as collected for booking: passenger {}", passengerId);
                break;
            }
        }

        if (!bookingFound) {
            throw new BadRequestException("No approved booking found for this passenger");
        }

        Ride updatedRide = rideRepository.save(ride);

        // Notify Passenger
        try {
            String msg = "Payment of Rs " + amount + " for your ride has been confirmed.";
            notificationService.createNotification(passengerId, msg, "SUCCESS", rideId);
        } catch (Exception e) {
            logger.error("Failed to notify passenger {} about payment collection", passengerId, e);
        }

        return dtoMapper.toRideDTO(updatedRide);
    }

    public java.util.Map<String, Object> getTodayEarnings(String ownerId) {
        logger.info("Calculating today's earnings for owner: {}", ownerId);

        // Get all rides owned by this user
        List<Ride> ownerRides = rideRepository.findByOwnerId(ownerId);

        // Calculate today's earnings
        java.time.LocalDate today = java.time.LocalDate.now();
        java.time.ZoneId zoneId = java.time.ZoneId.systemDefault();

        double cashEarnings = 0.0;
        double cardEarnings = 0.0;
        int cashPaymentsCount = 0;
        int cardPaymentsCount = 0;

        for (Ride ride : ownerRides) {
            for (com.highwaylink.model.Booking booking : ride.getBookings()) {
                if ("COMPLETED".equals(booking.getPaymentStatus()) &&
                        booking.getPaymentCollectedAt() != null &&
                        booking.getAmountPaid() != null) {

                    // Check if payment was collected today
                    java.time.LocalDate paymentDate = booking.getPaymentCollectedAt()
                            .toInstant().atZone(zoneId).toLocalDate();

                    if (paymentDate.equals(today)) {
                        if ("CASH".equals(booking.getPaymentMethod())) {
                            cashEarnings += booking.getAmountPaid();
                            cashPaymentsCount++;
                        } else if ("CARD".equals(booking.getPaymentMethod())) {
                            cardEarnings += booking.getAmountPaid();
                            cardPaymentsCount++;
                        }
                    }
                }
            }
        }

        java.util.Map<String, Object> earnings = new java.util.HashMap<>();
        earnings.put("cashEarnings", cashEarnings);
        earnings.put("cardEarnings", cardEarnings);
        earnings.put("totalEarnings", cashEarnings + cardEarnings);
        earnings.put("cashPaymentsCount", cashPaymentsCount);
        earnings.put("cardPaymentsCount", cardPaymentsCount);
        earnings.put("date", today.toString());

        logger.info("Today's earnings - Cash: {}, Card: {}, Total: {}",
                cashEarnings, cardEarnings, (cashEarnings + cardEarnings));

        return earnings;
    }

    public java.util.Map<String, Object> getTotalEarnings(String ownerId) {
        logger.info("Calculating total earnings for owner: {}", ownerId);

        // Get all rides owned by this user
        List<Ride> ownerRides = rideRepository.findByOwnerId(ownerId);

        double cashEarnings = 0.0;
        double cardEarnings = 0.0;
        int cashPaymentsCount = 0;
        int cardPaymentsCount = 0;

        for (Ride ride : ownerRides) {
            if (ride.getBookings() == null)
                continue;

            for (com.highwaylink.model.Booking booking : ride.getBookings()) {
                if ("COMPLETED".equals(booking.getPaymentStatus()) &&
                        booking.getPaymentCollectedAt() != null &&
                        booking.getAmountPaid() != null) {

                    if ("CASH".equals(booking.getPaymentMethod())) {
                        cashEarnings += booking.getAmountPaid();
                        cashPaymentsCount++;
                    } else if ("CARD".equals(booking.getPaymentMethod())) {
                        cardEarnings += booking.getAmountPaid();
                        cardPaymentsCount++;
                    }
                }
            }
        }

        java.util.Map<String, Object> earnings = new java.util.HashMap<>();
        earnings.put("cashEarnings", cashEarnings);
        earnings.put("cardEarnings", cardEarnings);
        earnings.put("totalEarnings", cashEarnings + cardEarnings);
        earnings.put("cashPaymentsCount", cashPaymentsCount);
        earnings.put("cardPaymentsCount", cardPaymentsCount);

        logger.info("Total earnings - Cash: {}, Card: {}, Total: {}",
                cashEarnings, cardEarnings, (cashEarnings + cardEarnings));

        return earnings;
    }

    public RideDTO startRide(String rideId, String ownerId) {
        logger.info("Starting ride {} for owner {}", rideId, ownerId);

        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found"));

        // Check if user is the owner
        if (!ride.getOwnerId().equals(ownerId)) {
            throw new UnauthorizedException("Only the ride owner can start the ride");
        }

        // Check if owner already has a ride in progress
        List<Ride> inProgressRides = rideRepository.findByOwnerIdAndStatus(ownerId, "IN_PROGRESS");
        if (!inProgressRides.isEmpty()) {
            throw new BadRequestException(
                    "Cannot start ride: You already have a ride in progress. Please end the current ride before starting a new one.");
        }

        // Check if ride is in correct state
        if (ride.getStatus() != null && !"SCHEDULED".equals(ride.getStatus())) {
            throw new BadRequestException("Ride cannot be started from current status: " + ride.getStatus());
        }

        // Check if ride can be started based on scheduled time window
        // Allow starting: exactly at scheduled time to 15 minutes after
        // scheduled time
        if (ride.getStartTime() != null) {
            java.util.Date now = new java.util.Date();
            java.util.Calendar cal = java.util.Calendar.getInstance();

            // Calculate earliest allowed start time (Exactly at scheduled time)
            java.util.Date earliestStartTime = ride.getStartTime();

            // Calculate latest allowed start time (15 minutes after scheduled time)
            cal.setTime(ride.getStartTime());
            cal.add(java.util.Calendar.MINUTE, 15);
            java.util.Date latestStartTime = cal.getTime();

            // Check if current time is within the allowed window
            if (now.before(earliestStartTime)) {
                throw new BadRequestException(
                        "Cannot start ride before the scheduled time. " +
                                "Scheduled time: " + ride.getStartTime().toString() + ". " +
                                "Please wait until the scheduled time to start.");
            }

            if (now.after(latestStartTime)) {
                throw new BadRequestException(
                        "Cannot start ride more than 15 minutes after the scheduled time. " +
                                "Scheduled time: " + ride.getStartTime().toString() + ". " +
                                "Latest start time was: " + latestStartTime.toString());
            }
        }

        // Check if ride has accepted passengers
        if (ride.getAcceptedPassengers() == null || ride.getAcceptedPassengers().isEmpty()) {
            throw new BadRequestException("Cannot start ride without accepted passengers");
        }

        ride.setStatus("IN_PROGRESS");
        Ride savedRide = rideRepository.save(ride);

        // Notify Owner
        try {
            notificationService.createNotification(ownerId, "You started the ride. Drive safely!", "SUCCESS", rideId);
        } catch (Exception e) {
            logger.error("Failed to notify owner about ride start", e);
        }

        // Notify Passengers
        if (ride.getAcceptedPassengers() != null) {
            ride.getAcceptedPassengers().forEach(passengerId -> {
                try {
                    String msg = "The ride has started! Please have your payment ready.";
                    notificationService.createNotification(passengerId, msg, "INFO", rideId);
                } catch (Exception e) {
                    logger.error("Failed to notify passenger {} about ride start", passengerId, e);
                }
            });
        }

        return dtoMapper.toRideDTO(savedRide);
    }

    public RideDTO endRide(String rideId, String ownerId) {
        logger.info("Ending ride {} for owner {}", rideId, ownerId);

        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found"));

        // Check if user is the owner
        if (!ride.getOwnerId().equals(ownerId)) {
            throw new UnauthorizedException("Only the ride owner can end the ride");
        }

        // Check if ride is in progress
        if (!"IN_PROGRESS".equals(ride.getStatus())) {
            throw new BadRequestException("Only rides in progress can be ended");
        }

        ride.setStatus("COMPLETED");
        ride.setActive(false); // Ensure it's marked inactive
        Ride savedRide = rideRepository.save(ride);

        logger.info("Ride {} marked as COMPLETED. Schedule: '{}'", rideId, ride.getSchedule());

        // Schedule field is kept for historical data but no longer auto-reschedules
        logger.info("Ride {} completed. Schedule field ('{}') maintained for records only.", rideId,
                ride.getSchedule());

        // Notify Passengers about ride completion
        if (ride.getAcceptedPassengers() != null) {
            ride.getAcceptedPassengers().forEach(passengerId -> {
                try {
                    String msg = "The ride has ended. Please take a moment to rate your driver.";
                    notificationService.createNotification(passengerId, msg, "INFO", rideId);
                } catch (Exception e) {
                    logger.error("Failed to notify passenger {} about ride end", passengerId, e);
                }
            });
        }

        return dtoMapper.toRideDTO(savedRide);
    }

    public RideDTO cancelRide(String rideId, String ownerId) {
        logger.info("Cancelling ride {} for owner {}", rideId, ownerId);

        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found"));

        if (!ride.getOwnerId().equals(ownerId)) {
            // Check if user is an ADMIN
            User user = userRepository.findById(ownerId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            if (!"ADMIN".equals(user.getRole())) {
                throw new UnauthorizedException("Only the ride owner or an admin can cancel the ride");
            }
        }

        // Optional: restriction on cancelling if already started or completed
        if ("COMPLETED".equals(ride.getStatus())) {
            throw new BadRequestException("Cannot cancel a completed ride");
        }

        ride.setStatus("CANCELED");
        ride.setActive(false);
        Ride savedRide = rideRepository.save(ride);

        logger.info("Ride {} canceled by owner", rideId);

        // Notify accepted passengers
        if (ride.getAcceptedPassengers() != null) {
            ride.getAcceptedPassengers().forEach(passengerId -> {
                try {
                    notificationService.createNotification(passengerId, "The ride has been canceled by the owner.",
                            "WARNING", rideId);
                } catch (Exception e) {
                    logger.error("Failed to notify passenger {} about cancellation", passengerId, e);
                }
            });
        }

        return dtoMapper.toRideDTO(savedRide);
    }
}