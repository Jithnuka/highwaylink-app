package com.highwaylink.DTO;

import java.util.List;

public class MyRidesResponseDTO {
    private List<RideDTO> pendingRequests;
    private List<RideDTO> approvedRides;
    private List<RideDTO> canceledRides;
    private long totalPending;
    private long totalApproved;
    private long totalCanceled;

    public MyRidesResponseDTO() {
    }

    public MyRidesResponseDTO(List<RideDTO> pendingRequests, List<RideDTO> approvedRides, List<RideDTO> canceledRides) {
        this.pendingRequests = pendingRequests;
        this.approvedRides = approvedRides;
        this.canceledRides = canceledRides;
    }

    public List<RideDTO> getPendingRequests() {
        return pendingRequests;
    }

    public void setPendingRequests(List<RideDTO> pendingRequests) {
        this.pendingRequests = pendingRequests;
    }

    public List<RideDTO> getApprovedRides() {
        return approvedRides;
    }

    public void setApprovedRides(List<RideDTO> approvedRides) {
        this.approvedRides = approvedRides;
    }

    public List<RideDTO> getCanceledRides() {
        return canceledRides;
    }

    public void setCanceledRides(List<RideDTO> canceledRides) {
        this.canceledRides = canceledRides;
    }

    public long getTotalPending() {
        return totalPending;
    }

    public void setTotalPending(long totalPending) {
        this.totalPending = totalPending;
    }

    public long getTotalApproved() {
        return totalApproved;
    }

    public void setTotalApproved(long totalApproved) {
        this.totalApproved = totalApproved;
    }

    public long getTotalCanceled() {
        return totalCanceled;
    }

    public void setTotalCanceled(long totalCanceled) {
        this.totalCanceled = totalCanceled;
    }
}