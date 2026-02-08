import React, { useEffect, useState } from "react";
import api from "../api/axios";
import RideCard from "../components/RideCard";
import LocationPicker from "../components/LocationPicker";
import SeatSelectionModal from "../components/SeatSelectionModal";

export default function SearchRides() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showSeatModal, setShowSeatModal] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await api.get("/auth/me");
        setCurrentUserId(res.data.id);
      } catch (err) {
        console.error("Failed to fetch current user:", err);
      }
    };
    fetchCurrentUser();
  }, []);

  // Fetch available rides
  const fetchRides = async () => {
    setLoading(true);
    setError("");
    try {
      // Build query params
      const params = new URLSearchParams();
      if (origin) params.append("origin", origin);
      if (destination) params.append("destination", destination);

      const queryString = params.toString();
      const url = queryString ? `/rides/public?${queryString}` : "/rides/public";

      console.log("Fetching rides from:", url);
      const res = await api.get(url);

      console.log("Received rides:", res.data);
      setRides(res.data);

      if (res.data.length === 0) {
        setError("No rides found matching your criteria.");
      }
    } catch (err) {
      console.error("Error fetching rides:", err);
      setError(err?.response?.data?.message || "Failed to load rides");
    } finally {
      setLoading(false);
    }
  };

  // Load rides on component mount
  useEffect(() => {
    fetchRides();
  }, []);

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    fetchRides();
  };

  // Handle request to join a ride - open seat selection modal
  const handleRequestJoin = (ride) => {
    setSelectedRide(ride);
    setShowSeatModal(true);
  };

  // Handle confirmed booking with selected seats
  const handleConfirmBooking = async (selectedSeats) => {
    if (!selectedRide) return;

    setBookingLoading(true);
    try {
      await api.post(`/rides/${selectedRide.id}/book`, {
        seatsRequested: selectedSeats
      });

      toast.success(`Booking request sent successfully! You requested ${selectedSeats} seat${selectedSeats > 1 ? 's' : ''}. The owner will review your request.`);
      setShowSeatModal(false);
      setSelectedRide(null);
      fetchRides();
    } catch (err) {
      console.error(err);
      const errorMessage = err?.response?.data?.message || "Failed to send booking request";

      if (errorMessage.includes("seats") || errorMessage.includes("available")) {
        toast.error(`Booking failed: ${errorMessage}. Please try with fewer seats.`);
      } else {
        toast.error(`Booking failed: ${errorMessage}`);
      }
      throw err; // Re-throw to let modal handle loading state
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Search Available Rides</h1>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="bg-white shadow-md rounded-xl p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <LocationPicker
            label="Origin"
            value={origin}
            onChange={setOrigin}
            placeholder="e.g., Matara or use map"
          />

          <LocationPicker
            label="Destination"
            value={destination}
            onChange={setDestination}
            placeholder="e.g., Kottawa or use map"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          Search Rides
        </button>
      </form>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8 text-gray-500">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          Loading available rides...
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Rides List */}
      {!loading && !error && rides.length > 0 && (
        <div>
          <div className="mb-4 text-gray-600 font-medium">
            Found {rides.length} available ride{rides.length !== 1 ? "s" : ""}
          </div>
          <div className="space-y-4">
            {rides.map((ride) => (
              <RideCard
                key={ride.id}
                ride={ride}
                onRequestJoin={handleRequestJoin}
                isOwnerView={false}
                currentUserId={currentUserId}
                driver={{ id: ride.ownerId, name: ride.ownerName }}
                onReviewSubmitted={() => {
                  // Optionally refresh rides
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && rides.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No rides available</h3>
          <p className="mt-2 text-gray-500">
            Try adjusting your search criteria or check back later.
          </p>
        </div>
      )}

      {/* Seat Selection Modal */}
      <SeatSelectionModal
        isOpen={showSeatModal}
        onClose={() => {
          setShowSeatModal(false);
          setSelectedRide(null);
        }}
        ride={selectedRide}
        onConfirmBooking={handleConfirmBooking}
        loading={bookingLoading}
      />
    </div>
  );
}