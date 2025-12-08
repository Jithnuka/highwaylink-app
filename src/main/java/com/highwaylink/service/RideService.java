package com.highwaylink.service;

import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
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
import com.highwaylink.util.DTOMapper;

@Service
public class RideService {

    private static final Logger logger = LoggerFactory.getLogger(RideService.class);

    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private DTOMapper dtoMapper;

    public List<RideDTO> getPublicRides(String origin, String destination, String currentUserId) {
        logger.info("Fetching public rides - origin: {}, destination: {}", origin, destination);

        List<Ride> rides;

        if (origin != null && !origin.isEmpty() && destination != null && !destination.isEmpty()) {
            rides = rideRepository.findByOriginContainingIgnoreCaseAndDestinationContainingIgnoreCase(origin, destination);
        } else if (origin != null && !origin.isEmpty()) {
            rides = rideRepository.findByOriginContainingIgnoreCase(origin);
        } else if (destination != null && !destination.isEmpty()) {
            rides = rideRepository.findByDestinationContainingIgnoreCase(destination);
        } else {
            rides = rideRepository.findAll();
        }

        // Filter active rides with available seats, exclude current user's rides
        rides = rides.stream()
                .filter(ride -> ride.isActive() && ride.getSeatsAvailable() > 0)
                .filter(ride -> currentUserId == null || !ride.getOwnerId().equals(currentUserId))
                .collect(Collectors.toList());

        logger.info("Found {} public rides", rides.size());
        return dtoMapper.toRideDTOList(rides);
    }

    public List<RideDTO> searchRides(String origin, String destination, String currentUserId) {
        logger.info("Searching rides - origin: {}, destination: {}", origin, destination);

        List<Ride> rides;

        if (origin != null && !origin.isEmpty() && destination != null && !destination.isEmpty()) {
            rides = rideRepository.findByOriginContainingIgnoreCaseAndDestinationContainingIgnoreCase(origin, destination);
        } else if (origin != null && !origin.isEmpty()) {
            rides = rideRepository.findByOriginContainingIgnoreCase(origin);
        } else if (destination != null && !destination.isEmpty()) {
            rides = rideRepository.findByDestinationContainingIgnoreCase(destination);
        } else {
            rides = rideRepository.findAll();
        }

        // Exclude rides owned by current user
        if (currentUserId != null) {
            rides = rides.stream()
                    .filter(ride -> !ride.getOwnerId().equals(currentUserId))
                    .collect(Collectors.toList());
        }

        logger.info("Search found {} rides", rides.size());
        return dtoMapper.toRideDTOList(rides);
    }

    public List<RideDTO> getAllRides() {
        logger.info("Fetching all rides");
        List<Ride> rides = rideRepository.findAll();
        logger.info("Retrieved {} rides", rides.size());
        return dtoMapper.toRideDTOList(rides);
    }

    public RideDTO getRideById(String id) {
        logger.info("Fetching ride with id: {}", id);
        Ride ride = rideRepository.findById(id)
                .orElseThrow(() -> {
                    logger.error("Ride not found with id: {}", id);
                    return new ResourceNotFoundException("Ride not found with id: " + id);
                });
        logger.info("Successfully retrieved ride: {}", id);
        return dtoMapper.toRideDTO(ride);
    }

    public List<RideDTO> getRidesByOwnerId(String ownerId) {
        logger.info("Fetching rides for owner: {}", ownerId);
        List<Ride> rides = rideRepository.findByOwnerId(ownerId);
        logger.info("Found {} rides for owner: {}", rides.size(), ownerId);
        return dtoMapper.toRideDTOList(rides);
    }

