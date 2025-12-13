import React, { useState, useEffect, useContext, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../contexts/AuthContext";

export default function Home() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const { user } = useContext(AuthContext);
  const hasFetched = useRef(false); // Prevent double fetch in strict mode
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
      
      const params = new URLSearchParams();
      if (origin.trim()) params.append("origin", origin.trim());
      if (destination.trim()) params.append("destination", destination.trim());
      
      const url = `/rides/public${params.toString() ? `?${params.toString()}` : ''}`;
      
      const res = await api.get(url, {
        signal: abortControllerRef.current.signal
      });
      
      setRides(res.data);
    } catch (err) {
      if (err.name !== 'CanceledError') {
        console.error("Error fetching rides:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Prevent double fetch in React 18 Strict Mode during development
    if (hasFetched.current) return;
    hasFetched.current = true;

    fetchRides();

    // Cleanup function to abort request if component unmounts
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRides();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20 px-6 text-center">
        <h1 className="text-5xl font-extrabold mb-4">Welcome to HighwayLink</h1>
        <p className="text-xl mb-8">Find and share rides across Sri Lanka - Safe, affordable, and eco-friendly</p>
        
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
        <div className="bg-white shadow-2xl rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            🔍 Search Available Rides
          </h2>
          
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Origin (e.g., Colombo)"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            
            <input
              type="text"
              placeholder="Destination (e.g., Kandy)"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-semibold transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {loading ? "Searching..." : "Search Rides"}
            </button>
          </form>
        </div>
      </div>

      {/* Available Rides */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading available rides...</p>
          </div>
        ) : rides.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-md">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-xl font-medium text-gray-900">No rides found</h3>
            <p className="mt-2 text-gray-500">Try adjusting your search or check back later</p>
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
                  className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-xl font-bold text-gray-800">
                      {ride.origin} → {ride.destination}
                    </h4>
                    {ride.seatsAvailable === 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        Full
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 text-gray-600 mb-4">
                    <p className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {ride.ownerName}
                    </p>
                    <p className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {new Date(ride.startTime).toLocaleString()}
                    </p>
                    <p className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {ride.seatsAvailable} / {ride.totalSeats} seats
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-2xl font-bold text-green-600">
                      Rs {ride.pricePerSeat}
                    </span>
                    {user ? (
                      <Link
                        to={`/ride/${ride.id}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition font-medium"
                      >
                        View Details
                      </Link>
                    ) : (
                      <Link
                        to="/login"
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition font-medium"
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
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
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
    </div>
  );
}