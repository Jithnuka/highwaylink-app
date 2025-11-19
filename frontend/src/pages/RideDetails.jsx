import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

export default function RideDetails() {
  const { id } = useParams();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRide = async () => {
      try {
        const res = await api.get(`/rides/${id}`);
        if (!res.data) {
          setError("Ride not found.");
        } else {
          setRide(res.data);
        }
      } catch (err) {
        console.error(err);
        setError(err?.response?.data?.message || "Failed to load ride details");
      } finally {
        setLoading(false);
      }
    };
    fetchRide();
  }, [id]);

  if (loading)
    return (
      <div className="text-center py-6 text-gray-500">
        Loading ride details...
      </div>
    );

  if (error)
    return (
      <div className="text-center py-6 text-red-600 font-medium">{error}</div>
    );

  const formattedStartTime = ride.startTime
    ? new Date(ride.startTime).toLocaleString("en-GB")
    : "Not specified";

  const formattedCreatedAt = ride.createdAt
    ? new Date(ride.createdAt).toLocaleDateString("en-GB")
    : "Unknown";

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-md rounded-xl p-6 mt-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        {ride.origin} → {ride.destination}
      </h1>

      <div className="space-y-2 text-gray-700">
        <p>
          <span className="font-semibold">Owner:</span> {ride.ownerName || "Unknown"}
        </p>
        <p>
          <span className="font-semibold">Contact:</span> {ride.ownerContact || "N/A"}
        </p>
        <p>
          <span className="font-semibold">Start Time:</span> {formattedStartTime}
        </p>
        <p>
          <span className="font-semibold">Schedule:</span> {ride.schedule || "N/A"}
        </p>
        <p>
          <span className="font-semibold">Seats Available:</span> {ride.seatsAvailable} / {ride.totalSeats}
        </p>
        <p>
          <span className="font-semibold">Price per Seat:</span> Rs {ride.pricePerSeat}
        </p>

        {ride.description && (
          <p className="mt-3 border-t pt-2 text-gray-600">{ride.description}</p>
        )}
      </div>
      <div className="mt-6 text-gray-500 text-sm">
        Created on: {formattedCreatedAt}
      </div>
    </div>
  );
}
