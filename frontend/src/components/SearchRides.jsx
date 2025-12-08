import React, { useEffect, useState } from "react";
import api from "../api/axios";
import RideCard from "../components/RideCard";

export default function SearchRides() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Search filters
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  
  // Current user info (for showing status in RideCard)
  const [currentUserId, setCurrentUserId] = useState(null);

  // Fetch current user
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
      const url = queryString ? `/rides?${queryString}` : "/rides";
      
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

  // Handle request to join a ride
  const handleRequestJoin = async (rideId) => {
    try {
      await api.post(`/rides/${rideId}/book`);
      alert("Request sent to owner!");
      fetchRides(); // Refresh to show updated status
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to send request");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Search Available Rides</h1>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="bg-white shadow-md rounded-xl p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Origin</label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="e.g., Matara"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">Destination</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g., Kottawa"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Search
            </button>
          </div>
        </div>
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
    </div>
  );
}
