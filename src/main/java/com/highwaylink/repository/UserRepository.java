package com.highwaylink.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.highwaylink.model.User;

public interface UserRepository extends MongoRepository<User, String> {
    java.util.List<User> findByRole(String role);

    Optional<User> findByEmail(String email);
}