    public MyRidesResponseDTO getMyRides(String userId) {
        logger.info("Fetching my rides for user: {}", userId);

        List<Ride> allRides = rideRepository.findAll();

        List<Ride> bookedRides = allRides.stream()
                .filter(ride -> ride.getAcceptedPassengers() != null &&
                        ride.getAcceptedPassengers().contains(userId))
                .collect(Collectors.toList());

        List<Ride> pendingRides = allRides.stream()
                .filter(ride -> ride.getRequests() != null &&
                        ride.getRequests().contains(userId))
                .collect(Collectors.toList());

        List<Ride> canceledRides = allRides.stream()
                .filter(ride -> ride.getCanceledRequests() != null &&
                        ride.getCanceledRequests().contains(userId))
                .collect(Collectors.toList());

        List<RideDTO> bookedRideDTOs = dtoMapper.toRideDTOList(bookedRides);
        List<RideDTO> pendingRideDTOs = dtoMapper.toRideDTOList(pendingRides);
        List<RideDTO> canceledRideDTOs = dtoMapper.toRideDTOList(canceledRides);

        logger.info("Found {} pending, {} approved, {} canceled rides for user: {}",
                pendingRideDTOs.size(), bookedRideDTOs.size(), canceledRideDTOs.size(), userId);

        return new MyRidesResponseDTO(pendingRideDTOs, bookedRideDTOs, canceledRideDTOs);
    }

    public List<RideDTO> getMyOffers(String userId) {
        logger.info("Fetching ride offers for user: {}", userId);
        List<Ride> myOffers = rideRepository.findByOwnerId(userId);
        logger.info("Found {} ride offers for user: {}", myOffers.size(), userId);
        return dtoMapper.toRideDTOList(myOffers);
    }

    @Transactional
    public RideDTO createRide(RideCreateRequestDTO request, String userEmail) {
        logger.info("Creating new ride from {} to {}", request.getOrigin(), request.getDestination());
        
        User owner = userService.getUserByEmail(userEmail);
        
        Ride ride = dtoMapper.toRide(request);
        ride.setOwnerId(owner.getId());
        ride.setOwnerName(owner.getName());
        
        Ride savedRide = rideRepository.save(ride);
        logger.info("Successfully created ride with id: {}", savedRide.getId());
        
        return dtoMapper.toRideDTO(savedRide);
    }

    @Transactional
    public RideDTO bookRide(String rideId, String userId) {
        logger.info("User {} requesting to book ride: {}", userId, rideId);

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

        if (ride.getSeatsAvailable() <= 0) {
            throw new BadRequestException("No seats available");
        }

        if (ride.getRequests() == null) {
            ride.setRequests(new java.util.ArrayList<>());
        }
        ride.getRequests().add(userId);

        Ride updatedRide = rideRepository.save(ride);
        logger.info("Successfully added booking request for user {} to ride {}", userId, rideId);
        
        return dtoMapper.toRideDTO(updatedRide);
    }

    @Transactional
    public RideDTO cancelBookingRequest(String rideId, String userId) {
        logger.info("User {} canceling booking request for ride {}", userId, rideId);

        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found"));

        if (ride.getRequests() != null && ride.getRequests().contains(userId)) {
            ride.getRequests().remove(userId);
            Ride updatedRide = rideRepository.save(ride);
            logger.info("Successfully canceled booking request for user {} on ride {}", userId, rideId);
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
            ride.getRequests().remove(passengerId);

            if (ride.getAcceptedPassengers() == null) {
                ride.setAcceptedPassengers(new java.util.ArrayList<>());
            }
            ride.getAcceptedPassengers().add(passengerId);
            ride.setSeatsAvailable(ride.getSeatsAvailable() - 1);

            Ride updatedRide = rideRepository.save(ride);
            logger.info("Successfully accepted passenger {} for ride {}", passengerId, rideId);
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
            
            Ride updatedRide = rideRepository.save(ride);
            logger.info("Successfully rejected passenger {} for ride {} and added to canceledRequests", passengerId, rideId);
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

        if (ride.getAcceptedPassengers() != null && ride.getAcceptedPassengers().contains(passengerId)) {
            ride.getAcceptedPassengers().remove(passengerId);
            ride.setSeatsAvailable(ride.getSeatsAvailable() + 1);

            Ride updatedRide = rideRepository.save(ride);
            logger.info("Successfully removed passenger {} from ride {}", passengerId, rideId);
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
        
        ride.setId(id);
        Ride updatedRide = rideRepository.save(ride);
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
        
        rideRepository.deleteById(id);
        logger.info("Successfully deleted ride: {}", id);
    }}
