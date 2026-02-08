import React, { useState } from "react";
import { Link } from "react-router-dom";
import ReviewModal from "./ReviewModal";

export default function RideCard({ ride, onRequestJoin, onViewMap, isOwnerView = false, currentUserId, onStartRide, onEndRide, showReviewPrompt = false, onReviewSubmitted, driver }) {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const start = ride.startTime ? new Date(ride.startTime).toLocaleString("en-GB", { timeZone: "Asia/Colombo" }) : "N/A";

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
      className={`rounded-xl shadow-md p-5 flex flex-col md:flex-row justify-between gap-4 transition-shadow duration-300 ${ride.active === false ? "bg-gray-100 border border-red-300 opacity-70" : "bg-white hover:shadow-xl"
        }`}
    >
      <div>
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          {ride.origin} → {ride.destination}
          {!ride.active && (
            <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded">Canceled</span>
          )}
          {ride.status && (
            <span className={`text-xs px-2 py-0.5 rounded ${ride.status === "COMPLETED" ? "bg-green-500 text-white" :
              ride.status === "IN_PROGRESS" ? "bg-yellow-500 text-black" :
                ride.status === "SCHEDULED" ? "bg-blue-500 text-white" :
                  "bg-gray-500 text-white"
              }`}>
              {ride.status}
            </span>
          )}
        </h3>

        {/* Ongoing Ride Indicator */}
        {ride.status === "IN_PROGRESS" && ride.active && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-yellow-800">Ride in Progress</span>
            </div>
            <div className="text-xs text-yellow-700">
              {isOwnerView ? "You are currently driving this ride" : "This ride is currently ongoing"}
            </div>
          </div>
        )}

        {/* Completed Ride Indicator */}
        {ride.status === "COMPLETED" && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-semibold text-green-800">Ride Completed</span>
            </div>
            {!isOwnerView && approvedPassengers.some(p => p.id === currentUserId) && (
              <div className="text-xs text-green-700">
                Share your experience by leaving a review
              </div>
            )}
          </div>
        )}

        <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
          Owner: {ride.ownerName}
          {ride.ownerRating > 0 ? (
            <span className="flex items-center gap-1 text-yellow-600 font-medium ml-2">
              ⭐ {ride.ownerRating.toFixed(1)}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-gray-400 font-medium ml-2 text-xs">
              (New)
            </span>
          )}
        </div>
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
          <div className="text-sm text-gray-400">Created: {ride.createdAt ? new Date(ride.createdAt).toLocaleDateString("en-GB", { timeZone: "Asia/Colombo" }) : "N/A"}</div>
        </div>

        <div className="mt-3 flex flex-col md:flex-row gap-2 items-end">
          {/* Owner Actions: Start/End Ride */}
          {isOwnerView && ride.active && (
            <div className="flex gap-2 mb-2">
              {ride.status === "SCHEDULED" && onStartRide && (
                <button
                  onClick={() => onStartRide(ride.id)}
                  className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition"
                >
                  Start Ride
                </button>
              )}
              {ride.status === "IN_PROGRESS" && onEndRide && (
                <button
                  onClick={() => onEndRide(ride.id)}
                  className="px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition"
                >
                  End Ride
                </button>
              )}
            </div>
          )}

          <Link
            to={`/ride/${ride.id}`}
            className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition"
          >
            Details
          </Link>

          {/* Review button for passengers on completed rides */}
          {!isOwnerView && ride.status === "COMPLETED" && approvedPassengers.some(p => p.id === currentUserId) && (
            <button
              onClick={() => setShowReviewModal(true)}
              className="px-3 py-2 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 transition flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Review
            </button>
          )}

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

      {/* Review Modal */}
      {showReviewModal && driver && (
        <ReviewModal
          ride={ride}
          driver={driver}
          onClose={() => setShowReviewModal(false)}
          onReviewSubmitted={() => {
            setShowReviewModal(false);
            if (onReviewSubmitted) onReviewSubmitted();
          }}
        />
      )}
    </div>
  );
}
