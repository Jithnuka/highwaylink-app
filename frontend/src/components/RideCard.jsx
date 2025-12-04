import React from "react";
import { Link } from "react-router-dom";

export default function RideCard({ ride, onRequestJoin, onViewMap, isOwnerView = false, currentUserId }) {
  const start = ride.startTime ? new Date(ride.startTime).toLocaleString() : "N/A";

  // Normalize approvedPassengers
  const approvedPassengers = Array.from(
    new Map(
      (ride.acceptedPassengers || []).map(p => {
        const id = typeof p === "object" ? p.id : p;
        const name = typeof p === "object" ? p.name : `User (${id})`;
        return [id, { id, name }];
      })
    ).values()
  );

  // Normalize pending requests
  const pendingRequests = Array.from(
    new Map(
      (ride.requests || []).map(r => {
        const id = typeof r === "object" ? r.id : r;
        const name = typeof r === "object" ? r.name : `User (${id})`;
        return [id, { id, name }];
      })
    ).values()
  );

  // Determine passenger status for current user
  let passengerStatus = null;
  if (!isOwnerView && currentUserId) {
    if (approvedPassengers.some(p => p.id === currentUserId)) passengerStatus = "Approved";
    else if (pendingRequests.some(p => p.id === currentUserId)) passengerStatus = "Pending";
  }

  return (
    <div
      className={`rounded-xl shadow-md p-5 flex flex-col md:flex-row justify-between gap-4 transition-shadow duration-300 ${
        ride.active === false ? "bg-gray-100 border border-red-300 opacity-70" : "bg-white hover:shadow-xl"
      }`}
    >
      <div>
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          {ride.origin} → {ride.destination}
          {!ride.active && (
            <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded">Canceled</span>
          )}
        </h3>
        <div className="text-sm text-gray-500 mt-1">Owner: {ride.ownerName}</div>
        <div className="text-sm text-gray-500">Start: {start}</div>
        <div className="mt-2 text-sm">Schedule: {ride.schedule}</div>
        <div className="mt-1 text-sm">Seats: {ride.seatsAvailable} / {ride.totalSeats}</div>

        {/* Show passenger status */}
        {!isOwnerView && passengerStatus && (
          <div className="mt-2 text-sm font-medium text-blue-600">
            Status: {passengerStatus}
          </div>
        )}
      </div>

      <div className="flex flex-col justify-between items-end">
        <div className="text-right">
          <div className="text-xl font-bold text-green-600">Rs {ride.pricePerSeat}</div>
          <div className="text-sm text-gray-400">Created: {ride.createdAt ? new Date(ride.createdAt).toLocaleDateString() : "N/A"}</div>
        </div>

        <div className="mt-3 flex flex-col md:flex-row gap-2 items-end">
          <Link
            to={`/ride/${ride.id}`}
            className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition"
          >
            Details
          </Link>

          {onViewMap && (
            <button
              onClick={() => onViewMap(ride)}
              className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Map
            </button>
          )}

          {/* Passenger actions */}
          {!isOwnerView && !passengerStatus && ride.active && ride.seatsAvailable > 0 && (
            <button
              onClick={() => onRequestJoin(ride.id)}
              className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition"
            >
              Join
            </button>
          )}

          {ride.seatsAvailable === 0 && ride.active && (
            <span className="px-3 py-2 bg-gray-300 text-gray-700 rounded text-sm">Full</span>
          )}

          {/* Owner View: Pending Requests */}
          {isOwnerView && ride.active && pendingRequests.length > 0 && (
            <div className="mt-2 text-sm">
              <div className="font-medium text-gray-700">Pending Requests:</div>
              <div className="flex flex-col gap-1 mt-1">
                {pendingRequests.map(req => (
                  <div key={req.id} className="flex items-center gap-2">
                    <span className="text-gray-800 text-xs">{req.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Owner View: Approved Passengers */}
          {isOwnerView && ride.active && ride.acceptedPassengers?.length > 0 && (
            <div className="mt-2 text-sm">
              <div className="font-medium text-green-700">Approved Passengers:</div>
              <div className="flex flex-wrap gap-2 mt-1">
                {approvedPassengers.map((p) => (
                  <span
                    key={p.id}
                    className="inline-block bg-green-200 text-green-800 px-2 py-1 rounded text-xs"
                  >
                    {p.name} ({p.id})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
