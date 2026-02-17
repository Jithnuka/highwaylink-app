package com.highwaylink.DTO;

public class BookingRequestDTO {
    private int seatsRequested;

    public BookingRequestDTO() {}

    public BookingRequestDTO(int seatsRequested) {
        this.seatsRequested = seatsRequested;
    }

    public int getSeatsRequested() {
        return seatsRequested;
    }

    public void setSeatsRequested(int seatsRequested) {
        this.seatsRequested = seatsRequested;
    }
}