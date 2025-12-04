package com.highwaylink.service;

import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.highwaylink.exception.BadRequestException;
import com.highwaylink.exception.ConflictException;
import com.highwaylink.model.User;
import com.highwaylink.repository.UserRepository;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public User signup(User user) {
        logger.info("Attempting to register user with email: {}", user.getEmail());
        
        // Check if user already exists
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            logger.warn("Registration failed: Email already exists - {}", user.getEmail());
            throw new ConflictException("Email already registered");
        }

        // Validate password strength (optional, can be removed if front-end validation is enough)
        validatePasswordStrength(user.getPassword());

        // Validate vehicle information for vehicle owners
        String role = user.getRole().toUpperCase();
        if (role.equals("VEHICLE_OWNER") || role.equals("OWNER")) {
            if (user.getVehicleNumber() == null || user.getVehicleNumber().trim().isEmpty()) {
                throw new BadRequestException("Vehicle number is required for vehicle owners");
            }
            if (user.getVehicleType() == null || user.getVehicleType().trim().isEmpty()) {
                throw new BadRequestException("Vehicle type is required for vehicle owners");
            }
        }

        // Encode password
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        User savedUser = userRepository.save(user);
        logger.info("User registered successfully: {} with role: {}", savedUser.getEmail(), savedUser.getRole());
        
        return savedUser;
    }

    public boolean verifyCredentials(String email, String rawPassword) {
        logger.info("Verifying credentials for email: {}", email);
        
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            logger.warn("Login failed: User not found - {}", email);
            return false;
        }

        User user = userOpt.get();
        boolean matches = passwordEncoder.matches(rawPassword, user.getPassword());
        
        if (matches) {
            logger.info("Credentials verified successfully for: {}", email);
        } else {
            logger.warn("Login failed: Invalid password for - {}", email);
        }
        
        return matches;
    }

    private void validatePasswordStrength(String password) {
        if (password.length() < 6) {
            throw new BadRequestException("Password must be at least 6 characters long");
        }
        
        // Optional: Add stronger password validation
        // Pattern uppercase = Pattern.compile("[A-Z]");
        // Pattern lowercase = Pattern.compile("[a-z]");
        // Pattern digit = Pattern.compile("[0-9]");
        // Pattern special = Pattern.compile("[!@#$%^&*(),.?\":{}|<>]");
        
        // if (!uppercase.matcher(password).find() || 
        //     !lowercase.matcher(password).find() || 
        //     !digit.matcher(password).find()) {
        //     throw new BadRequestException("Password must contain uppercase, lowercase, and numbers");
        // }
    }
}
