import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../contexts/AuthContext";

export default function RideDetails() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const nav = useNavigate();
  const [ride, setRide] = useState(null);
  const [ownerDetails, setOwnerDetails] = useState(null);
  const [passengerDetails, setPassengerDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRideAndUsers = async () => {
      try {
        // Fetch ride details
        const rideRes = await api.get(`/rides/${id}`);
        if (!rideRes.data) {
          setError("Ride not found.");
          setLoading(false);
          return;
        }
        const rideData = rideRes.data;
        setRide(rideData);

        // Fetch owner details
        if (rideData.ownerId) {
          try {
            const ownerRes = await api.get(`/users/${rideData.ownerId}`);
            setOwnerDetails(ownerRes.data);
          } catch (err) {
            console.error("Failed to fetch owner details:", err);
          }
        }

        // Fetch approved passenger details
        if (rideData.acceptedPassengers && rideData.acceptedPassengers.length > 0) {
          const passengerPromises = rideData.acceptedPassengers.map(async (passenger) => {
            const passengerId = typeof passenger === "object" ? passenger.id : passenger;
            try {
              const passengerRes = await api.get(`/users/${passengerId}`);
              return passengerRes.data;
            } catch (err) {
              console.error(`Failed to fetch passenger ${passengerId}:`, err);
              return null;
            }
          });
          
          const passengers = await Promise.all(passengerPromises);
          setPassengerDetails(passengers.filter(p => p !== null));
        }

      } catch (err) {
        console.error(err);
        setError(err?.response?.data?.message || "Failed to load ride details");
      } finally {
        setLoading(false);
      }
    };

    fetchRideAndUsers();
  }, [id]);

  const getGenderIcon = (gender) => {
    if (!gender) return "👤";
    switch (gender.toUpperCase()) {
      case "MALE": return "👨";
      case "FEMALE": return "👩";
      case "OTHER": return "🧑";
      default: return "👤";
    }
  };

  const getGenderColor = (gender) => {
    if (!gender) return "bg-gray-100 text-gray-700";
    switch (gender.toUpperCase()) {
      case "MALE": return "bg-blue-100 text-blue-700";
      case "FEMALE": return "bg-pink-100 text-pink-700";
      case "OTHER": return "bg-purple-100 text-purple-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading ride details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <p className="text-xl font-semibold text-red-600">{error}</p>
          <button
            onClick={() => nav(-1)}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const formattedStartTime = ride.startTime
    ? new Date(ride.startTime).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    : "Not specified";

  const formattedCreatedAt = ride.createdAt
    ? new Date(ride.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      })
    : "Unknown";

  const isOwner = user && ride.ownerId === user.id;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
            onClick={() => nav(-1)}
            className="mb-4 flex items-center gap-2 bg-transparent text-blue-600 hover:text-blue-700 font-medium"
          >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        {/* Main Card */}
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
            <h1 className="text-3xl font-bold mb-2">
              {ride.origin} → {ride.destination}
            </h1>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                ride.active ? "bg-green-500" : "bg-red-500"
              }`}>
                {ride.active ? "Active" : "Canceled"}
              </span>
              <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm">
                {ride.schedule || "One-time"}
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Ride Information */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Ride Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-xs text-gray-500">Departure Time</p>
                    <p className="font-semibold text-gray-800">{formattedStartTime}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <div>
                    <p className="text-xs text-gray-500">Seats</p>
                    <p className="font-semibold text-gray-800">
                      {ride.seatsAvailable} / {ride.totalSeats} available
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-xs text-gray-500">Price per Seat</p>
                    <p className="font-semibold text-green-600 text-xl">Rs {ride.pricePerSeat}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-xs text-gray-500">Created</p>
                    <p className="font-semibold text-gray-800">{formattedCreatedAt}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Owner Information */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Driver Information
              </h2>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                        {ride.ownerName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-lg">{ride.ownerName}</p>
                        {ownerDetails?.gender && (
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getGenderColor(ownerDetails.gender)}`}>
                            {getGenderIcon(ownerDetails.gender)} {ownerDetails.gender}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-gray-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="font-medium">{ride.ownerContact || "Not provided"}</span>
                    </div>

                    {ownerDetails?.vehicleType && (
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Vehicle Details</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-lg text-sm font-medium text-gray-700 shadow-sm">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0h2.1a2.5 2.5 0 014.9 0H17a1 1 0 001-1v-5l-3-4H3zm1.5 2h10l2.25 3H4.5V6z"/>
                            </svg>
                            {ownerDetails.vehicleType}
                          </span>
                          {ownerDetails.vehicleNumber && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-lg text-sm font-medium text-gray-700 shadow-sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                              {ownerDetails.vehicleNumber}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Approved Passengers */}
            {passengerDetails.length > 0 && (
              <div className="border-t pt-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Approved Passengers ({passengerDetails.length})
                </h2>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {passengerDetails.map((passenger, index) => (
                    <div key={passenger.id || index} className="bg-green-50 rounded-xl p-4 border border-green-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                          {passenger.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{passenger.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {passenger.gender && (
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getGenderColor(passenger.gender)}`}>
                                {getGenderIcon(passenger.gender)} {passenger.gender}
                              </span>
                            )}
                            {passenger.phone && (
                              <span className="text-xs text-gray-600">📞 {passenger.phone}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {ride.description && (
              <div className="border-t pt-6">
                <h2 className="text-lg font-bold text-gray-800 mb-2">Description</h2>
                <p className="text-gray-600">{ride.description}</p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {isOwner && (
            <div className="bg-gray-50 px-6 py-4 border-t">
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                You are the owner of this ride
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
