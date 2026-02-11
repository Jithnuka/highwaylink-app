package com.highwaylink.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.highwaylink.DTO.LoginRequestDTO;
import com.highwaylink.DTO.LoginResponseDTO;
import com.highwaylink.DTO.SignupRequestDTO;
import com.highwaylink.DTO.UserDTO;
import com.highwaylink.config.JwtUtil;
import com.highwaylink.exception.UnauthorizedException;
import com.highwaylink.model.User;
import com.highwaylink.service.AuthService;
import com.highwaylink.service.UserService;
import com.highwaylink.util.DTOMapper;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthService authService;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private DTOMapper dtoMapper;

    @PostMapping("/signup")
    public ResponseEntity<LoginResponseDTO> signup(@Valid @RequestBody SignupRequestDTO signupRequest) {
        logger.info("Signup request received for email: {}", signupRequest.getEmail());

        User user = dtoMapper.toUser(signupRequest);

        User savedUser = authService.signup(user);

        String token = jwtUtil.generateToken(savedUser.getEmail(), savedUser.getRole(), savedUser.getId());

        UserDTO userDTO = dtoMapper.toUserDTO(savedUser);

        LoginResponseDTO response = new LoginResponseDTO(token, userDTO);

        logger.info("User registered successfully: {} with role: {}", savedUser.getEmail(), savedUser.getRole());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO loginRequest) {
        logger.info("Login request received for email: {}", loginRequest.getEmail());

        // Validate credentials
        boolean isValid = authService.verifyCredentials(loginRequest.getEmail(), loginRequest.getPassword());

        if (!isValid) {
            logger.warn("Failed login attempt for: {}", loginRequest.getEmail());
            throw new UnauthorizedException("Invalid email or password");
        }

        // Get user details
        User user = userService.getUserByEmail(loginRequest.getEmail());

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole(), user.getId());

        // Convert to UserDTO
        UserDTO userDTO = dtoMapper.toUserDTO(user);

        LoginResponseDTO response = new LoginResponseDTO(token, userDTO);

        logger.info("User logged in successfully: {}", user.getEmail());

        return ResponseEntity.ok(response);
    }
}
