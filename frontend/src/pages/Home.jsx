import React, { useState, useEffect, useContext, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../contexts/AuthContext";
import toast from 'react-hot-toast';
import SeatSelectionModal from "../components/SeatSelectionModal";
import { Skeleton } from "../components/Skeleton";

export default function Home() {
  const [rides, setRides] = useState(null); // null = not loaded yet, [] = loaded but empty
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [timeFrom, setTimeFrom] = useState("");
  const [timeTo, setTimeTo] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const location = useLocation(); // Re-fetch when clicking home link
  const abortControllerRef = useRef(null);

  const fetchRides = async () => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      let url;
      const hasFilters = origin.trim() || destination.trim() || date.trim() || timeFrom.trim() || timeTo.trim() || vehicleType.trim();

      if (hasFilters) {
        // Use search endpoint when filters are applied
        const params = new URLSearchParams();
        if (origin.trim()) params.append("origin", origin.trim());
        if (destination.trim()) params.append("destination", destination.trim());
        if (date.trim()) params.append("date", date.trim());
        if (timeFrom.trim()) params.append("timeFrom", timeFrom.trim());
        if (timeTo.trim()) params.append("timeTo", timeTo.trim());
        if (vehicleType.trim()) params.append("vehicleType", vehicleType.trim());
        url = `/rides/search?${params.toString()}`;
      } else {
        // Use all rides endpoint when no filters
        url = '/rides';
      }

      const res = await api.get(url, {
        signal: abortControllerRef.current.signal
      });


      // Filter to show only available rides (active, not completed/in-progress)
      // Relaxed time filter: show rides that haven't started yet OR started within the last 2 hours
      const currentTime = new Date();
      const twoHoursAgo = new Date(currentTime.getTime() - (2 * 60 * 60 * 1000));

      const availableRides = (res.data || []).filter(ride =>
        ride.active !== false &&
        ride.status !== "COMPLETED" &&
        ride.status !== "IN_PROGRESS" &&
        new Date(ride.startTime) > twoHoursAgo
      );
      setRides(availableRides);
      setLoading(false);
    } catch (err) {
      if (err.name !== 'CanceledError') {
        console.error("Error fetching rides:", err);
        setError(err?.response?.data?.message || "Failed to load rides. Please try again.");
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchRides();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [location.pathname]); // Re-run when navigation occurs

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRides();
  };

  const handleBookingConfirm = async (seatsRequested) => {
    if (!selectedRide) return;
    try {
      setBookingLoading(true);
      await api.post(`/rides/${selectedRide.id}/book`, { seatsRequested });
      toast.success("Ride request sent successfully! Check your dashboard for status.");
      setIsModalOpen(false);
      setSelectedRide(null);
      fetchRides();
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message ||
        "Failed to send request. You may have already requested this ride."
      );
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12 px-6 text-center">
        <h1 className="text-5xl font-extrabold mb-4">Welcome to HighwayLink</h1>
        <p className="text-xl mb-6">Find and share rides across Sri Lanka - Safe, affordable, and eco-friendly</p>

        {!user && (
          <div className="flex justify-center gap-4">
            <Link
              to="/signup"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold text-lg hover:bg-gray-100 transition shadow-lg"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-white hover:text-blue-600 transition"
            >
              Login
            </Link>
          </div>
        )}
      </div>

      {/* Search Section */}
      <div className="max-w-6xl mx-auto px-4 -mt-10">
        <div className="bg-white/90 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            🔍 Search Available Rides
          </h2>

          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Origin (e.g., Colombo)"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
            />

            <input
              type="text"
              placeholder="Destination (e.g., Kandy)"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
            />

            <input
              type="date"
              placeholder="Select Date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
            />

            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
            >
              <option value="">Any Vehicle Type</option>
              <option value="car">Car</option>
              <option value="van">Van</option>
              <option value="bus">Bus</option>
              <option value="truck">Truck</option>
              <option value="other">Other</option>
            </select>

            <div className="lg:col-span-4">
              <div className="flex gap-2 items-center">
                <input
                  type="time"
                  placeholder="From Time"
                  value={timeFrom}
                  onChange={(e) => setTimeFrom(e.target.value)}
                  className="flex-1 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                />
                <span className="text-gray-500 font-medium px-2">to</span>
                <input
                  type="time"
                  placeholder="To Time"
                  value={timeTo}
                  onChange={(e) => setTimeTo(e.target.value)}
                  className="flex-1 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                />
              </div>
              <p className="text-sm text-gray-600 mt-2 ml-1">
                💡 Specify time range to find rides within preferred hours (optional - leave empty for any time)
              </p>
            </div>

            <div className="lg:col-span-4 flex justify-center mt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {loading ? "Searching..." : "Search Rides"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Available Rides */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <Skeleton className="h-6 w-3/4 rounded-md" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <div className="space-y-3 mb-6">
                  <Skeleton className="h-4 w-1/2 rounded-md" />
                  <Skeleton className="h-4 w-1/3 rounded-md" />
                  <Skeleton className="h-4 w-2/3 rounded-md" />
                </div>
                <div className="pt-4 border-t flex justify-between items-center">
                  <Skeleton className="h-8 w-24 rounded-md" />
                  <Skeleton className="h-10 w-32 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8 bg-red-50 rounded-2xl shadow-md border border-red-200">
            <svg className="mx-auto h-16 w-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-xl font-semibold text-red-800">Oops! Something went wrong</h3>
            <p className="mt-2 text-red-600">{error}</p>
            <button
              onClick={fetchRides}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition font-medium"
            >
              Try Again
            </button>
          </div>
        ) : !rides || rides.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-2xl shadow-md">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">No Rides Available</h3>
            <p className="mt-2 text-gray-600">There are currently no rides matching your criteria.</p>
            <p className="mt-1 text-gray-500">Try adjusting your search filters or check back later!</p>
            {(origin || destination || date || timeFrom || timeTo || vehicleType) && (
              <button
                onClick={async () => {
                  setOrigin("");
                  setDestination("");
                  setDate("");
                  setTimeFrom("");
                  setTimeTo("");
                  setVehicleType("");
                  // Fetch all rides immediately
                  try {
                    setLoading(true);
                    setError(null);
                    const res = await api.get('/rides');
                    const currentTime = new Date();
                    const availableRides = (res.data || []).filter(ride =>
                      ride.active !== false &&
                      ride.status !== "COMPLETED" &&
                      ride.status !== "IN_PROGRESS" &&
                      new Date(ride.startTime) > currentTime
                    );
                    setRides(availableRides);
                  } catch (err) {
                    console.error("Error fetching rides:", err);
                    setError(err?.response?.data?.message || "Failed to load rides. Please try again.");
                  } finally {
                    setLoading(false);
                  }
                }}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition font-medium"
              >
                Clear Filters & Show All Rides
              </button>
            )}
          </div>
        ) : (
          <>
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Available Rides ({rides.length})
            </h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {rides.map((ride) => (
                <div
                  key={ride.id}
                  className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105 relative"
                >
                  {/* Status Badge - Top Right Corner */}
                  {user && ride.ownerId === user.id && (
                    <span className="absolute top-4 right-4 bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full border border-blue-300 font-medium">
                      Your Ride
                    </span>
                  )}
                  {user && ride.seatsAvailable === 0 && ride.ownerId !== user.id && (
                    <span className="absolute top-4 right-4 bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full border border-red-300 font-medium">
                      Ride is Full
                    </span>
                  )}

                  <div className="mb-4">
                    <h4 className="text-xl font-bold text-gray-800 pr-24">
                      {ride.origin} → {ride.destination}
                    </h4>
                  </div>

                  <div className="space-y-2 text-gray-600 mb-4">
                    <p className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {ride.ownerName}
                    </p>
                    {ride.ownerRating > 0 && (
                      <p className="flex items-center gap-2 text-yellow-600 font-medium text-sm ml-6 -mt-2">
                        <span>⭐</span> {ride.ownerRating.toFixed(1)} / 5.0
                      </p>
                    )}
                    <p className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {new Date(ride.startTime).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                        timeZone: "Asia/Colombo"
                      })}
                    </p>
                    <p className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {ride.seatsAvailable} / {ride.totalSeats} seats
                    </p>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-bold text-green-600">
                        Rs {ride.pricePerSeat}
                      </span>
                      <Link
                        to={`/ride/${ride.id}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition font-medium text-sm"
                      >
                        View Details
                      </Link>
                    </div>
                    {user && ride.seatsAvailable > 0 && ride.ownerId !== user.id && (
                      <button
                        onClick={() => {
                          setSelectedRide(ride);
                          setIsModalOpen(true);
                        }}
                        className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition font-medium text-sm flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Request to Join
                      </button>
                    )}
                    {!user && (
                      <Link
                        to="/login"
                        className="block w-full text-center bg-white-600 hover:bg-blue-700 text-black px-3 py-2 rounded-lg transition font-medium text-sm"
                      >
                        Login to Book
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-white py-10">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Why Choose HighwayLink?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Affordable</h3>
              <p className="text-gray-600">Save money by sharing rides with others</p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Safe & Secure</h3>
              <p className="text-gray-600">Verified drivers and passenger profiles</p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Eco-Friendly</h3>
              <p className="text-gray-600">Reduce carbon footprint by carpooling</p>
            </div>
          </div>
        </div>
      </div>

      <SeatSelectionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRide(null);
        }}
        ride={selectedRide}
        onConfirmBooking={handleBookingConfirm}
        loading={bookingLoading}
      />
    </div>
  );
}