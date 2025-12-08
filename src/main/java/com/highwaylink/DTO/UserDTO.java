package com.highwaylink.DTO;

public class UserDTO {
    private String id;
    private String name;
    private String email;
    private String role;
    private String phone;
    private String gender;
    
    // Vehicle information (only for vehicle owners)
    private String vehicleNumber;
    private String vehicleType;  
    public UserDTO() {}

    // Full constructor with all fields
    public UserDTO(String id, String name, String email, String role, String phone, 
                   String gender, String vehicleNumber, String vehicleType) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.phone = phone;
        this.gender = gender;
        this.vehicleNumber = vehicleNumber;
        this.vehicleType = vehicleType;
    }

    // Legacy constructor for backward compatibility (if needed)
    public UserDTO(String id, String name, String email, String role, String phone) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.phone = phone;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    // NEW GETTERS AND SETTERS
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getVehicleNumber() { return vehicleNumber; }
    public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }

    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }
}
