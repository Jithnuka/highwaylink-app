package com.highwaylink.util;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.highwaylink.DTO.RideCreateRequestDTO;
import com.highwaylink.DTO.RideDTO;
import com.highwaylink.DTO.RideUpdateRequestDTO;
import com.highwaylink.DTO.SignupRequestDTO;
import com.highwaylink.DTO.UserDTO;
import com.highwaylink.model.Ride;
import com.highwaylink.model.User;
import com.highwaylink.repository.UserRepository;

@Component
public class DTOMapper {

    private final UserRepository userRepository;

    public DTOMapper(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // User to UserDTO
    public UserDTO toUserDTO(User user) {
        if (user == null) return null;
        
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setPhone(user.getPhone());
        dto.setGender(user.getGender());
        dto.setVehicleNumber(user.getVehicleNumber());
        dto.setVehicleType(user.getVehicleType());
        
        return dto;
    }

    // PassengerDTO from userId - UPDATED to include all user details

   

    // Ride to RideDTO (with passenger details AND owner details)
    public RideDTO toRideDTO(Ride ride) {
    if (ride == null) return null;

    RideDTO dto = new RideDTO();
    dto.setId(ride.getId());
    dto.setOwnerId(ride.getOwnerId());
    dto.setOwnerName(ride.getOwnerName());
    dto.setOwnerContact(ride.getOwnerContact());
    dto.setOrigin(ride.getOrigin());
    dto.setDestination(ride.getDestination());
    dto.setStartTime(ride.getStartTime());
    dto.setSeatsAvailable(ride.getSeatsAvailable());
    dto.setTotalSeats(ride.getTotalSeats());
    dto.setPricePerSeat(ride.getPricePerSeat());
    dto.setSchedule(ride.getSchedule());
    dto.setActive(ride.isActive());
    dto.setCreatedAt(ride.getCreatedAt());
    
    // Include requests, acceptedPassengers, and canceledRequests
    dto.setRequests(ride.getRequests());
    dto.setAcceptedPassengers(ride.getAcceptedPassengers());
    dto.setCanceledRequests(ride.getCanceledRequests());

    // NEW: Populate owner details from User entity with proper error handling
    try {
        if (ride.getOwnerId() != null) {
            Optional<User> ownerOpt = userRepository.findById(ride.getOwnerId());
            if (ownerOpt.isPresent()) {
                User owner = ownerOpt.get();
                dto.setOwnerGender(owner.getGender());
                dto.setOwnerVehicleType(owner.getVehicleType());
                dto.setOwnerVehicleNumber(owner.getVehicleNumber());
            }
        }
    } catch (Exception e) {
        // Log the error but don't fail the entire mapping
        System.err.println("Warning: Could not fetch owner details for ride " + ride.getId() + ": " + e.getMessage());
    }

    return dto;
}

    // List of Rides to List of RideDTOs
    public List<RideDTO> toRideDTOList(List<Ride> rides) {
        if (rides == null) return new ArrayList<>();
        return rides.stream()
                .map(this::toRideDTO)
                .collect(Collectors.toList());
    }

    // SignupRequestDTO to User
    public User toUser(SignupRequestDTO dto) {
        if (dto == null) return null;

        User user = new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPassword(dto.getPassword()); // Will be encoded by service
        user.setRole(dto.getRole());
        user.setPhone(dto.getPhone());
        user.setGender(dto.getGender());
        user.setVehicleNumber(dto.getVehicleNumber());
        user.setVehicleType(dto.getVehicleType());

        return user;
    }

    // RideCreateRequestDTO to Ride
    public Ride toRide(RideCreateRequestDTO dto) {
        if (dto == null) return null;

        Ride ride = new Ride();
        ride.setOrigin(dto.getOrigin());
        ride.setDestination(dto.getDestination());
        ride.setStartTime(dto.getStartTime());
        ride.setTotalSeats(dto.getTotalSeats());
        ride.setSeatsAvailable(dto.getTotalSeats());
        ride.setPricePerSeat(dto.getPricePerSeat());
        ride.setSchedule(dto.getSchedule());
        ride.setOwnerContact(dto.getOwnerContact());

        return ride;
    }

    public void updateRideFromDTO(Ride ride, RideUpdateRequestDTO dto) {
        if (dto == null || ride == null) return;

        if (dto.getOrigin() != null) ride.setOrigin(dto.getOrigin());
        if (dto.getDestination() != null) ride.setDestination(dto.getDestination());
        if (dto.getStartTime() != null) ride.setStartTime(dto.getStartTime());
        if (dto.getTotalSeats() != 0) ride.setTotalSeats(dto.getTotalSeats());
        if (dto.getPricePerSeat() != 0) ride.setPricePerSeat(dto.getPricePerSeat());
        if (dto.getSchedule() != null) ride.setSchedule(dto.getSchedule());
        if (dto.getOwnerContact() != null) ride.setOwnerContact(dto.getOwnerContact());
    }
}
