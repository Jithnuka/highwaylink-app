package com.highwaylink.service;

import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.highwaylink.DTO.UserDTO;
import com.highwaylink.exception.ResourceNotFoundException;
import com.highwaylink.model.User;
import com.highwaylink.repository.UserRepository;
import com.highwaylink.util.DTOMapper;

@Service
public class UserService {
    
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DTOMapper dtoMapper;

    public List<UserDTO> getAllUsers() {
        logger.info("Fetching all users");
        List<User> users = userRepository.findAll();
        logger.info("Retrieved {} users", users.size());
        return users.stream()
                .map(dtoMapper::toUserDTO)
                .collect(Collectors.toList());
    }

    public List<User> getAllUserEntities() {
        return userRepository.findAll();
    }

    public UserDTO getUserById(String id) {
        logger.info("Fetching user by id: {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> {
                    logger.warn("User not found with id: {}", id);
                    return new ResourceNotFoundException("User not found");
                });
        return dtoMapper.toUserDTO(user);
    }

    public User getUserEntityById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    @Transactional
    public UserDTO updateUser(String id, UserDTO userUpdate) {
        logger.info("Updating user: {}", id);
        
        User user = userRepository.findById(id)
                .orElseThrow(() -> {
                    logger.warn("User not found for update: {}", id);
                    return new ResourceNotFoundException("User not found");
                });

        // Update fields if provided
        if (userUpdate.getName() != null) {
            user.setName(userUpdate.getName());
        }
        if (userUpdate.getEmail() != null) {
            user.setEmail(userUpdate.getEmail());
        }
        if (userUpdate.getRole() != null) {
            user.setRole(userUpdate.getRole());
        }
        if (userUpdate.getPhone() != null) {
            user.setPhone(userUpdate.getPhone());
        }
        if (userUpdate.getGender() != null) {
            user.setGender(userUpdate.getGender());
        }
        if (userUpdate.getVehicleNumber() != null) {
            user.setVehicleNumber(userUpdate.getVehicleNumber());
        }
        if (userUpdate.getVehicleType() != null) {
            user.setVehicleType(userUpdate.getVehicleType());
        }

        User updatedUser = userRepository.save(user);
        logger.info("User updated successfully: {}", id);
        
        return dtoMapper.toUserDTO(updatedUser);
    }

    @Transactional
    public void deleteUser(String id) {
        logger.info("Deleting user: {}", id);
        
        if (!userRepository.existsById(id)) {
    logger.warn("User not found for deletion: {}", id);
    throw new ResourceNotFoundException("User not found");
}

userRepository.deleteById(id);
logger.info("User deleted successfully: {}", id);

    }
}
