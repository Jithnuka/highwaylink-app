package com.highwaylink.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/")
    public String home() {
        return "Welcome to HighwayLink API 🚗";
    }

    @GetMapping("/api/test")
    public String test() {
        return "Protected API – only accessible after login (coming soon)";
    }
}
