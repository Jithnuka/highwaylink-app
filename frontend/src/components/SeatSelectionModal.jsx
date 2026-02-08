import React, { useState } from "react";

const SeatSelectionModal = ({
  isOpen,
  onClose,
  ride,
  onConfirmBooking,
  loading
}) => {
  const [selectedSeats, setSelectedSeats] = useState(1);
  const [showConfirmation, setShowConfirmation] = useState(false);

  if (!isOpen || !ride) return null;

  const availableSeats = ride.seatsAvailable || 0;
  const totalSeats = ride.totalSeats || 0;
  const bookedSeats = totalSeats - availableSeats;

  const handleSeatSelection = (seats) => {
    if (seats >= 1 && seats <= availableSeats) {
      setSelectedSeats(seats);
    }
  };

  const handleNext = () => {
    if (selectedSeats > 0 && selectedSeats <= availableSeats) {
      setShowConfirmation(true);
    }
  };

  const handleConfirmBooking = async () => {
    try {
      await onConfirmBooking(selectedSeats);
      onClose();
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const totalCost = (ride.pricePerSeat || 0) * selectedSeats;

  if (showConfirmation) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition bg-white"
            disabled={loading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Success Icon */}
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 rounded-full p-4">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">Confirm Your Booking</h2>
          <p className="text-gray-600 text-center mb-6">Please review your booking details</p>

          {/* Booking Details */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Route:</span>
              <span className="font-semibold text-gray-800">{ride.origin} → {ride.destination}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Date & Time:</span>
              <span className="font-medium text-gray-800">
                {new Date(ride.startTime).toLocaleString("en-GB", { timeZone: "Asia/Colombo" })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Driver:</span>
              <span className="font-medium text-gray-800">{ride.ownerName}</span>
            </div>
            <div className="border-t border-gray-200 pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Seats Requested:</span>
                <span className="font-bold text-blue-600 text-lg">{selectedSeats}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-600">Price per Seat:</span>
                <span className="font-medium text-gray-800">Rs {ride.pricePerSeat || 0}</span>
              </div>
              <div className="flex justify-between items-center mt-2 text-lg">
                <span className="font-semibold text-gray-800">Total Amount:</span>
                <span className="font-bold text-green-600">Rs {totalCost}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={() => setShowConfirmation(false)}
              className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-xl font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              Back
            </button>
            <button
              onClick={handleConfirmBooking}
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Confirm Booking'
              )}
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            Your request will be sent to the driver for approval
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition bg-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-2xl font-bold mb-2 text-gray-800">Select Your Seats</h2>
        <p className="text-gray-600 mb-6">Choose how many seats you need for this ride</p>

        {/* Ride Info */}
        <div className="bg-blue-50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Available Seats:</span>
            <span className="text-2xl font-bold text-blue-600">
              {availableSeats} / {totalSeats}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            <p className="font-medium text-gray-800">{ride.origin} → {ride.destination}</p>
            <p className="mt-1">{new Date(ride.startTime).toLocaleString("en-GB", { timeZone: "Asia/Colombo" })}</p>
          </div>
        </div>

        {/* Seat Selection Controls */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Number of Seats
          </label>

          {/* Number Input with +/- Controls */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <button
              onClick={() => handleSeatSelection(selectedSeats - 1)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold w-12 h-12 rounded-full transition disabled:opacity-30 disabled:cursor-not-allowed"
              disabled={selectedSeats <= 1}
            >
              −
            </button>
            <input
              type="number"
              min="1"
              max={availableSeats}
              value={selectedSeats}
              onChange={(e) => handleSeatSelection(parseInt(e.target.value))}
              className="w-20 text-center text-3xl font-bold text-blue-600 border-2 border-blue-300 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
            <button
              onClick={() => handleSeatSelection(selectedSeats + 1)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold w-12 h-12 rounded-full transition disabled:opacity-30 disabled:cursor-not-allowed"
              disabled={selectedSeats >= availableSeats}
            >
              +
            </button>
          </div>

          {/* Seat Selection Slider */}
          <input
            type="range"
            min="1"
            max={availableSeats}
            value={selectedSeats}
            onChange={(e) => handleSeatSelection(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />

          {/* Visual Seat Indicators */}
          <div className="flex gap-2 mt-4 flex-wrap justify-center">
            {[...Array(totalSeats)].map((_, index) => {
              const isBooked = index < bookedSeats;
              const isSelected = !isBooked && index < bookedSeats + selectedSeats;
              const isAvailable = !isBooked && !isSelected;

              return (
                <div
                  key={index}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-sm transition-all ${isBooked
                    ? 'bg-gray-300 text-gray-500'
                    : isSelected
                      ? 'bg-blue-600 text-white transform scale-110'
                      : 'bg-green-100 text-green-700 border-2 border-green-300'
                    }`}
                  title={isBooked ? 'Booked' : isSelected ? 'Your Selection' : 'Available'}
                >
                  {isBooked ? '✕' : isSelected ? '✓' : index + 1}
                </div>
              );
            })}
          </div>
          <div className="flex justify-center gap-4 mt-3 text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <div className="w-4 h-4 bg-gray-300 rounded"></div> Booked
            </span>
            <span className="flex items-center gap-1">
              <div className="w-4 h-4 bg-blue-600 rounded"></div> Your Selection
            </span>
            <span className="flex items-center gap-1">
              <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div> Available
            </span>
          </div>
        </div>

        {/* Price Summary */}
        <div className="bg-green-50 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium">Total Amount:</span>
            <span className="text-2xl font-bold text-green-600">
              Rs {totalCost}
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Rs {ride.pricePerSeat} × {selectedSeats} seat{selectedSeats > 1 ? 's' : ''}
          </p>
        </div>

        {/* Error/Warning Messages */}
        {selectedSeats > availableSeats && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 flex items-start gap-2">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-semibold">Not enough seats available</p>
              <p className="text-sm">Only {availableSeats} seat{availableSeats !== 1 ? 's' : ''} remaining. Please reduce your selection.</p>
            </div>
          </div>
        )}

        {availableSeats === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-xl mb-4 flex items-start gap-2">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-semibold">Ride is fully booked</p>
              <p className="text-sm">This ride has no available seats. Please check other rides or try again later.</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleNext}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={selectedSeats > availableSeats || selectedSeats < 1 || availableSeats === 0}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionModal;